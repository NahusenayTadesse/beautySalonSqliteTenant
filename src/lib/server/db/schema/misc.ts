// misc.ts - Handles miscellaneous items like positions and audit logs
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { user } from './user';
import { secureFields } from './secureFields';
import { branches } from './branches';
import { sql } from 'drizzle-orm';

export const positions = sqliteTable('positions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	description: text('description'),
	...secureFields
});

export const auditLog = sqliteTable('audit_log', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	// Matching the text-based ID from your user table
	userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
	action: text('action').notNull(),
	tableName: text('table_name').notNull(),
	recordId: text('record_id').notNull(),
	// SQLite stores JSON as text; mode: 'json' handles the TS typing
	oldValues: text('old_values', { mode: 'json' }),
	newValues: text('new_values', { mode: 'json' }),
	timestamp: integer('timestamp', { mode: 'timestamp' })
		.default(sql`(unixepoch())`)
		.notNull(),
	ipAddress: text('ip_address')
});

export const reports = sqliteTable('reports', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	reportDate: text('report_date').notNull().unique(),
	bookedAppointments: integer('booked_appointments').default(0),
	cancelledAppointments: integer('cancelled_appointments').default(0),
	productsSold: integer('products_sold').notNull().default(0),
	servicesRendered: integer('services_rendered').notNull(),
	dailyExpenses: real('daily_expenses'),
	dailyIncome: real('daily_income'),
	transactions: integer('transactions').notNull(),
	staffPaid: integer('staff_paid'),
	totalStaffPaid: real('total_staff_paid'),
	staffHired: integer('staff_hired'),
	staffFired: integer('staff_fired'),
	branchId: integer('branch_id').references(() => branches.id, { onDelete: 'set null' })
});
