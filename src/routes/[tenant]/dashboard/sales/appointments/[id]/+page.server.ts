import { db } from '$lib/server/db';
import {
	appointments,
	commissionProduct,
	commissionService,
	customers,
	paymentMethods,
	products as prds,
	reports,
	services as srvs,
	staff,
	tipsProduct,
	tipsService,
	transactionBookingFee,
	transactionProducts,
	transactions,
	transactionServices,
	user
} from '$lib/server/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { salesSchema as schema } from '$lib/zodschemas/salesSchema';

import { setFlash } from 'sveltekit-flash-message/server';

import { error } from '@sveltejs/kit';

export async function load({ locals, params }) {
	const { id } = params;

	const existingBooking = await db
		.select({
			id: transactionServices.id
		})
		.from(transactionServices)
		.where(eq(transactionServices.appointmentId, Number(id)));

	const existingBookingProducts = await db
		.select({
			id: transactionProducts.id
		})
		.from(transactionProducts)
		.where(eq(transactionProducts.appointmentId, Number(id)));

	if (existingBooking.length > 0 || existingBookingProducts.length > 0) {
		return error(400, 'Booking Purchase with this appointment already exists');
	}

	const bookings = await db
		.select({
			customerId: customers.id,
			customerName: sql<string>`
        TRIM(CONCAT(${customers.firstName}, ' ', COALESCE(${customers.lastName}, '')))`,
			totalBookingFees: sql<number>`SUM(${transactions.amount})`
		})
		.from(transactionBookingFee)
		.innerJoin(appointments, eq(transactionBookingFee.appointmentId, appointments.id))
		.leftJoin(customers, eq(appointments.customerId, customers.id))
		.leftJoin(transactions, eq(transactionBookingFee.transactionId, transactions.id))
		.where(eq(appointments.id, Number(id)))
		.groupBy(customers.id, customers.firstName, customers.lastName)
		.then((rows) => rows[0]);

	const fetchedServices = await db
		.select({
			value: srvs.id,
			name: sql<string>`TRIM(CONCAT(${srvs.name}, ' ', COALESCE(CONCAT(${srvs.price}, ' ETB'), '')))`,
			price: srvs.price
		})
		.from(srvs);

	const fetchedProducts = await db
		.select({
			value: prds.id,
			name: sql<string>`TRIM(CONCAT(${prds.name}, ' ', COALESCE(CONCAT(${prds.price}, ' ETB'), '')))`,
			price: prds.price
		})
		.from(prds);

	const fetchedStaff = await db
		.select({
			value: staff.id,
			name: sql<string>`TRIM(CONCAT(${staff.firstName}, ' ', COALESCE(${staff.lastName}, '')))`
		})
		.from(staff);

	const fetchedCustomer = await db
		.select({
			value: customers.id,
			name: sql<string>`TRIM(CONCAT(${customers.firstName}, ' ', COALESCE(${customers.lastName}, '')))`
		})
		.from(customers);

	const form = await superValidate(zod4(schema));

	const allMethods = await db
		.select({
			value: paymentMethods.id,
			name: paymentMethods.name,
			description: paymentMethods.description
		})
		.from(paymentMethods)
		.where(eq(paymentMethods.isActive, true));

	return {
		services: fetchedServices,
		products: fetchedProducts,
		staffes: fetchedStaff,
		customers: fetchedCustomer,
		allMethods,
		bookings,

		form
	};
}

import type { Actions } from '../../$types';
import { saveUploadedFile } from '$lib/server/upload';

export const actions: Actions = {
	addSales: async ({ request, cookies, locals, params }) => {
		const { id } = params;
		const formData = await request.formData();

		const form = await superValidate(formData, zod4(schema));

		if (!form.valid) {
			return message(form, { type: 'error', text: 'Please check the form for errors' });
		}
		console.log(form);

		const { products, services, paymentMethod, total, receipt, generalTip } = form.data;

		const gTip = generalTip / (products.length + services.length);

		const totalTips: number =
			Number(
				products.reduce((acc, p) => acc + p.tip, 0) +
					services.reduce((acc, s) => acc + s.serviceTip, 0)
			) + Number(generalTip);

		try {
			const newTransaction = await db.transaction(async (tx) => {
				// 1. master transaction row
				const [txn] = await tx
					.insert(transactions)
					.values({
						amount: total,
						paymentStatus: 'paid', // or map from UI if you add the field
						paymentMethodId: paymentMethod,
						recieptLink,
						createdBy: locals.user?.id
					})
					.returning();

				const fetchedProducts = await tx // ← tx, not db
					.select({ value: prds.id, price: prds.price, commissionPct: prds.commissionAmount })
					.from(prds);

				const fetchedServices = await tx // ← tx, not db
					.select({ value: srvs.id, price: srvs.price, commissionPct: srvs.commissionAmount })
					.from(srvs);

				// 2. product lines
				if (products.length) {
					const txnPrdId = await tx
						.insert(transactionProducts)
						.values(
							products.map((_, idx) => ({
								transactionId: txn.id,
								staffId: products[idx].staff || null,
								productId: products[idx].product || null,
								quantity: products[idx].noofproducts,
								unitPrice: getPrice(fetchedProducts, Number(products[idx].product)),
								tip: products[idx].tip,
								total:
									Number(getPrice(fetchedProducts, Number(products[idx].product))) *
										Number(products[idx].noofproducts) +
									Number(products[idx].tip || 0),
								createdBy: locals.user?.id,
								appointmentId: Number(id)
							}))
						)
						.returning();

					const today = new Date();

					await tx.insert(commissionProduct).values(
						products.map((_, idx) => ({
							saleItemId: txnPrdId.id,
							staffId: products[idx].staff,
							amount:
								Number(getCommission(fetchedProducts, Number(products[idx].product))) *
								Number(products[idx].noofproducts),
							commissionDate: today,
							createdBy: locals.user?.id
						}))
					);

					await tx.insert(tipsProduct).values(
						products.map((_, idx) => ({
							saleItemId: txnPrdId.id,
							staffId: products[idx].staff,
							amount: Number(products[idx].tip) + Number(gTip),
							tipDate: today,
							createdBy: locals.user?.id
						}))
					);

					await Promise.all(
						products.map((_, idx) =>
							tx
								.update(prds)
								.set({
									quantity: sql`${prds.quantity} - ${products[idx].noofproducts}`
								})
								.where(eq(prds.id, products[idx].product))
						)
					);
				}

				// 4. service lines
				if (services.length) {
					const txnsrvid = await tx
						.insert(transactionServices)
						.values(
							services.map((_, idx) => ({
								transactionId: txn.id,
								staffId: services[idx].staff || null,
								serviceId: services[idx].service || null,
								price: Number(getPrice(fetchedServices, Number(services[idx].service))),
								tip: services[idx].serviceTip,
								total:
									Number(getPrice(fetchedServices, Number(services[idx].service))) +
									Number(services[idx].serviceTip || 0),
								appointmentId: Number(id),
								createdBy: locals.user.ids
							}))
						)
						.returning();
					const today = new Date();
					await tx.insert(commissionService).values(
						services.map((_, idx) => ({
							saleItemId: txnsrvid[idx].id,
							staffId: services[idx].staff,
							amount: Number(getCommission(fetchedServices, Number(services[idx].serviceTip))),
							commissionDate: today,
							createdBy: locals.user?.id
						}))
					);

					await tx.insert(tipsService).values(
						services.map((_, idx) => ({
							saleItemId: txnsrvid[idx].id,
							staffId: services[idx].staff,
							amount: Number(services[idx].serviceTip) + Number(gTip),
							tipDate: today,
							createdBy: locals.user?.id
						}))
					);
				}

				const today = new Date();

				const sumProduct = products.reduce((sum, item) => sum + item.noofproducts, 0);

				const existingReport = await tx
					.select({
						id: reports.id
					})
					.from(reports)
					.where(and(eq(reports.reportDate, sql`CURDATE()`)))
					.then((rows) => rows[0]);

				if (existingReport) {
					await tx
						.update(reports)
						.set({
							productsSold: sql<number>`${reports.productsSold} + ${sumProduct}`,
							servicesRendered: sql<number>`${reports.servicesRendered} + ${services.length}`,
							dailyIncome: sql`${sql`IFNULL(${reports.dailyIncome}, 0)`} + ${total}`,
							totalStaffPaid: sql`${sql`IFNULL(${reports.totalStaffPaid}, 0)`} + ${totalTips}`,
							transactions: sql<number>`${reports.transactions} + 1`
						})
						.where(and(eq(reports.id, existingReport.id)));
				} else {
					await tx.insert(reports).values({
						reportDate: today,
						productsSold: sumProduct,
						servicesRendered: services.length,
						totalStaffPaid: String(totalTips),
						dailyIncome: total,
						transactions: 1
					});
				}

				return txn.id;
			});

			if (receipt && receipt.size > 0 && newTransaction) {
				// Fire and forget — don't await, don't block the user
				saveUploadedFile(receipt)
					.then((recieptLink) =>
						db.update(transactions).set({ recieptLink }).where(eq(transactions.id, newTransaction!))
					)
					.catch((err) => console.error('Receipt upload failed for txn', newTransaction, err));
			}

			return message(form, { type: 'success', text: 'New Sale Successfully Added' });
		} catch (e) {
			console.error(e?.message);
			setFlash({ type: 'error', message: 'Error ' + e?.message }, cookies);
			return message(
				form,
				{ type: 'error', text: 'Error adding sale ' + e?.message },
				{ status: 500 }
			);
		}
	}
};

function getPrice(list: Array<{ value: number; price: string }>, value: number): number {
	const item = list.find((i) => i.value === value);
	return item ? Number(item.price) : 0;
}

function getCommission(
	list: Array<{ value: number; price: string; commissionPct: string | null }>,
	value: number
): number {
	const item = list.find((i) => i.value === value);
	if (!item) return 0;

	const fixedCommissionAmount = Number(item.commissionPct ?? 0);
	return fixedCommissionAmount;
}
