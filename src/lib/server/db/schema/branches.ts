import { sql } from 'drizzle-orm';
// import { text, integer, sqliteTable, real, index } from 'drizzle-orm/sqlite-core';
import { integer, sqliteTable, text, real, index } from 'drizzle-orm/sqlite-core';

export const branches = sqliteTable(
	'branches',
	{
		// In SQLite, integer primary key is autoincrementing by default
		id: integer('id').primaryKey({ autoIncrement: true }),
		parent_branch_id: integer('parent_branch_id'),
		name: text('name').notNull(),
		address_line1: text('address_line1'),
		address_line2: text('address_line2'),
		city: text('city'),
		state: text('state'),
		postal_code: text('postal_code'),
		country_code: text('country_code'),
		phone_number: text('phone_number'),
		email: text('email'),
		timezone: text('timezone'),
		// SQLite uses 'real' for decimal/floating point values
		latitude: real('latitude'),
		longitude: real('longitude'),
		// Booleans are stored as integers (0 or 1) in SQLite
		is_active: integer('is_active', { mode: 'boolean' }).default(true),
		// Storing as text (ISO strings) is the Drizzle default for dates in SQLite
		created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.default(sql`(unixepoch())`)
			.notNull()
	},
	(table) => ({
		branchIdIdx: index('branch_id_idx').on(table.id)
	})
);
