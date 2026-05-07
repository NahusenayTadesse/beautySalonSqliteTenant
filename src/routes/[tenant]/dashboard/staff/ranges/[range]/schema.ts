import { z } from 'zod/v4';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '$lib/zodschemas/appointmentSchema';

export const terminate = z.object({
	reason: z.string().min(2).max(255),
	terminationDate: z.coerce.string('Termination Date is Required')
});
export type Terminate = z.infer<typeof terminate>;

export const reinstate = z.object({
	newStatus: z.string('New Status is Required')
});

export type Reinstate = z.infer<typeof reinstate>;

export const addSchedule = z.object({
	day: z.number('Day is Required'),
	startTime: z.string('Start Time is required'),
	endTime: z.string('End Time is required'),
	status: z.boolean('Status is Required').default(true)
});
export type AddSchedule = z.infer<typeof addSchedule>;

export const editSchedule = z.object({
	id: z.number('Schedule not found'),
	day: z.number('Day is Required'),
	startTime: z.string('Start Time is required'),
	endTime: z.string('End Time is required'),
	status: z.boolean('Status is Required').default(true)
});
export type EditSchedule = z.infer<typeof editSchedule>;

export const editGuarantor = z.object({
	id: z.number('Guarantor not Found'),
	name: z.string('Name is required').min(1).max(100),
	phone: z
		.string('Phone is required')
		.min(1)
		.max(15, 'Phone number must be between 1 and 15 characters'),
	email: z.email('Email is required'),
	jobType: z.string('Job type is required').min(1).max(100),
	company: z.string('Company Name is required').min(1).max(100),
	relationship: z.enum([
		'mother',
		'father',
		'spouse',
		'brother',
		'sister',
		'son',
		'daughter',
		'other'
	]),
	relation: z.string().optional(),
	salary: z.number('Salary is required').min(0).max(1000000),
	photo: z
		.file('Please upload a valid image (JPG, PNG, WebP, HEIC/HEIF) or PDF.')
		.max(10_000_000, 'Max file size is 10MB.')
		.optional(),
	govtId: z
		.file('Please upload a valid image (JPG, PNG, WebP, HEIC/HEIF) or PDF.')
		.max(10_000_000, 'Max file size is 10MB.')
		.optional(),
	document: z
		.file('Please upload a valid image (JPG, PNG, WebP, HEIC/HEIF) or PDF.')
		.max(10_000_000, 'Max file size is 10MB.')
		.optional(),
	subcity: z.string('Subsity is required'),
	street: z.string('Street is required'),
	kebele: z.string('Kebele is required'),
	buildingNumber: z.string().optional(),
	floor: z.string().optional(),
	houseNumber: z.string('House Number is Required')
});
export type EditGuarantor = z.infer<typeof editGuarantor>;

export const addGuarantor = z.object({
	name: z.string('Name is required').min(1).max(100),
	phone: z
		.string('Phone is required')
		.min(1)
		.max(15, 'Phone number must be between 1 and 15 characters'),
	email: z.email('Email is required'),
	jobType: z.string('Job type is required').min(1).max(100),
	company: z.string('Company Name is required').min(1).max(100),
	relationship: z.enum([
		'mother',
		'father',
		'spouse',
		'brother',
		'sister',
		'son',
		'daughter',
		'other'
	]),
	relation: z.string().optional(),
	salary: z.number('Salary is required').min(0).max(1000000),
	photo: z
		.file('Please upload a valid image (JPG, PNG, WebP, HEIC/HEIF) or PDF.')
		.max(10_000_000, 'Max file size is 10MB.'),
	govtId: z
		.file('Please upload a valid image (JPG, PNG, WebP, HEIC/HEIF) or PDF.')
		.max(10_000_000, 'Max file size is 10MB.'),
	document: z
		.file('Please upload a valid image (JPG, PNG, WebP, HEIC/HEIF) or PDF.')
		.max(10_000_000, 'Max file size is 10MB.'),
	subcity: z.string('Subsity is required'),
	street: z.string('Street is required'),
	kebele: z.string('Kebele is required'),
	buildingNumber: z.string().optional(),
	floor: z.string().optional(),
	houseNumber: z.string('House Number is Required')
});
export type AddGuarantor = z.infer<typeof addGuarantor>;

export const addAccount = z.object({
	paymentMethod: z.number('Bank Name is Required'),
	accountDetail: z.string('Account Detail is required'),
	status: z.boolean('Status is Required').default(true)
});
export type AddAccount = z.infer<typeof addAccount>;

export const editAccount = z.object({
	id: z.number('Schedule not found'),
	paymentMethod: z.number('Bank Name is Required'),
	accountDetail: z.string('Account Detail is required'),
	status: z.boolean('Status is Required').default(true)
});

export type EditAccount = z.infer<typeof editAccount>;

export const addContact = z.object({
	contactType: z.string('Contact Type is Required'),
	contactDetail: z.string('Contact Detail is required'),
	status: z.boolean('Status is Required').default(true)
});
export type AddContact = z.infer<typeof addContact>;

export const editContact = z.object({
	id: z.number('Schedule not found'),
	contactType: z.string('Contact Type is Required'),
	contactDetail: z.string('Contact Detail is required'),

	status: z.boolean('Status is Required').default(true)
});

export type EditContact = z.infer<typeof editContact>;

const RelationShipEnum = z.enum(
	[
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
	],
	'Relationship is required'
);
export const editFamily = z.object({
	id: z.number('Family Member is not Found'),
	name: z.string('Family member is required').min(1).max(100),
	gender: z.enum(['male', 'female'], {
		message: 'Please select a valid gender'
	}),

	phone: z.string(),
	email: z.email().optional(),
	emergencyContact: z.boolean().default(false),
	otherRelationShip: z.string().optional(),
	relationShip: RelationShipEnum,
	status: z.boolean().default(true)
});
export type EditFamily = z.infer<typeof editFamily>;

export const addFamily = z.object({
	name: z.string('Family member is required').min(1).max(100),
	gender: z.enum(['male', 'female'], {
		message: 'Please select a valid gender'
	}),

	phone: z.string(),
	email: z.email().optional(),
	emergencyContact: z.boolean().default(false),
	otherRelationShip: z.string().optional(),
	relationShip: RelationShipEnum,
	status: z.boolean().default(true)
});

export type AddFamily = z.infer<typeof addFamily>;

export const editStaff = z.object({
	staffId: z.number('Staff Member is required'),
	firstName: z.string().min(1, 'Name is required').max(100, 'First name is too long'),

	lastName: z.string().min(1, 'Father name is required').max(100, 'Last name is too long'),
	grandFatherName: z
		.string()
		.min(1, 'Grand Father name is required')
		.max(100, 'Grand Father name is too long'),

	email: z.string().optional(),

	phone: z
		.string()
		.min(7, 'Phone number must be at least 7 digits')
		.max(20, 'Phone number is too long')
		.regex(/^[\d+\-\s()]+$/, 'Invalid phone number format'),

	position: z.number('Position is required').positive('Position is required'),

	hiredAt: z
		.string({ message: 'Hired At date is required' })
		.min(1, 'Hired At date is required')
		.optional(),

	govId: z
		.file('Please upload a valid image (JPG, PNG, WebP, HEIC/HEIF) or PDF.')
		.max(10_000_000, 'Max file size is 10MB.')
		.optional(),

	contract: z
		.file('Please upload a valid image (JPG, PNG, WebP, HEIC/HEIF) or PDF.')
		.max(10_000_000, 'Max file size is 10MB.')
		.optional()
});

export type EditStaff = z.infer<typeof editStaff>;
