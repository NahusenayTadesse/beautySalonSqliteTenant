import { loadFlash } from 'sveltekit-flash-message/server';

import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = loadFlash(async (event) => {
	if (!event.locals.db) {
		// Tenant doesn't exist or is invalid
		error(404, `No database found for "${event.params.tenant}"`);
	}

	return { tenant: event.locals.tenant };
});
