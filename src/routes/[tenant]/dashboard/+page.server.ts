import * as auth from '$lib/server/auth';
import { fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';

import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { appointments, products, reports, supplies } from '$lib/server/db/schema';
import { and, eq, lte, sql } from 'drizzle-orm';
export const load: PageServerLoad = async ({ locals }) => {
	const noOfAppointments = await db
		.select({ count: appointments.id })
		.from(appointments)
		.where(eq(appointments.appointmentDate, new Date()));

	const reorderProducts = await db
		.select({
			name: products.name,
			quantity: products.quantity
		})
		.from(products)
		.where(lte(products.quantity, products.reorderLevel));

	const reorderSupplies = await db
		.select({
			name: supplies.name,
			quantity: supplies.quantity
		})
		.from(supplies)
		.where(lte(supplies.quantity, supplies.reorderLevel));

	const todayReport = await db
		.select({
			id: reports.id,
			bookedAppointments: reports.bookedAppointments,
			productsSold: reports.productsSold,
			serviceRendered: reports.servicesRendered,
			dailyExpenses: reports.dailyExpenses,
			staffPaid: reports.totalStaffPaid,
			dailyIncome: reports.dailyIncome,
			transactions: reports.transactions
		})
		.from(reports)
		.where(eq(reports.reportDate, new Date()))
		.then((rows) => rows[0]);

	return {
		nofAppointments: noOfAppointments.length,
		reorderProducts,
		reorderSupplies,
		todayReport
	};
};

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);

		redirect('/login', { type: 'success', message: 'Logout Successful' }, event.cookies);
	}
};
