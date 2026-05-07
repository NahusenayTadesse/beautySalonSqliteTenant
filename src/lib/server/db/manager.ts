import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';
import path from 'node:path';
import fs from 'node:fs';

type DB = LibSQLDatabase<typeof schema>;

const globalCache = globalThis as typeof globalThis & {
	__dbConnections?: Map<string, DB>;
};

const connections: Map<string, DB> =
	globalCache.__dbConnections ?? (globalCache.__dbConnections = new Map());

function isSafeTenantName(tenant: string): boolean {
	return /^[a-zA-Z0-9_-]+$/.test(tenant);
}

// Absolute path to wherever your .db files live
const DB_DIR = path.resolve('databases');

export function getTenantDb(tenant: string): DB | null {
	console.log(tenant);
	if (!isSafeTenantName(tenant)) return null;
	if (connections.has(tenant)) return connections.get(tenant)!;

	const dbPath = path.join(DB_DIR, `${tenant}.db`);

	// Make sure the file actually exists before trying to open it
	if (!fs.existsSync(dbPath)) {
		console.error(`DB file not found: ${dbPath}`);
		return null;
	}

	// libsql needs the full absolute path with file:// prefix
	const client = createClient({ url: `file:${dbPath}` });
	const db = drizzle(client, { schema });

	connections.set(tenant, db);
	return db;
}
