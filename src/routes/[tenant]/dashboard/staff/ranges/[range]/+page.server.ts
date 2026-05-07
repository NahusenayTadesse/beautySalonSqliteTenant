import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { editStaff as schema } from './schema.js';

import { db } from '$lib/server/db';
import {
	staff,
	deductions,
	commissionService,
	commissionProduct,
	bonuses,
	overTime,
	products,
	services,
	transactionProducts,
	transactionServices,
	tipsProduct,
	tipsService,
	staffSchedule,
	employeeTermination,
	staffAccounts,
	staffContacts,
	staffFamilies
} from '$lib/server/db/schema';
import { eq, and, sql, between } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { fail } from 'sveltekit-superforms';
import { setFlash } from 'sveltekit-flash-message/server';

import { saveUploadedFile } from '$lib/server/upload';
import { paymentMethods } from '$lib/server/fastData';

import { currentMonthFilter } from '$lib/global.svelte';
import {
	addSchedule,
	editSchedule,
	terminate,
	reinstate,
	addAccount,
	editAccount,
	addContact,
	editContact,
	addFamily,
	editFamily
} from './schema';

export const load: PageServerLoad = async ({ params }) => {
	const { range } = params;

	const [y1, m1, d1, y2, m2, d2, id] = range.split('-');

	const start = `${y1}-${m1}-${d1}`;
	const end = `${y2}-${m2}-${d2}`;

	// --- Select Commissions (Service) ---
	const serviceCommissions = await db
		.select({
			staffId: commissionService.staffId,
			service: services.name,
			amount: commissionService.amount,
			date: commissionService.commissionDate
		})
		.from(commissionService)
		.leftJoin(transactionServices, eq(commissionService.saleItemId, transactionServices.id))
		.leftJoin(services, eq(transactionServices.serviceId, services.id))

		.where(
			and(
				between(commissionService.commissionDate, start, end),

				eq(commissionService.staffId, Number(id))
			)
		);

	// --- Select Commissions (Product) ---
	const productCommissions = await db // <-- add await
		.select({
			staffId: commissionProduct.staffId,
			product: products.name,
			amount: commissionProduct.amount,
			date: commissionProduct.commissionDate
		})
		.from(commissionProduct)
		.leftJoin(transactionProducts, eq(commissionProduct.saleItemId, transactionProducts.id))
		.leftJoin(products, eq(transactionProducts.productId, products.id))

		.where(
			and(
				eq(commissionProduct.staffId, Number(id)),
				between(commissionProduct.commissionDate, start, end)
			)
		);

	const serviceTips = await db
		.select({
			staffId: tipsService.staffId,
			service: services.name,
			amount: tipsService.amount,
			date: tipsService.tipDate
		})
		.from(tipsService)
		.leftJoin(transactionServices, eq(tipsService.saleItemId, transactionServices.id))
		.leftJoin(services, eq(transactionServices.serviceId, services.id))

		.where(
			and(
				between(tipsService.tipDate, start, end),

				eq(tipsService.staffId, Number(id))
			)
		);

	const productTips = await db // <-- add await
		.select({
			staffId: tipsProduct.staffId,
			product: products.name,
			amount: tipsProduct.amount,
			date: tipsProduct.tipDate
		})
		.from(tipsProduct)
		.leftJoin(transactionProducts, eq(tipsProduct.saleItemId, transactionProducts.id))
		.leftJoin(products, eq(transactionProducts.productId, products.id))

		.where(and(eq(tipsProduct.staffId, Number(id)), between(tipsProduct.tipDate, start, end)));

	// --- Select Bonuses ---
	const staffBonuses = await db
		.select({
			staffId: bonuses.staffId,

			description: bonuses.description,
			amount: bonuses.amount,
			date: bonuses.bonusDate
		})
		.from(bonuses)
		.where(and(eq(bonuses.staffId, id), between(bonuses.bonusDate, start, end)));

	// --- Select Overtime ---
	const staffOvertime = await db
		.select({
			staffId: overTime.staffId,
			description: sql<string>`CONCAT('Overtime (', ${overTime.hours}, ' hours at $', ${overTime.amountPerHour}, '/hr)')`,
			amount: overTime.total,
			date: overTime.date
		})
		.from(overTime)
		.where(and(eq(overTime.staffId, id), between(overTime.date, start, end)));

	// --- Select Deductions ---
	const staffDeductions = await db
		.select({
			staffId: deductions.staffId,
			description: deductions.type, // Using the 'type' column for description
			// Amount is stored as a positive number in the table, but we mark it as a deduction
			amount: deductions.amount,
			date: deductions.deductionDate
		})
		.from(deductions)
		.where(and(eq(deductions.staffId, Number(id)), between(deductions.deductionDate, start, end)));

	const bankList = await paymentMethods();

	// --- Combine all results using unionAll ---

	return {
		staffDeductions,
		staffOvertime,
		productTips,
		serviceTips,
		staffBonuses,
		productCommissions,
		serviceCommissions,

		start,
		end,
		bankList
	};
};

//
export const actions: Actions = {
	editStaff: async ({ request, cookies, locals }) => {
		const form = await superValidate(request, zod4(schema));

		if (!form.valid) {
			// Stay on the same page and set a flash message
			setFlash({ type: 'error', message: 'Please check your form data.' }, cookies);
			return fail(400, { form });
		}

		const {
			staffId,
			firstName,
			lastName,
			grandFatherName,
			position,
			phone,
			email,
			hiredAt,
			govId,
			contract
		} = form.data;

		try {
			const files = await db
				.select({ govtId: staff.govtId, contract: staff.contract })
				.from(staff)
				.where(eq(staff.id, Number(staffId)))
				.then((rows) => rows[0]);
			let newGovId: string | null;
			let newContract: string | null;
			if (govId && govId.size > 0) {
				const imageName = await saveUploadedFile(govId);
				delete form.data.govId;
				newGovId = imageName;
			} else {
				newGovId = files.govtId;
			}

			if (contract && contract.size > 0) {
				const contractName = await saveUploadedFile(contract);
				delete form.data.contract;
				newContract = contractName;
			} else {
				newContract = files.contract;
			}

			await db
				.update(staff)
				.set({
					firstName,
					lastName,
					grandFatherName,
					type: position,
					phone,
					email,
					hireDate: hiredAt ? new Date(hiredAt) : undefined,
					govtId: newGovId,
					contract: newContract,
					updatedBy: locals?.user?.id
				})
				.where(eq(staff.id, Number(staffId)));

			// Stay on the same page and set a flash message
			setFlash({ type: 'success', message: 'Staff Member Updated Successfully!' }, cookies);
			return message(form, { type: 'success', text: 'Staff Member Updated Successfully!' });
		} catch (err) {
			setFlash({ type: 'error', message: `Unexpected Error: ${err?.message}` }, cookies);
			return message(form, {
				type: 'error',
				text: 'An error occurred while updating the staff member. ' + err?.message
			});
		}
	},
	delete: async ({ cookies, params }) => {
		const { range } = params;

		const id = range.split('-').pop()!;

		try {
			if (!id) {
				setFlash({ type: 'error', message: `Unexpected Error: ${err?.message}` }, cookies);
				return fail(400);
			}

			await db.delete(staff).where(eq(staff.id, id));

			setFlash({ type: 'success', message: 'Staff Member Deleted Successfully!' }, cookies);
		} catch (err) {
			console.error('Error deleting staff member:', err);
			setFlash({ type: 'error', message: `Unexpected Error: ${err?.message}` }, cookies);
			return fail(400);
		}
	},
	addSchedule: async ({ request, locals, params }) => {
		const { range } = params;

		const id = range.split('-').pop();
		const form = await superValidate(request, zod4(addSchedule));

		if (!form.valid) {
			return message(form, { type: 'error', text: `Error: check the form` });
		}

		const { day, startTime, endTime, status } = form.data;

		try {
			await db.transaction(async (tx) => {
				await tx.insert(staffSchedule).values({
					weekDay: day,
					startTime,
					staffId: Number(id),
					endTime,
					isActive: status,
					createdBy: locals?.user?.id
				});

				return message(form, {
					type: 'success',
					text: 'Schedule Details Created Successfully!'
				});
			});
		} catch (err) {
			return message(form, {
				type: 'error',
				text: `Creating Schedule failed: ${err instanceof Error ? err.message : 'Unknown error'}`
			});
		}
	},
	editSchedule: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(editSchedule));

		if (!form.valid) {
			return message(form, { type: 'error', text: `Error: check the form` });
		}

		const { id, day, startTime, endTime, status } = form.data;

		try {
			await db.transaction(async (tx) => {
				await tx
					.update(staffSchedule)
					.set({
						weekDay: day,
						startTime,
						endTime,
						isActive: status,
						updatedBy: locals?.user?.id
					})
					.where(eq(staffSchedule.id, id));

				return message(form, {
					type: 'success',
					text: 'Schedule Details Updated Successfully!'
				});
			});
		} catch (err) {
			return message(form, {
				type: 'error',
				text: `Updating Schedule failed: ${err instanceof Error ? err.message : 'Unknown error'}`
			});
		}
	},
	terminate: async ({ params, cookies, request, locals }) => {
		const { range } = params;

		const id = range.split('-').pop();

		const form = await superValidate(request, zod4(terminate));

		if (!form.valid) {
			// Stay on the same page and set a flash message
			return message(form, { type: 'error', text: `Error: check the form` });
		}
		const { reason, terminationDate } = form.data;

		try {
			if (!id) {
				return message(form, { type: 'error', text: `Employee Not Found` });
			}

			// Wrap the database operations in a transaction
			await db.transaction(async (tx) => {
				// 1. Insert the termination record

				await tx.insert(employeeTermination).values({
					staffId: Number(id),
					reason,
					terminationDate,
					createdBy: locals?.user?.id
				});

				await tx
					.update(staff)
					.set({
						employmentStatus: 'terminated',
						terminationDate: new Date(terminationDate) || null,
						isActive: false,
						updatedBy: locals?.user?.id
					})
					.where(eq(staff.id, Number(id)));
			});
			return message(form, { type: 'success', text: 'Staff Member Terminated Successfully!' });
		} catch (err) {
			console.error('Error terminating staff member:', err);
			return message(form, { type: 'error', text: `Unexpected Error: ${err?.message}` });
		}
	},
	reinstate: async ({ params, request, locals }) => {
		const { range } = params;

		const id = range.split('-').pop();

		const form = await superValidate(request, zod4(reinstate));
		if (!form.valid) {
			// Stay on the same page and set a flash message
			return message(form, { type: 'error', text: `Error: check the form` });
		}
		const { newStatus } = form.data;

		try {
			if (!id) {
				return message(form, { type: 'error', text: `Employee Not Found` });
			}

			// Wrap the database operations in a transaction
			await db.transaction(async (tx) => {
				await tx
					.update(staff)
					.set({
						employmentStatus: newStatus,
						isActive: true,
						updatedBy: locals?.user?.id
					})
					.where(eq(staff.id, Number(id)));
			});
			return message(form, { type: 'success', text: 'Staff Member Reinstated Successfully!' });
		} catch (err) {
			console.error('Error terminating Staff Member:', err);
			return message(form, { type: 'error', text: `Unexpected Error: ${err?.message}` });
		}
	},
	addAccount: async ({ request, locals, params }) => {
		const { range } = params;

		const id = range.split('-').pop();
		const form = await superValidate(request, zod4(addAccount));

		if (!form.valid) {
			return message(form, { type: 'error', text: `Error: check the form` });
		}

		const { paymentMethod, accountDetail, status } = form.data;

		try {
			await db.transaction(async (tx) => {
				if (status === true) {
					await tx
						.update(staffAccounts)
						.set({ isActive: false })
						.where(eq(staffAccounts.staffId, Number(id)));
				}
				await tx.insert(staffAccounts).values({
					staffId: Number(id),
					paymentMethodId: paymentMethod,
					accountDetail,
					isActive: status,
					createdBy: locals?.user?.id
				});
			});
			return message(form, {
				type: 'success',
				text: 'Account Details Creating Successfully!'
			});
		} catch (err) {
			return message(form, {
				type: 'error',
				text: `Creating Account failed: ${err instanceof Error ? err.message : 'Unknown error'}`
			});
		}
	},
	editAccount: async ({ request, locals, params }) => {
		const { range } = params;

		const staffId = range.split('-').pop();
		const form = await superValidate(request, zod4(editAccount));
		if (!form.valid) {
			return message(form, { type: 'error', text: `Error: check the form` });
		}

		const { id, paymentMethod, accountDetail, status } = form.data;

		try {
			await db.transaction(async (tx) => {
				if (status === true) {
					await tx
						.update(staffAccounts)
						.set({ isActive: false })
						.where(eq(staffAccounts.staffId, Number(staffId)));
				}
				await tx
					.update(staffAccounts)
					.set({
						paymentMethodId: paymentMethod,
						accountDetail,
						isActive: status,
						updatedBy: locals?.user?.id
					})
					.where(eq(staffAccounts.id, id));
			});
			return message(form, {
				type: 'success',
				text: 'Account Details Updated Successfully!'
			});
		} catch (err) {
			console.error(err?.message);
			return message(form, {
				type: 'error',
				text: `Updated Account failed: ${err instanceof Error ? err.message : 'Unknown error'}`
			});
		}
	},
	addContact: async ({ request, locals, params }) => {
		const { range } = params;

		const id = range.split('-').pop();
		const form = await superValidate(request, zod4(addContact));

		if (!form.valid) {
			return message(form, { type: 'error', text: `Error: check the form` });
		}

		const { contactDetail, contactType, status } = form.data;

		try {
			await db.transaction(async (tx) => {
				await tx.insert(staffContacts).values({
					staffId: Number(id),
					contactDetail,
					contactType,
					isActive: status,
					createdBy: locals?.user?.id
				});

				return message(form, {
					type: 'success',
					text: 'Contact Details Created Successfully!'
				});
			});
		} catch (err) {
			return message(form, {
				type: 'error',
				text: `Creating Contact failed: ${err instanceof Error ? err.message : 'Unknown error'}`
			});
		}
	},
	editContact: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(editContact));

		if (!form.valid) {
			return message(form, { type: 'error', text: `Error: check the form` });
		}

		const { id, contactDetail, contactType, status } = form.data;

		try {
			await db.transaction(async (tx) => {
				await tx
					.update(staffContacts)
					.set({
						contactDetail,
						contactType,
						isActive: status,
						updatedBy: locals?.user?.id
					})
					.where(eq(staffContacts.id, id));

				return message(form, {
					type: 'success',
					text: 'Contact Details Updated Successfully!'
				});
			});
		} catch (err) {
			return message(form, {
				type: 'error',
				text: `Updated Contact failed: ${err instanceof Error ? err.message : 'Unknown error'}`
			});
		}
	},
	addFamily: async ({ request, locals, params }) => {
		const { range } = params;

		const id = range.split('-').pop();
		const form = await superValidate(request, zod4(addFamily));
		if (!form.valid) {
			// Stay on the same page and set a flash message
			return message(form, { type: 'error', text: `Error: check the form` });
		}
		const {
			name,
			gender,
			phone,
			email,
			relationShip,
			otherRelationShip,
			emergencyContact,
			status
		} = form.data;

		try {
			// Wrap the database operations in a transaction
			await db.transaction(async (tx) => {
				// 1. Update the employee identity

				await tx.insert(staffFamilies).values({
					name,
					staffId: Number(id),
					gender,
					phone,
					email,
					relationship: relationShip,
					otherRelationship: otherRelationShip,
					emergencyContact,
					isActive: status,
					createdBy: locals?.user?.id
				});
			});
			return message(form, {
				type: 'success',
				text: 'Family Member Details Added Successfully!'
			});
		} catch (err) {
			console.error('Error added Family Member details:', err);
			return message(form, { type: 'error', text: `Unexpected Error: ${err?.message}` });
		}
	},
	editFamily: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(editFamily));
		if (!form.valid) {
			// Stay on the same page and set a flash message
			return message(form, { type: 'error', text: `Error: check the form` });
		}
		const {
			id,
			name,
			gender,
			phone,
			email,
			relationShip,
			otherRelationShip,
			emergencyContact,
			status
		} = form.data;

		try {
			if (!id) {
				return message(form, { type: 'error', text: `Employee Not Found` });
			}

			// Wrap the database operations in a transaction
			await db.transaction(async (tx) => {
				// 1. Update the employee identity

				await tx
					.update(staffFamilies)
					.set({
						name,
						gender,
						phone,
						email,
						relationship: relationShip,
						otherRelationship: otherRelationShip,
						emergencyContact,
						isActive: status,
						updatedBy: locals?.user?.id
					})
					.where(eq(staffFamilies.id, Number(id)));
			});
			return message(form, {
				type: 'success',
				text: 'Family Member Details Updated Successfully!'
			});
		} catch (err) {
			console.error('Error updating Family Member details:', err);
			return message(form, { type: 'error', text: `Unexpected Error: ${err?.message}` });
		}
	}
};
