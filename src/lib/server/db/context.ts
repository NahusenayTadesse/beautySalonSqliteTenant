import { AsyncLocalStorage } from 'node:async_hooks';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import type * as schema from './schema';

type DB = LibSQLDatabase<typeof schema>;

// Holds one db reference per async request context
export const dbContext = new AsyncLocalStorage<DB>();

// What every file in your app imports
export function getDb(): DB {
	const db = dbContext.getStore();
	if (!db) throw new Error('No database found for this request. Is the tenant set?');
	return db;
}
