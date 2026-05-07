import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';

import { supplyItemSchema as schema } from './schema';
import { db } from '$lib/server/db';
import { supplies, supplyTypes } from '$lib/server/db/schema/';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types.js';
import { setFlash, redirect } from 'sveltekit-flash-message/server';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(schema));
	const typeList = await db
		.select({
			value: supplyTypes.id,
			name: supplyTypes.name
		})
		.from(supplyTypes);

	return {
		form,
		typeList
	};
};

export const actions: Actions = {
	add: async ({ request, cookies, locals }) => {
		const form = await superValidate(request, zod4(schema));

		if (!form.valid) {
			// Stay on the same page and set a flash message
			return message(form, { type: 'error', text: 'Please check your form data.' });
		}

		const {
			name,
			description,
			supplyType,
			unitOfMeasurement,
			otherUnitOfMeasurement,
			reorderLevel
		} = form.data;

		try {
			await db.insert(supplies).values({
				name,
				description,
				supplyTypeId: Number(supplyType),
				quantity: 0,
				unitOfMeasure: unitOfMeasurement === 'other' ? otherUnitOfMeasurement : unitOfMeasurement,
				reorderLevel,
				createdBy: locals?.user?.id
			});

			// Stay on the same page and set a flash message
			return message(form, { type: 'success', text: 'New Supply Successfully Added' });
		} catch (err) {
			return message(form, { type: 'error', text: 'New Supply Failed to Add ' + err?.message });
		}
	}
};
