// staff.ts - Handles staff profiles, types, contacts, schedules, and compensation
import { relations } from 'drizzle-orm';
import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { secureFields } from './secureFields';
import { user } from './user';
import { paymentMethods, transactionProducts, transactionServices } from './finance';
import { services } from './services';

export const staffTypes = sqliteTable('staff_types', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	description: text('description'),
	...secureFields
});

export const staff = sqliteTable(
	'staff',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		firstName: text('first_name').notNull(),
		lastName: text('last_name').notNull(),
		grandFatherName: text('grand_father_name'),
		email: text('email'),
		phone: text('phone'),
		type: integer('type_id')
			.notNull()
			.references(() => staffTypes.id),
		// Storing dates/timestamps as integers for SQLite performance
		hireDate: integer('hire_date', { mode: 'timestamp' }),
		govtId: text('govt_id'),
		contract: text('contract'),
		terminationDate: integer('termination_date', { mode: 'timestamp' }),
		employmentStatus: text('employment_status', {
			enum: [
				'full_time',
				'on_leave',
				'terminated',
				'probation',
				'contract',
				'intern',
				'part_time',
				'sabbatical',
				'suspended',
				'resigned',
				'retired',
				'deceased'
			]
		}).default('full_time'),
		subcity: text('subcity'),
		street: text('street'),
		kebele: text('kebele'),
		buildingNumber: text('building_number'),
		floor: text('floor'),
		houseNumber: text('house_number'),
		...secureFields
	},
	(table) => ({
		firstNameIdx: index('first_name_idx').on(table.firstName),
		lastNameIdx: index('last_name_idx').on(table.lastName)
	})
);

export const userStaff = sqliteTable('user_staff', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	// Better-Auth IDs are strings, so text is used here
	userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
	staffId: integer('staff_id').references(() => staff.id, { onDelete: 'cascade' })
});

export const staffContacts = sqliteTable('staff_contacts', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	staffId: integer('staff_id')
		.notNull()
		.references(() => staff.id, { onDelete: 'cascade' }),
	contactType: text('contact_type').notNull(),
	contactDetail: text('contact_detail').notNull(),
	...secureFields
});

export const staffAccounts = sqliteTable('staff_accounts', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	staffId: integer('staff_id')
		.notNull()
		.references(() => staff.id, { onDelete: 'cascade' }),
	paymentMethodId: integer('payment_Method_id').references(() => paymentMethods.id, {
		onDelete: 'set null'
	}),
	accountDetail: text('account_detail').notNull(),
	...secureFields
});

export const salaries = sqliteTable('salaries', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	staffId: integer('staff_id')
		.notNull()
		.references(() => staff.id, { onDelete: 'cascade' }),
	amount: real('amount').notNull(),
	startDate: text('start_date').notNull(), // ISO Date strings
	endDate: text('end_date'),
	...secureFields
});

export const bonuses = sqliteTable('bonuses', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	staffId: integer('staff_id').references(() => staff.id, { onDelete: 'set null' }),
	description: text('description'),
	amount: real('amount').notNull(),
	bonusDate: text('bonus_date').notNull(),
	...secureFields
});

export const overTime = sqliteTable('over_time', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	staffId: integer('staff_id').references(() => staff.id, { onDelete: 'set null' }),
	reason: text('reason'),
	amountPerHour: real('amount_per_hour').notNull(),
	hours: real('hours').notNull(),
	total: real('total').notNull(),
	date: text('date').notNull(),
	...secureFields
});

export const commissionService = sqliteTable('commissions_services', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	saleItemId: integer('sale_item_id').references(() => transactionServices.id, {
		onDelete: 'set null'
	}),
	staffId: integer('staff_id').references(() => staff.id, { onDelete: 'set null' }),
	amount: real('amount').notNull(),
	commissionDate: text('commission_date').notNull(),
	...secureFields
});

export const commissionProduct = sqliteTable('commissions_product', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	saleItemId: integer('sale_item_id')
		.notNull()
		.references(() => transactionProducts.id, { onDelete: 'cascade' }),
	staffId: integer('staff_id').references(() => staff.id, { onDelete: 'set null' }),
	amount: real('amount').notNull(),
	commissionDate: text('commission_date').notNull(),
	...secureFields
});

export const tipsProduct = sqliteTable('tips_product', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	saleItemId: integer('sale_item_id')
		.notNull()
		.references(() => transactionProducts.id, { onDelete: 'cascade' }),
	staffId: integer('staff_id').references(() => staff.id, { onDelete: 'set null' }),
	amount: real('amount').notNull(),
	tipDate: text('tip_date').notNull(),
	...secureFields
});

export const tipsService = sqliteTable('tips_service', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	saleItemId: integer('sale_item_id').references(() => transactionServices.id, {
		onDelete: 'set null'
	}),
	staffId: integer('staff_id').references(() => staff.id, { onDelete: 'set null' }),
	amount: real('amount').notNull(),
	tipDate: text('tip_date').notNull(),
	...secureFields
});

export const staffServices = sqliteTable('staff_services', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	staffId: integer('staff_id')
		.notNull()
		.references(() => staff.id, { onDelete: 'cascade' }),
	serviceId: integer('service_id')
		.notNull()
		.references(() => services.id, { onDelete: 'cascade' }),
	...secureFields
});

export const deductions = sqliteTable('deductions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	staffId: integer('staff_id').references(() => staff.id, { onDelete: 'set null' }),
	type: text('type').notNull(),
	amount: real('amount').notNull(),
	deductionDate: text('deduction_date').notNull(),
	...secureFields
});

export const staffSchedule = sqliteTable('staff_schedule', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	staffId: integer('staff_id')
		.notNull()
		.references(() => staff.id, { onDelete: 'cascade' }),
	shiftDate: text('shift_date').notNull(),
	weekDay: integer('week_day').notNull(), // tinyint is integer in SQLite
	startTime: text('start_time').notNull(),
	endTime: text('end_time').notNull(),
	...secureFields
});

export const employeeTermination = sqliteTable('empoloyee_termination', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	staffId: integer('staff_id')
		.notNull()
		.references(() => staff.id),
	reason: text('reason'),
	terminationLetter: text('termination_letter'),
	terminationDate: text('termination_date').notNull(),
	...secureFields
});

export const missingDays = sqliteTable('missing_days', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	staffId: integer('staff_id')
		.notNull()
		.references(() => staff.id, { onDelete: 'cascade' }),
	day: text('day').notNull(),
	reason: text('reason').notNull(),
	deductable: integer('deductable', { mode: 'boolean' }).notNull().default(false),
	...secureFields
});

export const employeeGuarantor = sqliteTable('employee_guarantor', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	staffId: integer('staff_id')
		.notNull()
		.references(() => staff.id),
	name: text('name').notNull(),
	relationship: text('relationship', {
		enum: ['mother', 'father', 'spouse', 'son', 'brother', 'sister', 'daughter', 'other']
	}).notNull(),
	relation: text('relation'),
	jobType: text('job_type').notNull(),
	company: text('company').notNull(),
	salary: real('salary').notNull(),
	gurantorDocument: text('gurantor_document').notNull(),
	phone: text('phone').notNull(),
	photo: text('photo').notNull(),
	govtId: text('govt_id').notNull(),
	email: text('email'),
	subcity: text('subcity'),
	street: text('street'),
	kebele: text('kebele'),
	buildingNumber: text('building_number'),
	floor: text('floor'),
	houseNumber: text('house_number'),
	...secureFields
});

export const staffFamilies = sqliteTable('staff_families', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	staffId: integer('staff_id').references(() => staff.id, { onDelete: 'cascade' }),
	relationship: text('relationship', {
		enum: [
			'mother',
			'father',
			'spouse',
			'son',
			'daughter',
			'grandchild',
			'grandfather',
			'grandmother',
			'uncle',
			'aunt',
			'brother',
			'sister',
			'other'
		]
	}).notNull(),
	gender: text('gender', { enum: ['male', 'female'] })
		.notNull()
		.default('male'),
	otherRelationship: text('other_relationship'),
	name: text('name').notNull(),
	phone: text('phone').notNull(),
	email: text('email'),
	emergencyContact: integer('emergency_contact', { mode: 'boolean' }).notNull().default(false),
	...secureFields
});

// Relations remain driver-agnostic
export const staffServicesRelations = relations(staffServices, ({ one }) => ({
	staff: one(staff, { fields: [staffServices.staffId], references: [staff.id] }),
	service: one(services, { fields: [staffServices.serviceId], references: [services.id] })
}));

export const staffScheduleRelations = relations(staffSchedule, ({ one }) => ({
	staff: one(staff, {
		fields: [staffSchedule.staffId],
		references: [staff.id]
	})
}));
