import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';

import { staffSchema } from './schema';
import { db } from '$lib/server/db';
import { staffTypes as positions, salaries, staff } from '$lib/server/db/schema/';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types.js';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const permList = layoutData?.permList;
	const perm = 'add:staff';

	const hasPerm = permList?.some((p) => p.name === perm);

	if (!hasPerm) {
		error(
			403,
			'Not Allowed! You do not have permission to add staff. <br /> Talk to an admin to change it.'
		);
	}

	const form = await superValidate(zod4(staffSchema));

	const allPositions = await db
		.select({
			value: positions.id,
			name: positions.name,
			description: positions.description
		})
		.from(positions)
		.where(eq(positions.isActive, true));

	const allStaff = await db
		.select({
			name: staff.firstName
		})
		.from(staff);

	return {
		form,
		allPositions,
		allStaff
	};
};

import { saveUploadedFile } from '$lib/server/upload';

export const actions: Actions = {
	addStaff: async ({ request, locals }) => {
		console.log('connected');
		const form = await superValidate(request, zod4(staffSchema));

		console.log(form);

		if (!form.valid) {
			return message(
				form,
				{ type: 'error', text: 'Please check the form for errors' },
				{ status: 400 }
			);
		}

		const {
			firstName,
			lastName,
			grandFatherName,
			email,
			phone,
			position,
			salary,
			hiredAt,
			contract,
			govId
		} = form.data;

		try {
			const imageName = govId ? await saveUploadedFile(govId) : null;

			const contractName = contract ? await saveUploadedFile(contract) : null;
			await db.transaction(async (tx) => {
				const [staffMember] = await tx
					.insert(staff)
					.values({
						firstName,
						lastName,
						grandFatherName,
						email,
						phone,
						govtId: imageName,
						contract: contractName,
						type: position,
						hireDate: hiredAt ? new Date(hiredAt) : null,
						createdBy: locals.user?.id
					})
					.returning();
				if (salary) {
					await tx.insert(salaries).values({
						startDate: hiredAt ? new Date(hiredAt) : new Date(),
						amount: salary,
						staffId: staffMember.id,
						createdBy: locals.user?.id
					});
				}
				delete form.data.govId;
				delete form.data.contract;
			});

			return message(form, { type: 'success', text: 'Staff Successfully Added' });
		} catch (err) {
			console.error(err);
			return message(form, { type: 'error', text: `Error: ${err.message}` }, { status: 500 });
		}
	}
};
