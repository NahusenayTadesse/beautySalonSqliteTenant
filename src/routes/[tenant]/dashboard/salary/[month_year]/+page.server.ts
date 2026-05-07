import { db } from '$lib/server/db';
import {
	paymentMethods,
	payrollEntries,
	salaries,
	staff,
	staffTypes,
	staffAccounts,
	commissionProduct,
	commissionService,
	deductions,
	overTime,
	bonuses
} from '$lib/server/db/schema';
import { and, desc, eq, isNull, sql, gte, lte } from 'drizzle-orm';

import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { month_year } = params;

	const [m, y] = month_year.split('_');

	const month = m;
	const year = y;

	// 1. Create Subqueries to aggregate totals per staff member
	const otSub = db
		.select({
			staffId: overTime.staffId,
			total: sql<number>`COALESCE(SUM(${overTime.total}), 0)`.as('total_ot')
		})
		.from(overTime)
		.groupBy(overTime.staffId)
		.as('ot_sub');

	const bonusSub = db
		.select({
			staffId: bonuses.staffId,
			total: sql<number>`COALESCE(SUM(${bonuses.amount}), 0)`.as('total_bonus')
		})
		.from(bonuses)
		.groupBy(bonuses.staffId)
		.as('bonus_sub');

	const commServiceSub = db
		.select({
			staffId: commissionService.staffId,
			total: sql<number>`COALESCE(SUM(${commissionService.amount}), 0)`.as('total_comm_service')
		})
		.from(commissionService)
		.groupBy(commissionService.staffId)
		.as('comm_service_sub');

	const commProductSub = db
		.select({
			staffId: commissionProduct.staffId,
			total: sql<number>`COALESCE(SUM(${commissionProduct.amount}), 0)`.as('total_comm_product')
		})
		.from(commissionProduct)
		.groupBy(commissionProduct.staffId)
		.as('comm_product_sub');

	const deductionSub = db
		.select({
			staffId: deductions.staffId,
			total: sql<number>`COALESCE(SUM(${deductions.amount}), 0)`.as('total_deductions')
		})
		.from(deductions)
		.groupBy(deductions.staffId)
		.as('deduction_sub');

	// 2. Main Query
	const payrollData = await db
		.select({
			id: staff.id,
			staffId: payrollEntries.staffId,
			name: sql<string>`TRIM(CONCAT_WS(' ', ${staff.firstName}, ${staff.lastName}))`,
			department: staffTypes.name,
			month: payrollEntries.month,
			year: payrollEntries.year,
			payStart: payrollEntries.payPeriodStart,
			payEnd: payrollEntries.payPeriodEnd,
			basicSalary: salaries.amount,
			bonusAmount: payrollEntries.bonusAmount,
			netAmount: payrollEntries.netAmount,
			paidAmount: payrollEntries.paidAmount,
			paymentMethod: paymentMethods.name,
			taxAmount: payrollEntries.taxAmount,
			account: staffAccounts.accountDetail,
			status: payrollEntries.status,
			paymentMethodId: payrollEntries.paymentMethodId,
			bank: paymentMethods.name,
			paymentDate: payrollEntries.paymentDate,
			notes: payrollEntries.notes,
			receiptLink: payrollEntries.recieptLink,
			// Now we pull directly from the pre-aggregated subqueries
			overtime: sql<number>`COALESCE(${otSub.total}, 0)`,
			bonus: sql<number>`COALESCE(${bonusSub.total}, 0)`,
			commissionProduct: sql<number>`COALESCE(${commProductSub.total}, 0)`,
			commissionService: sql<number>`COALESCE(${commServiceSub.total}, 0)`,
			deductions: sql<number>`COALESCE(${deductionSub.total}, 0)`,
			totalPay: sql<number>`
				COALESCE(${salaries.amount}, 0) +
				COALESCE(${otSub.total}, 0) +
				COALESCE(${bonusSub.total}, 0) +
				COALESCE(${commServiceSub.total}, 0) +
				COALESCE(${commProductSub.total}, 0) -
				COALESCE(${deductionSub.total}, 0)
			`
		})
		.from(staff)
		.leftJoin(
			payrollEntries,
			and(
				eq(payrollEntries.staffId, staff.id),
				eq(payrollEntries.month, month),
				eq(payrollEntries.year, year)
			)
		)
		.leftJoin(
			staffAccounts,
			and(eq(staffAccounts.staffId, staff.id), eq(staffAccounts.isActive, true))
		)
		.leftJoin(paymentMethods, eq(staffAccounts.paymentMethodId, paymentMethods.id))
		.leftJoin(salaries, and(eq(salaries.staffId, staff.id), isNull(salaries.endDate)))
		.leftJoin(staffTypes, eq(staffTypes.id, staff.type))
		// Join the Subqueries instead of the raw tables
		.leftJoin(otSub, eq(otSub.staffId, staff.id))
		.leftJoin(bonusSub, eq(bonusSub.staffId, staff.id))
		.leftJoin(commServiceSub, eq(commServiceSub.staffId, staff.id))
		.leftJoin(commProductSub, eq(commProductSub.staffId, staff.id))
		.leftJoin(deductionSub, eq(deductionSub.staffId, staff.id))
		.where(eq(staff.isActive, true));
	// Note: You may no longer need the large .groupBy() here because there's
	// no more "multiplication" happening in the main join!

	return {
		payrollData,
		month,
		year
	};
};
