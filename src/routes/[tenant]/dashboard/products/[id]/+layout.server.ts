import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import {
	editProduct as schema,
	inventoryAdjustmentFormSchema as adjustSchema,
	damagedFormSchema as damagedSchema
} from '$lib/ZodSchema';

import { db } from '$lib/server/db';
import {
	productCategories,
	products,
	transactionProducts,
	transactions,
	user,
	productAdjustments,
	productSuppliers,
	staff,
	damagedProducts,
	deductions
} from '$lib/server/db/schema';
import { eq, and, sql, isNotNull, desc } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { fail, message } from 'sveltekit-superforms';
import { setFlash } from 'sveltekit-flash-message/server';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { id } = params;
	const form = await superValidate(zod4(schema));
	const adjustForm = await superValidate(zod4(adjustSchema));
	const damagedForm = await superValidate(zod4(damagedSchema));

	const supplierList = await db
		.select({
			value: productSuppliers.id,
			name: productSuppliers.name
		})
		.from(productSuppliers)
		.where(eq(productSuppliers.isActive, true));

	const product = await db
		.select({
			id: products.id,
			name: products.name,
			price: products.price,
			costPerUnit: products.cost,
			description: products.description,
			category: productCategories.name,
			categoryId: productCategories.id,
			commission: products.commissionAmount,
			quantity: products.quantity,
			reorderLevel: products.reorderLevel,
			supplier: productSuppliers.name,
			supplierId: productSuppliers.id,
			saleCount: sql<number>`SUM(${transactionProducts.quantity})`,
			createdBy: user.name,
			createdAt: products.createdAt,
			paidAmount: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`
		})
		.from(products)
		.leftJoin(productCategories, eq(productCategories.id, products.categoryId))
		.leftJoin(productSuppliers, eq(productSuppliers.id, products.supplierId))
		.leftJoin(transactionProducts, eq(products.id, transactionProducts.productId))
		.leftJoin(transactions, eq(transactionProducts.transactionId, transactions.id))
		.leftJoin(user, eq(products.createdBy, user.id))
		.where(eq(products.id, Number(id)))
		.groupBy(
			products.id,
			products.name,
			products.price,
			products.cost,
			products.description,
			productCategories.name,
			products.commissionAmount,
			products.quantity,
			productSuppliers.name,
			products.reorderLevel,
			transactionProducts.id
		)
		.then((rows) => rows[0]);

	const categories = await db
		.select({
			value: productCategories.id,
			name: productCategories.name,
			description: productCategories.description
		})
		.from(productCategories);
	const employeesList = await db
		.select({
			value: staff.id,
			name: sql<string>`TRIM(CONCAT(${staff.firstName}, ' ', COALESCE(${staff.lastName}, '')))`
		})
		.from(staff)
		.where(eq(staff.isActive, true));

	return {
		product,
		form,
		categories,
		adjustForm,
		supplierList,
		damagedForm,
		employeesList
	};
};
