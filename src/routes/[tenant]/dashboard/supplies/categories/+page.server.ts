import { setError, superValidate, message, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { eq } from 'drizzle-orm';

import { add, edit } from './schema';
import { db } from '$lib/server/db';
import { supplyTypes as department } from '$lib/server/db/schema/';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(add));
	const editForm = await superValidate(zod4(edit));

	const allData = await db
		.select({
			id: department.id,
			name: department.name,
			description: department.description
		})
		.from(department);

	return {
		form,
		editForm,
		allData
	};
};

export const actions: Actions = {
	add: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(add));

		if (!form.valid) {
			return message(form, { type: 'error', text: 'Please check the form for Errors' });
		}

		const { name, description } = form.data;

		try {
			await db.insert(department).values({
				name,
				description
			});

			return message(form, { type: 'success', text: 'Supply Category Successfully Added' });
		} catch (err: any) {
			if (err.code === 'ER_DUP_ENTRY') setError(form, 'name', 'Department already exists.');
			return message(form, {
				type: 'error',
				text:
					err.code === 'ER_DUP_ENTRY'
						? 'Supply Category is already exists. Please choose another one.'
						: err.message
			});
		}
	},
	edit: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(edit));
		if (!form.valid) {
			return fail(400, { form });
		}

		const { id, name, description } = form.data;

		try {
			await db
				.update(department)
				.set({ name, description })
				.where(eq(department.id, Number(id)));
			return message(form, { type: 'success', text: 'Category Successfully Updated' });
		} catch (err: any) {
			if (err.code === 'ER_DUP_ENTRY') return;
			setError(form, 'name', 'Category name already exists.');
			return message(form, {
				type: 'error',
				text:
					err.code === 'ER_DUP_ENTRY'
						? 'Category name is already taken. Please choose another one.'
						: err.message
			});
		}
	}
};
