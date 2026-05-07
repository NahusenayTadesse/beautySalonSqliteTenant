// This is the file your whole app already imports from
// The proxy makes db.select() etc. work at import time
// without needing the actual connection yet

import { getDb } from './context';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import type * as schema from './schema';

type DB = LibSQLDatabase<typeof schema>;

// Proxy intercepts every property access (select, insert, etc.)
// and delegates to the live db for the current request
export const db = new Proxy({} as DB, {
	get(_, prop) {
		return getDb()[prop as keyof DB];
	}
});
