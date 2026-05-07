import { z } from 'zod/v4';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/heic',
	'image/heif',
	'application/pdf'
];

export const staffSchema = z.object({
	firstName: z.string().min(1, 'Name is required').max(100, 'Name is too long'),

	lastName: z.string().min(1, 'Father name is required').max(100, 'Father name is too long'),
	grandFatherName: z
		.string()
		.min(1, 'Grand father name is required')
		.max(100, 'Grand father name is too long'),

	email: z.string().optional(),

	phone: z
		.string()
		.min(7, 'Phone number must be at least 7 digits')
		.max(20, 'Phone number is too long')
		.regex(/^[\d+\-\s()]+$/, 'Invalid phone number format'),

	position: z.number('Position is required').positive('Position is required'),

	hiredAt: z.string().optional(),

	salary: z.number().nonnegative('Salary must be a non-negative number').optional(),

	govId: z
		.file('Please upload a valid image (JPG, PNG, WebP, HEIC/HEIF) or PDF.')
		.max(10_000_000, 'Max file size is 10MB.')
		.optional(),

	contract: z
		.file('Please upload a valid image (JPG, PNG, WebP, HEIC/HEIF) or PDF.')
		.max(10_000_000, 'Max file size is 10MB.')
		.optional()
});

export type StaffForm = z.infer<typeof staffSchema>;
