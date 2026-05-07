import { zod4 } from 'sveltekit-superforms/adapters';
import { addCustomer } from '$lib/ZodSchema';

import type { PageServerLoad } from '../$types';
import { superValidate } from 'sveltekit-superforms';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
	const form = await superValidate(zod4(addCustomer));

	const layoutData = await parent();
	const permList = layoutData.permList;
	const perm = 'view:customers';

	const hasPerm = permList?.some((p) => p.name === perm);

	if (!hasPerm) {
		error(
			403,
			'Not Allowed! You do not have permission to see customers. <br /> Talk to an admin to change it.'
		);
	}

	return {
		form
	};
};
