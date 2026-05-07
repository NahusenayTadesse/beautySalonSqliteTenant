import { relations } from 'drizzle-orm';
import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { secureFields } from './secureFields';
import { services } from './services';
import { user } from './user';

export const customers = sqliteTable(
	'customers',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		firstName: text('first_name').notNull(),
		lastName: text('last_name'),
		phone: text('phone').notNull().unique(),
		// SQLite uses text for enums
		gender: text('gender', { enum: ['male', 'female'] }).default('female'),
		address: text('address'),
		...secureFields
	},
	(table) => ({
		firstNameIdx: index('first_name_idx').on(table.firstName),
		lastNameIdx: index('last_name_idx').on(table.lastName)
	})
);

export const customerContacts = sqliteTable('customer_contacts', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	customerId: integer('customer_id')
		.notNull()
		.references(() => customers.id, { onDelete: 'cascade' }),
	contactType: text('contact_type').notNull(),
	contactDetail: text('contact_detail').notNull(),
	...secureFields
});

export const appointmentStatuses = sqliteTable('appointment_statuses', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	description: text('description'),
	...secureFields
});

export const appointments = sqliteTable('appointments', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	customerId: integer('customer_id')
		.notNull()
		.references(() => customers.id, { onDelete: 'cascade' }),

	// date and time are stored as text in SQLite (ISO strings)
	appointmentDate: text('appointment_date').notNull(),
	appointmentTime: text('appointment_time').notNull(),
	status: text('status', { enum: ['pending', 'completed', 'cancelled'] }),
	bookingFee: real('booking_fee'),
	notes: text('notes'),
	...secureFields
});

export const appointmentServices = sqliteTable('appointment_services', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	appointmentId: integer('appointment_id')
		.notNull()
		.references(() => appointments.id, { onDelete: 'cascade' }),
	serviceId: integer('service_id')
		.notNull()
		.references(() => services.id, { onDelete: 'cascade' })
});

// Relations remain exactly the same as they are agnostic of the driver
export const customersRelations = relations(customers, ({ many }) => ({
	appointments: many(appointments)
}));

export const servicesRelations = relations(services, ({ many }) => ({
	appointmentServices: many(appointmentServices)
}));

export const appointmentServicesRelations = relations(appointmentServices, ({ one }) => ({
	appointment: one(appointments, {
		fields: [appointmentServices.appointmentId],
		references: [appointments.id]
	}),
	service: one(services, {
		fields: [appointmentServices.serviceId],
		references: [services.id]
	})
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
	customer: one(customers, {
		fields: [appointments.customerId],
		references: [customers.id]
	}),
	user: one(user, {
		fields: [appointments.createdBy],
		references: [user.id]
	}),
	appointmentServices: many(appointmentServices)
}));

export const userRelations = relations(user, ({ many }) => ({
	appointments: many(appointments)
}));
