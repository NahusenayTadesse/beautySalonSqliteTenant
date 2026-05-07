import { setError, superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { eq, and, sql } from 'drizzle-orm';

import { appointmentSchema as schema, existingCustomerAppointment } from '$lib/ZodSchema';
import { db } from '$lib/server/db';
import { products, customers, appointments, reports } from '$lib/server/db/schema/';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types.js';
import { setFlash } from 'sveltekit-flash-message/server';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const layoutData = await parent();
	const permList = layoutData.permList;
	const perm = 'add:appointments';

	const hasPerm = permList?.some((p) => p.name === perm);

	if (!hasPerm) {
		error(
			403,
			'Not Allowed! You do not have permission to add appointments. <br /> Talk to an admin to change it.'
		);
	}
	const form = await superValidate(zod4(schema));
	const existingForm = await superValidate(zod4(existingCustomerAppointment));
	const customersList = await db
		.select({
			value: customers.id,
			// name: customers.firstName
			name: sql<string>`concat(${customers.firstName}, ' ', ${customers.lastName}, ' - ', ${customers.phone})`
		})
		.from(customers);

	return {
		form,
		existingForm,
		customersList
	};
};

export const actions: Actions = {
	addAppointment: async ({ request, cookies, locals }) => {
		const form = await superValidate(request, zod4(schema));

		if (!form.valid) {
			// Stay on the same page and set a flash message
			return message(form, { type: 'error', text: 'Please check your form.' }, { status: 400 });
		}

		const { firstName, lastName, phone, appointmentDate, appointmentTime, notes } = form.data;

		try {
			const [customer] = await db
				.insert(customers)
				.values({
					firstName,
					lastName,
					phone,
					createdBy: locals?.user?.id
				})
				.returning();

			await db.insert(appointments).values({
				customerId: customer.id,
				appointmentDate,
				appointmentTime,
				status: 'pending',
				notes,
				createdBy: locals?.user?.id
			});

			const today = new Date();

			const existingReport = await db
				.select({
					id: reports.id
				})
				.from(reports)
				.where(and(eq(reports.reportDate, sql`CURDATE()`)))
				.then((rows) => rows[0]);

			if (existingReport) {
				await db
					.update(reports)
					.set({
						bookedAppointments: sql<number>`${reports.bookedAppointments} + 1`
					})
					.where(eq(reports.id, existingReport.id));
			} else {
				await db.insert(reports).values({
					reportDate: today,
					bookedAppointments: 1
				});
			}

			return message(form, { type: 'success', text: 'New Appointment Successfully Added' });
		} catch (err) {
			if (err.code === 'ER_DUP_ENTRY') {
				setError(form, 'phone', 'Phone Number already exists.', { status: 400 });
			}
			return message(
				form,
				{
					type: 'error',
					text:
						err.code === 'ER_DUP_ENTRY'
							? 'Phone number is already taken. Please choose another one.'
							: err.message
				},
				{ status: 500 }
			);

			// if (err.code === 'ER_DUP_ENTRY')
			// 	return setError(form, 'phone', 'Phone Number already exists.');

			// return fail(400, {
			// 	form
			// });
		}
	},

	addExistingCustomerAppointment: async ({ request, cookies, locals }) => {
		const form = await superValidate(request, zod4(existingCustomerAppointment));

		if (!form.valid) {
			// Stay on the same page and set a flash message
			return message(form, { type: 'error', text: 'Please Check your form.' }, { status: 400 });
		}
		const { customerId, appointmentDate, appointmentTime, notes } = form.data;

		if (!customerId) {
			setError(form, 'customerId', 'Customer is required.');
			return message(form, { type: 'error', text: 'Customer Name is required' }, { status: 400 });
		}

		try {
			await db.insert(appointments).values({
				customerId,
				appointmentDate,
				appointmentTime,
				status: 'pending',
				notes,
				createdBy: locals?.user?.id
			});

			const today = new Date();

			const existingReport = await db
				.select({
					id: reports.id
				})
				.from(reports)
				.where(and(eq(reports.reportDate, sql`CURDATE()`)))
				.then((rows) => rows[0]);

			if (existingReport) {
				await db
					.update(reports)
					.set({
						bookedAppointments: sql<number>`${reports.bookedAppointments} + 1`
					})
					.where(and(eq(reports.id, existingReport.id)));
			} else {
				await db.insert(reports).values({
					reportDate: today,
					bookedAppointments: 1
				});
			}

			// Stay on the same page and set a flash message
			// setFlash({ type: 'success', message: 'New Appointment Successfully Added' }, cookies);
			return message(form, { type: 'success', text: 'New Appointment Successfully Added' });
		} catch (err) {
			console.error('Error' + err);

			return message(
				form,
				{ type: 'error', text: 'Error: Something Went Wrong Try Again' },
				{ status: 500 }
			);
		}
	}
};
