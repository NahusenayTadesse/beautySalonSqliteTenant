import { db } from '$lib/server/db';
import { expenses, paymentMethods, expensesType, transactions, user } from '$lib/server/db/schema';
import { and, desc, eq, sql } from 'drizzle-orm';

import { currentMonthFilter } from '$lib/global.svelte';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { range } = params as { range: string };

	const [y1, m1, d1, y2, m2, d2] = range.split('-');

	const start = `${y1}-${m1}-${d1}`;
	const end = `${y2}-${m2}-${d2}`;

	const allTransactions = await db
		.select({
			id: expenses.id,
			date: expenses.createdAt,
			amount: expenses.total,
			reason: expenses.description,
			paymentMethods: paymentMethods.name,
			recievedBy: user.name,
			recievedById: user.id,
			recieptLink: transactions.recieptLink
		})
		.from(expenses)

		.leftJoin(transactions, eq(expenses.transactionId, transactions.id))
		.leftJoin(user, eq(expenses.createdBy, user.id))
		.leftJoin(paymentMethods, eq(transactions.paymentMethodId, paymentMethods.id))
		.where(currentMonthFilter(expenses.createdAt, start, end))
		.groupBy(
			expenses.id,
			expenses.createdAt,
			expenses.total,
			paymentMethods.name,
			user.name,
			user.id,
			transactions.recieptLink
		)
		.orderBy(desc(transactions.createdAt));

	return {
		allTransactions,
		start,
		end
	};
};
