import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { createRoleSchema as schema } from '$lib/ZodSchema';
import { db } from '$lib/server/db';
import { permissions } from '$lib/server/db/schema/';
import type { LayoutServerLoad } from './$types.js';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ parent }) => {
	const form = await superValidate(zod4(schema));

	const allPermissions = await db
		.select({
			id: permissions.id,
			name: permissions.name,
			description: permissions.description
		})
		.from(permissions);

	const layoutData = await parent();
	const permList = layoutData.permList;

	if (permList?.length !== allPermissions.length) {
		error(
			403,
			'Not Allowed! You do not have permission to see admin panel. <br /> Talk to an admin to change it.'
		);
	}

	return {
		form,
		allPermissions
	};
};
