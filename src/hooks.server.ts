import type { Handle } from '@sveltejs/kit';
import { getTenantDb } from '$lib/server/db/manager';
import { dbContext } from '$lib/server/db/context';
import {
	validateSessionToken,
	setSessionTokenCookie,
	deleteSessionTokenCookie,
	sessionCookieName
} from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const tenant = event.url.pathname.split('/').filter(Boolean)[0];

	// No tenant segment — skip everything
	if (!tenant) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const db = getTenantDb(tenant);

	// Unknown tenant
	if (!db) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	event.locals.db = db;
	event.locals.tenant = tenant;

	// Everything from here — auth AND route handlers — runs inside
	// the same dbContext so getDb() always resolves correctly
	return dbContext.run(db, async () => {
		const sessionToken = event.cookies.get(sessionCookieName);

		if (!sessionToken) {
			event.locals.user = null;
			event.locals.session = null;
			return resolve(event);
		}

		const { session, user } = await validateSessionToken(sessionToken);

		if (session) {
			setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} else {
			deleteSessionTokenCookie(event);
		}

		event.locals.user = user;
		event.locals.session = session;

		return resolve(event);
	});
};
