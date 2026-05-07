import { relations } from 'drizzle-orm';
import { sqliteTable, text, integer, real, unique } from 'drizzle-orm/sqlite-core';
import { appointments, customers } from './customer-appointment';
import { staff } from './staff';
import { secureFields } from './secureFields';
import { services } from './services';
import { products } from './inventory';
import { supplies } from '../schema';

export const paymentMethods = sqliteTable('payment_methods', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	description: text('description'),
	...secureFields
});

export const transactions = sqliteTable('transactions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	customerId: integer('customer_id').references(() => customers.id),
	amount: real('amount').notNull(),
	paymentStatus: text('payment_status', {
		enum: [
			'pending',
			'paid',
			'unpaid',
			'refunded',
			'partially_paid',
			'partially_refunded',
			'overpaid',
			'disputed'
		]
	}).default('pending'),
	paymentMethodId: integer('payment_method_id').references(() => paymentMethods.id, {
		onDelete: 'set null'
	}),
	recieptLink: text('reciept_link'),
	...secureFields
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
	paymentMethod: one(paymentMethods, {
		fields: [transactions.paymentMethodId],
		references: [paymentMethods.id]
	})
}));

export const transactionServices = sqliteTable('transaction_services', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	appointmentId: integer('appointment_id').references(() => appointments.id),
	staffId: integer('staff_id')
		.references(() => staff.id)
		.notNull(),
	transactionId: integer('transaction_id')
		.notNull()
		.references(() => transactions.id, { onDelete: 'cascade' }),
	serviceId: integer('service_id')
		.notNull()
		.references(() => services.id),
	price: real('price').notNull(),
	tip: real('tip').notNull().default(0),
	discount: integer('discount').references(() => discounts.id),
	tax: real('tax'),
	total: real('total'),
	...secureFields
});

export const transactionProducts = sqliteTable('transaction_products', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	appointmentId: integer('appointment_id').references(() => appointments.id),
	transactionId: integer('transaction_id')
		.notNull()
		.references(() => transactions.id, { onDelete: 'cascade' }),
	staffId: integer('staff_id').references(() => staff.id, { onDelete: 'set null' }),
	tip: real('tip').notNull().default(0),
	productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
	quantity: real('quantity').notNull().default(1),
	unitPrice: real('unit_price').notNull(),
	discount: integer('discount').references(() => discounts.id),
	tax: real('tax'),
	total: real('total'),
	...secureFields
});

export const discounts = sqliteTable('discounts', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	amount: real('amount'),
	name: text('name').notNull().unique(),
	description: text('description'),
	...secureFields
});

export const transactionSupplies = sqliteTable('transaction_supplies', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	transactionId: integer('transaction_id')
		.notNull()
		.references(() => transactions.id, { onDelete: 'cascade' }),
	supplyId: integer('supply_id').references(() => supplies.id, { onDelete: 'set null' }),
	quantity: real('quantity').notNull().default(1),
	unitPrice: real('unit_price').notNull(),
	...secureFields
});

export const transactionBookingFee = sqliteTable('transaction_booking_fees', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	transactionId: integer('transaction_id')
		.notNull()
		.references(() => transactions.id, { onDelete: 'cascade' }),
	appointmentId: integer('appointment_id')
		.notNull()
		.references(() => appointments.id, { onDelete: 'cascade' }),
	fee: real('fee').notNull(),
	...secureFields
});

export const expenses = sqliteTable('expenses', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	expenseDate: text('expense_date').notNull(),
	type: integer('type')
		.notNull()
		.references(() => expensesType.id),
	description: text('description'),
	total: real('total').notNull(),
	transactionId: integer('transaction_id')
		.notNull()
		.references(() => transactions.id, { onDelete: 'cascade' }),
	...secureFields
});

export const expensesType = sqliteTable('expenses_type', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	description: text('description'),
	...secureFields
});

export const payrollEntries = sqliteTable(
	'payroll_entries',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		staffId: integer('staff_id').references(() => staff.id),
		month: text('month', {
			enum: [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December'
			]
		}).notNull(),
		year: integer('year').notNull(), // SQLite doesn't have 'year' type, use integer
		payPeriodStart: text('pay_period_start').notNull(),
		payPeriodEnd: text('pay_period_end').notNull(),
		basicSalary: real('basic_salary'),
		overtimeAmount: real('overtime_amount'),
		deductions: real('deduction'),
		commissionAmount: real('commission_amount'),
		bonusAmount: real('bonus_amount'),
		allowances: real('allowances'),
		netAmount: real('net_amount'),
		paidAmount: real('paid_amount'),
		taxAmount: real('tax_amount'),
		status: text('status', { enum: ['pending', 'approved', 'paid'] })
			.default('pending')
			.notNull(),
		paymentMethodId: integer('payment_method_id').references(() => paymentMethods.id),
		paymentDate: text('payment_date'),
		notes: text('notes'),
		recieptLink: text('reciept_link'),
		...secureFields
	},
	(t) => ({
		unq: unique().on(t.staffId, t.payPeriodStart, t.payPeriodEnd)
	})
);

export const transactionRelations = relations(transactions, ({ many }) => ({
	transactionProducts: many(transactionProducts),
	transactionServices: many(transactionServices),
	transactionSupplies: many(transactionSupplies),
	transactionBookingFee: many(transactionBookingFee)
}));

export const transactionProductsRelations = relations(transactionProducts, ({ one }) => ({
	sale: one(transactions, {
		fields: [transactionProducts.transactionId],
		references: [transactions.id]
	}),
	product: one(products, {
		fields: [transactionProducts.productId],
		references: [products.id]
	})
}));

export const transactionServicessRelations = relations(transactionServices, ({ one }) => ({
	sale: one(transactions, {
		fields: [transactionServices.transactionId],
		references: [transactions.id]
	}),
	service: one(services, {
		fields: [transactionServices.serviceId],
		references: [services.id]
	})
}));
