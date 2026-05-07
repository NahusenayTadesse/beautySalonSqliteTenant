import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { branches } from './branches';
import { sql } from 'drizzle-orm';

export const user = sqliteTable(
	'user',
	{
		id: text('id').primaryKey(),
		username: text('username').notNull().unique(),
		name: text('name').notNull().default('User'),
		email: text('email').notNull().unique(),
		passwordHash: text('password_hash').notNull(),
		isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
		roleId: integer('role_id')
			.references(() => roles.id, { onDelete: 'restrict' })
			.notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.default(sql`(unixepoch())`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.default(sql`(unixepoch())`)
			.notNull(),
		branchId: integer('branch_id').references(() => branches.id)
	},
	(table) => ({
		nameIdx: index('name_idx').on(table.name)
	})
);

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.default(sql`(unixepoch())`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.default(sql`(unixepoch())`)
		.notNull()
});

export const roles = sqliteTable('roles', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	description: text('description'),
	isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull()
});
