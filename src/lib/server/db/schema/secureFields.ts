import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { user } from './user';
import { branches } from './branches';

export const secureFields = {
	isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),

	// SQLite uses 'text' for IDs if you're using CUIDs or UUIDs (common in Better-Auth/Lucia)
	createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),

	updatedBy: text('updated_by').references(() => user.id, { onDelete: 'set null' }),

	// Using integer mode for consistency with your branches schema
	createdAt: integer('created_at', { mode: 'timestamp' })
		.default(sql`(unixepoch())`)
		.notNull(),

	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.default(sql`(unixepoch())`)
		.notNull(),

	branchId: integer('branch_id').references(() => branches.id, { onDelete: 'set null' }),

	deletedAt: integer('deleted_at', { mode: 'timestamp' }),

	deletedBy: text('deleted_by').references(() => user.id, { onDelete: 'set null' })
};
