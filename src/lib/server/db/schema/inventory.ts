// inventory.ts - Handles products, supplies, categories, and inventory adjustments
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { secureFields } from './secureFields';
import { transactions, transactionSupplies } from './finance';
import { staff } from './staff';

export const products = sqliteTable('products', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	description: text('description'),
	categoryId: integer('category_id').references(() => productCategories.id, {
		onDelete: 'set null'
	}),
	quantity: integer('quantity').notNull().default(0),
	price: real('price').notNull(),
	cost: real('cost').notNull(),
	commissionAmount: real('commission_amount').notNull(),
	supplierId: integer('supplier_id').references(() => productSuppliers.id),
	reorderLevel: integer('reorder_level'),
	...secureFields
});

export const productCategories = sqliteTable('product_categories', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	description: text('description'),
	...secureFields
});

export const productAdjustments = sqliteTable('product_adjustments', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	productsId: integer('product_id')
		.notNull()
		.references(() => products.id, { onDelete: 'cascade' }),
	supplierId: integer('supplier_id').references(() => productSuppliers.id),
	adjustment: integer('adjustment').notNull(),
	reason: text('reason'),
	transactionId: integer('transaction_id').references(() => transactions.id),
	...secureFields
});

export const damagedProducts = sqliteTable('damaged_products', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	productId: integer('product_id')
		.notNull()
		.references(() => products.id, { onDelete: 'cascade' }),
	quantity: integer('quantity').notNull(),
	damagedBy: integer('damaged_by').references(() => staff.id, { onDelete: 'set null' }),
	// Booleans are integers (0 or 1) in SQLite
	deductable: integer('deductable', { mode: 'boolean' }).notNull().default(false),
	reason: text('reason').notNull(),
	...secureFields
});

export const supplyTypes = sqliteTable('supply_types', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	description: text('description')
});

export const supplies = sqliteTable('supplies', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	supplyTypeId: integer('supply_type_id')
		.notNull()
		.references(() => supplyTypes.id),
	name: text('name').notNull(),
	description: text('description'),
	quantity: integer('quantity').notNull().default(0),
	unitOfMeasure: text('unit_of_measure'),
	reorderLevel: integer('reorder_level'),
	...secureFields
});

export const damagedSupplies = sqliteTable('damaged_supplies', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	supplyId: integer('supply_id')
		.notNull()
		.references(() => supplies.id, { onDelete: 'cascade' }),
	quantity: integer('quantity').notNull(),
	damagedBy: integer('damaged_by').references(() => staff.id, { onDelete: 'set null' }),
	deductable: integer('deductable', { mode: 'boolean' }).notNull().default(false),
	reason: text('reason').notNull(),
	...secureFields
});

export const suppliesAdjustments = sqliteTable('supplies_adjustments', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	suppliesId: integer('supplies_id')
		.notNull()
		.references(() => supplies.id, { onDelete: 'cascade' }),
	adjustment: integer('adjustment').notNull(),
	supplierId: integer('supplier_id').references(() => supplySuppliers.id),
	employeeResponsible: integer('employee_responsible').references(() => staff.id),
	reason: text('reason'),
	costPerItem: real('cost_per_item'),
	total: real('total'),
	transactionId: integer('transaction_id').references(() => transactionSupplies.id, {
		onDelete: 'set null'
	}),
	damagedSuppliesId: integer('damaged_supplies_id').references(() => damagedSupplies.id, {
		onDelete: 'set null'
	}),
	...secureFields
});

export const supplySuppliers = sqliteTable('supply_suppliers', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	phone: text('phone').notNull(),
	email: text('email'),
	description: text('description'),
	...secureFields
});

export const productSuppliers = sqliteTable('product_suppliers', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	phone: text('phone').notNull(),
	email: text('email'),
	description: text('description'),
	...secureFields
});
