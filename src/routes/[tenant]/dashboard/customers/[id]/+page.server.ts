import { zod4 } from 'sveltekit-superforms/adapters';
import { editCustomer } from './schema.ts';
import { db } from '$lib/server/db';
import {
	appointments,
	customers,
	paymentMethods,
	transactionBookingFee,
	transactions,
	user
} from '$lib/server/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import type { PageServerLoad } from '../$types';
import { superValidate } from 'sveltekit-superforms';
import { type Actions } from '@sveltejs/kit';
import { fail, message } from 'sveltekit-superforms';
import { setFlash } from 'sveltekit-flash-message/server';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { id } = params;

	const form = await superValidate(zod4(editCustomer));

	const [customer] = await db
		.select({
			id: customers.id,
			firstName: customers.firstName,
			lastName: customers.lastName,
			gender: customers.gender,
			customerId: customers.id,
			phone: customers.phone,
			appointmentCount: sql<number>`COUNT(${appointments.id})`,
			joinedOn: sql<string>`strftime('%Y-%m-%d', ${customers.createdAt})`,
			daysSinceJoined: sql<number>`CAST(julianday('now') - julianday(${customers.createdAt}) AS INTEGER)`,

			time: sql<string>`strftime('%H:%M', ${appointments.appointmentTime})`,
			addedBy: user.name,
			addedById: user.id
		})
		.from(customers)
		.leftJoin(appointments, eq(customers.id, appointments.customerId))
		.leftJoin(user, eq(customers.createdBy, user.id))
		.where(eq(customers.id, Number(id)))
		.groupBy(
			customers.id,
			user.name,
			customers.createdAt,
			customers.firstName,
			customers.lastName,
			customers.phone
		)
		.limit(1);

	const reciepts = await db
		.select({
			id: customers.id,
			customerName: sql<string>`TRIM(CONCAT(${customers.firstName}, ' ', COALESCE(${customers.lastName}, '')))`,

			appointmentDate: appointments.appointmentDate,
			amount: transactions.amount,
			booker: user.id,
			recievedBy: user.name,
			paidAt: transactions.createdAt,
			recieptLink: transactions.recieptLink
		})
		.from(transactionBookingFee)
		.innerJoin(appointments, eq(transactionBookingFee.appointmentId, appointments.id))
		.leftJoin(customers, eq(appointments.customerId, customers.id))
		.leftJoin(transactions, eq(transactionBookingFee.transactionId, transactions.id))
		.leftJoin(user, eq(transactions.createdBy, user.id))
		.where(eq(appointments.id, Number(id)))
		.orderBy(transactions.createdAt);

	const allMethods = await db
		.select({
			value: paymentMethods.id,
			name: paymentMethods.name,
			description: paymentMethods.description
		})
		.from(paymentMethods)
		.where(eq(paymentMethods.isActive, true));

	return {
		customer,
		form,
		allMethods,
		reciepts
	};
};

export const actions: Actions = {
	editCustomer: async ({ request, locals, cookies }) => {
		const form = await superValidate(request, zod4(editCustomer));

		if (!form.valid) {
			// Stay on the same page and set a flash message
			setFlash({ type: 'error', message: 'Please check your form.' }, cookies);
			return fail(400, { form });
		}
		const { firstName, lastName, gender, phone, customerId } = form.data;

		try {
			await db
				.update(customers)
				.set({
					firstName,
					lastName,
					gender: gender === 'male' || gender === 'female' ? gender : undefined,
					phone,
					updatedBy: locals?.user?.id
				})
				.where(eq(customers.id, customerId));

			// Stay on the same page and set a flash message
			setFlash({ type: 'success', message: 'Customer updated Successfully Added' }, cookies);
			return message(form, { type: 'success', text: 'Customer updated Successfully Added' });
		} catch (err) {
			console.error('Error' + err);
			setFlash({ type: 'error', message: 'Error: Something Went Wrong Try Again' }, cookies);

			return message(form, { type: 'error', text: 'Error: Something Went Wrong Try Again' });
		}
	},
	delete: async ({ cookies, params }) => {
		const { id } = params;

		try {
			if (!id) {
				setFlash({ type: 'error', message: `Unexpected Error: ${err?.message}` }, cookies);
				return fail(400);
			}

			await db.delete(customers).where(eq(customers.id, id));

			setFlash({ type: 'success', message: 'Customer Deleted Successfully!' }, cookies);
		} catch (err) {
			console.error('Error deleting customer:', err);
			setFlash({ type: 'error', message: `Unexpected Error: ${err?.message}` }, cookies);
			return fail(400);
		}
	}
};
