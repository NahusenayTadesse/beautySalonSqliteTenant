import { db } from '$lib/server/db';
import { staff, staffTypes } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ locals }) => {
	let staffList = await db
		.select({
			id: staff.id,
			name: sql<string>`TRIM(CONCAT(${staff.firstName}, ' ', COALESCE(${staff.lastName}, '')))`,

			position: staffTypes.name,
			phone: staff.phone,
			email: staff.email,
			status: staff.employmentStatus,
			years: sql<number>`CAST((julianday('now') - julianday(${staff.hireDate})) / 365.25 AS INTEGER)`
		})
		.from(staff)
		.leftJoin(staffTypes, eq(staffTypes.id, staff.type))
		.where(eq(staff.isActive, true));

	staffList = staffList.map((r) => ({ ...r, years: Number(r.years) }));

	return {
		staffList
	};
};
