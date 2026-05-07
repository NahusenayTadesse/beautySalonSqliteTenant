import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';

import { inventoryItemSchema } from './schema';
import { db } from '$lib/server/db';
import {
	products as inventory,
	productCategories,
	productSuppliers as suppliers
} from '$lib/server/db/schema/';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types.js';
import { setFlash } from 'sveltekit-flash-message/server';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const permList = layoutData?.permList;
	const perm = 'add:products';

	const hasPerm = permList?.some((p) => p.name === perm);

	if (!hasPerm) {
		error(
			403,
			'Not Allowed! You do not have permission to see products. <br /> Talk to an admin to change it.'
		);
	}
	const allCategories = await db
		.select({
			value: productCategories.id,
			name: productCategories.name,
			description: productCategories.description
		})
		.from(productCategories)
		.where(eq(productCategories.isActive, true));
	const form = await superValidate(zod4(inventoryItemSchema));

	const supplierList = await db
		.select({
			value: suppliers.id,
			name: suppliers.name
		})
		.from(suppliers)
		.where(eq(suppliers.isActive, true));

	return {
		form,
		allCategories,
		supplierList
	};
};

export const actions: Actions = {
	addProduct: async ({ request, cookies, locals }) => {
		const form = await superValidate(request, zod4(inventoryItemSchema));

		if (!form.valid) {
			// Stay on the same page and set a flash message
			return message(
				form,
				{ type: 'error', text: 'Please check your form data.' },
				{ status: 500 }
			);
		}

		const {
			productName,
			category,
			description,
			commission,
			quantity,
			price,
			supplier,
			reorderLevel,
			costPerUnit
		} = form.data;

		try {
			await db.insert(inventory).values({
				name: productName,
				commissionAmount: commission,
				categoryId: category,
				description,
				quantity,
				price,
				supplier,
				reorderLevel,
				cost: costPerUnit,
				createdBy: locals?.user?.id
			});

			// Stay on the same page and set a flash message

			return message(form, { type: 'success', text: 'New Product Successfully Added' });
		} catch (err) {
			console.error(err);
			return message(
				form,
				{
					type: 'error',
					text: 'An error occurred while adding the product.' + err?.message
				},
				{ status: 500 }
			);
		}
	}
};
