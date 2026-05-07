import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';

import { serviceSchema } from '$lib/ZodSchema';
import { db } from '$lib/server/db';
import { services, serviceCategories } from '$lib/server/db/schema/';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types.js';
import { setFlash } from 'sveltekit-flash-message/server';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const permList = layoutData?.permList;
	const perm = 'add:services';

	const hasPerm = permList?.some((p) => p.name === perm);

	if (!hasPerm) {
		error(
			403,
			'Not Allowed! You do not have permission to add services. <br /> Talk to an admin to change it.'
		);
	}
	const form = await superValidate(zod4(serviceSchema));
	const categories = await db
		.select({
			value: serviceCategories.id,
			name: serviceCategories.name,
			description: serviceCategories.description
		})
		.from(serviceCategories)
		.where(eq(serviceCategories.isActive, true));

	return {
		form,
		categories
	};
};

export const actions: Actions = {
	addProduct: async ({ request, cookies, locals }) => {
		const form = await superValidate(request, zod4(serviceSchema));

		if (!form.valid) {
			setFlash({ type: 'error', message: 'Please check your form data.' }, cookies);
			return fail(400, {
				form
			});
		}

		const { serviceName, category, commission, description, durationMinutes, price } = form.data;

		try {
			await db.insert(services).values({
				name: serviceName,
				categoryId: category,
				description,
				durationMinutes,
				commission: commission ?? 0,
				price,
				createdBy: locals?.user?.id
			});
			// setFlash({ type: 'success', message: 'Service added successfully.' }, cookies);
			return message(form, { type: 'success', text: 'Service added successfully' });
		} catch (err) {
			console.log(err);
			// setFlash(
			// 	{ type: 'error', message: 'An error occurred while adding the service. ' + err?.message },
			// 	cookies
			// );
			return message(
				form,
				{
					type: 'error',
					text: 'An error occurred while adding the service. ' + err?.message
				},
				{
					status: 500
				}
			);
		}
	}
};
