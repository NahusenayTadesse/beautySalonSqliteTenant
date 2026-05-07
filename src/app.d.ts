// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
//
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import type * as schema from '$lib/db/schema';

declare global {
	namespace App {
		interface Locals {
			user: import('$lib/server/auth').SessionValidationResult['user'];
			session: import('$lib/server/auth').SessionValidationResult['session'];
			tenant: string;
			db: LibSQLDatabase<typeof schema>;
		}
		interface PageData {
			flash?: { type: 'success' | 'error'; message: string };
		}
	} // interface Error {}
	// interface Locals {}
} // interface PageData {}
// interface PageState {}

// interface Platform {}
export {};
