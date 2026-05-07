import { db } from '$lib/server/db';
import { paymentMethods, staff as employee, payrollEntries } from '$lib/server/db/schema';
import { eq, isNull, sql, and, count } from 'drizzle-orm';
import type { PageServerLoad } from '../$types';
export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	const payrollData = await db
		.select({
			id: employee.id,
			name: sql<string>`TRIM(CONCAT_WS(' ', ${employee.firstName}, ${employee.lastName}))`,
			month: payrollEntries.month,
			year: payrollEntries.year,
			basicSalary: payrollEntries.basicSalary,
			paymentMethod: paymentMethods.name,
			bank: paymentMethods.name,
			overTime: payrollEntries.overtimeAmount,
			bonus: payrollEntries.bonusAmount,
			commision: payrollEntries.commissionAmount,
			deductions: payrollEntries.deductions,
			netPay: payrollEntries.netAmount,
			paidAmount: payrollEntries.paidAmount,
			recieptLink: payrollEntries.recieptLink
		})
		.from(payrollEntries)
		.leftJoin(employee, eq(payrollEntries.staffId, employee.id))
		.leftJoin(paymentMethods, eq(payrollEntries.paymentMethodId, paymentMethods.id))
		.where(eq(payrollEntries.staffId, Number(id)));

	return {
		payrollData,
		id
	};
};
