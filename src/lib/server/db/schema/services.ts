// services.ts - Handles services and their categories
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { secureFields } from './secureFields';

export const serviceCategories = sqliteTable('service_categories', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	description: text('description'),
	...secureFields
});

export const services = sqliteTable('services', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	categoryId: integer('category_id').references(() => serviceCategories.id, {
		onDelete: 'set null'
	}),
	description: text('description'),
	// price and commission are moved to real for SQLite
	price: real('price').notNull(),
	durationMinutes: integer('duration_minutes'),
	commissionAmount: real('commission_amount'),
	...secureFields
});
