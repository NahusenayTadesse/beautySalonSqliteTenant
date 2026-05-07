import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCurrentMonthRange } from '$lib/global.svelte';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const permList = layoutData?.permList;
	const perm = 'view:reports';

	const hasPerm = permList?.some((p) => p.name === perm);

	if (!hasPerm) {
		error(
			403,
			'Not Allowed! You do not have permission to see reports. <br /> Talk to an admin to change it.'
		);
	}

	redirect(303, `/dashboard/reports/${getCurrentMonthRange()}`);
};
