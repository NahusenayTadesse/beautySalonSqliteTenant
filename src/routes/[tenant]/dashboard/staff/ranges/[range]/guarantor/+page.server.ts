import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { fail } from 'sveltekit-superforms';
import { setFlash } from 'sveltekit-flash-message/server';

import { addGuarantor, editGuarantor } from '../schema';
import { saveUploadedFile } from '$lib/server/upload';

import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { staff, employeeGuarantor } from '$lib/server/db/schema';
export const load: PageServerLoad = async ({ params }) => {
	const { range } = params;
	const id = range.split('-').pop()!;
	const editGuarantorForm = await superValidate(zod4(editGuarantor));
	const addGuarantorForm = await superValidate(zod4(addGuarantor));

	const guarantor = await db
		.select()
		.from(employeeGuarantor)
		.where(eq(employeeGuarantor.staffId, Number(id)))
		.then((rows) => rows[0]);

	return {
		addGuarantorForm,
		editGuarantorForm,
		guarantor
	};
};

export const actions: Actions = {
	editGuarantor: async ({ request, locals, params }) => {
		const form = await superValidate(request, zod4(editGuarantor));

		if (!form.valid) {
			return message(form, { type: 'error', text: `Error: check the form` });
		}

		const {
			id,
			name,
			phone,
			email,
			relationship,
			relation,
			jobType,
			company,
			salary,
			photo,
			document,
			govtId,
			street,
			subcity,
			kebele,
			buildingNumber,
			floor,
			houseNumber
		} = form.data;

		try {
			// Use a single transaction
			await db.transaction(async (tx) => {
				// 1. Fetch old files using the transaction client 'tx'
				const existing = await tx
					.select()
					.from(employeeGuarantor)
					.where(eq(employeeGuarantor.id, id))
					.then((row) => row[0]);

				// if (!existing) throw new Error('Guarantor not found');

				// 2. Helper to handle file logic consistently
				const resolveFile = async (newVal, oldVal) => {
					if (newVal instanceof File && newVal.size > 0) {
						return await saveUploadedFile(newVal);
					}
					return oldVal;
				};

				const newPhoto = await resolveFile(photo, existing.photo);
				const newDocument = await resolveFile(document, existing.gurantorDocument);
				const newGovtId = await resolveFile(govtId, existing.govtId);

				// 3. Update using 'tx'
				await tx
					.update(employeeGuarantor)
					.set({
						name,
						phone,
						email,
						relationship,
						relation,
						jobType,
						company,
						street,
						subcity,
						kebele,
						buildingNumber,
						floor,
						houseNumber,
						salary: String(salary),
						photo: newPhoto,
						gurantorDocument: newDocument,
						govtId: newGovtId,
						updatedBy: locals?.user?.id
					})
					.where(eq(employeeGuarantor.id, Number(id)));

				return message(form, {
					type: 'success',
					text: 'Guarantor Details Updated Successfully!'
				});
			});
		} catch (err) {
			console.error('Database Error:', err);
			return message(form, {
				type: 'error',
				text: `Update failed: ${err instanceof Error ? err.message : 'Unknown error'}`
			});
		}
	},
	addGuarantor: async ({ request, locals, params }) => {
		const { range } = params;
		const id = range.split('-').pop()!;
		const form = await superValidate(request, zod4(addGuarantor));

		if (!form.valid) {
			return message(form, { type: 'error', text: `Error: check the form` });
		}

		const {
			name,
			phone,
			email,
			relationship,
			relation,
			jobType,
			company,
			salary,
			photo,
			document,
			govtId,
			street,
			subcity,
			kebele,
			buildingNumber,
			floor,
			houseNumber
		} = form.data;

		try {
			// Use a single transaction
			await db.transaction(async (tx) => {
				// 1. Fetch old files using the transaction client 'tx'

				const newPhoto = await saveUploadedFile(photo);
				const newDocument = await saveUploadedFile(document);
				const newGovtId = await saveUploadedFile(govtId);

				// 3. Update using 'tx'
				await tx.insert(employeeGuarantor).values({
					name,
					staffId: Number(id),
					phone,
					email,
					relationship,
					relation,
					jobType,
					company,
					salary: String(salary),
					photo: newPhoto,
					gurantorDocument: newDocument,
					govtId: newGovtId,
					createdBy: locals?.user?.id,
					street,
					subcity,
					kebele,
					buildingNumber,
					floor,
					houseNumber
				});

				return message(form, {
					type: 'success',
					text: 'Guarantor Details Updated Successfully!'
				});
			});
		} catch (err) {
			console.error(err?.message);
			return message(form, {
				type: 'error',
				text: `Update failed: ${err instanceof Error ? err.message : 'Unknown error'}`
			});
		}
	}
};
