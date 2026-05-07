import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { roles, user } from './user';
import { secureFields } from './secureFields';
import { relations } from 'drizzle-orm';

export const permissions = sqliteTable('permissions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	description: text('description')
});

// 2. A join table to link roles to their permissions
export const rolePermissions = sqliteTable('role_permissions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	roleId: integer('role_id')
		.notNull()
		.references(() => roles.id, { onDelete: 'cascade' }),
	permissionId: integer('permission_id')
		.notNull()
		.references(() => permissions.id, { onDelete: 'cascade' }),
	...secureFields
});

export const specialPermissions = sqliteTable('special_permissions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	// Matching the text ID type in your SQLite user table
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	permissionId: integer('permission_id')
		.notNull()
		.references(() => permissions.id, { onDelete: 'cascade' }),
	...secureFields
});

// Relations remain driver-agnostic
export const rolesRelations = relations(roles, ({ many }) => ({
	rolePermissions: many(rolePermissions)
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
	rolePermissions: many(rolePermissions),
	specialPermissions: many(specialPermissions)
}));

export const specialPermissionsRelations = relations(specialPermissions, ({ one }) => ({
	user: one(user, {
		fields: [specialPermissions.userId],
		references: [user.id]
	}),
	permission: one(permissions, {
		fields: [specialPermissions.permissionId],
		references: [permissions.id]
	})
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
	role: one(roles, {
		fields: [rolePermissions.roleId],
		references: [roles.id]
	}),
	permission: one(permissions, {
		fields: [rolePermissions.permissionId],
		references: [permissions.id]
	})
}));
