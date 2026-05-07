import { z } from 'zod/v4';

export const inventoryItemSchema = z.object({
	productName: z.string().min(1, { message: 'Product Name is required.' }),
	category: z
		.number('Category cannot be empty. Please select a Category')
		.positive('Category cannot be empty. Please select a Category'),

	description: z
		.string()
		.max(500, { message: "Product description can't be more than 500 characters." })
		.optional(),
	quantity: z.coerce
		.number()
		.int('Quantity can only be full numbers, no decimals.')
		.positive('Quantity must be a positive number.'),
	price: z.number('Price is required').positive('Price must be a positive number.'),
	commission: z
		.number({ message: 'Commission is required, enter 0 if it is not decided yet' })
		.positive({ message: 'Price must be a positive number.' })
		.optional(),
	supplier: z.number('Supplier is required').optional(),
	reorderLevel: z.coerce
		.number()
		.int('Reorder Level can only be full numbers, no decimals.')
		.positive('Reorder Level must be a positive number.')
		.optional(),

	costPerUnit: z.number('Cost is required').positive('Cost must be a positive number.').optional()
});

export type InventoryItemSchema = typeof inventoryItemSchema;
