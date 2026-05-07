import { z } from 'zod/v4';
export const editCustomer = z.object({
	firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
	lastName: z.string().max(50, 'Last name is too long').optional().or(z.literal('')),
	phone: z
		.string()
		.min(7, 'Phone number is too short')
		.max(15, 'Phone number is too long')
		.regex(/^[0-9+\-()\s]+$/, 'Invalid phone number'),
	gender: z.string().refine((val) => ['male', 'female'].includes(val), {
		message: 'Please select a gender'
	}),
	customerId: z.number()
});
