import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { editStaff as schema } from './schema';

import { db } from '$lib/server/db';
import {
	products,
	services,
	staff,
	staffAccounts,
	staffSchedule,
	staffTypes,
	tipsProduct,
	transactionProducts,
	transactionServices,
	user,
	paymentMethods,
	staffContacts,
	staffFamilies
} from '$lib/server/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';
import { tipsService } from '$lib/server/db/schema';
import {
	addAccount,
	addContact,
	addSchedule,
	editAccount,
	editSchedule,
	reinstate,
	terminate,
	editContact,
	addFamily,
	editFamily
} from './schema';

export const load: LayoutServerLoad = async ({ params, locals }) => {
	const { range } = params;

	const id = range.split('-').pop();

	const form = await superValidate(zod4(schema));
	const add = await superValidate(zod4(addSchedule));
	const edit = await superValidate(zod4(editSchedule));
	const terminated = await superValidate(zod4(terminate));
	const reinstated = await superValidate(zod4(reinstate));
	const addAccountForm = await superValidate(zod4(addAccount));
	const editAccountForm = await superValidate(zod4(editAccount));
	const addContactForm = await superValidate(zod4(addContact));
	const editContactForm = await superValidate(zod4(editContact));
	const addFamilyForm = await superValidate(zod4(addFamily));
	const editFamilyForm = await superValidate(zod4(editFamily));

	const staffMember = await db
		.select({
			id: staff.id,
			firstName: staff.firstName,
			lastName: staff.lastName,
			grandFatherName: staff.grandFatherName,
			category: staffTypes.name,
			categoryId: staffTypes.id,
			phone: staff.phone,
			email: staff.email,
			status: staff.isActive,
			hireDate: staff.hireDate,
			govId: staff.govtId,
			contract: staff.contract,
			employmentStatus: staff.employmentStatus,
			addedBy: user.name,
			years: sql<number>`CAST((julianday('now') - julianday(${staff.hireDate})) / 365.25 AS INTEGER)`
		})
		.from(staff)
		.leftJoin(staffTypes, eq(staff.type, staffTypes.id))
		.leftJoin(user, eq(staff.createdBy, user.id))
		.where(eq(staff.id, Number(id)))
		.then((rows) => rows[0]);

	const today = new Date().toISOString().split('T')[0];
	const serviceTipsToday = await db
		.select({
			staffId: tipsService.staffId,
			service: services.name,
			amount: tipsService.amount,
			date: tipsService.tipDate
		})
		.from(tipsService)
		.leftJoin(transactionServices, eq(tipsService.saleItemId, transactionServices.id))
		.leftJoin(services, eq(transactionServices.serviceId, services.id))

		.where(and(eq(tipsService.staffId, Number(id)), eq(tipsService.tipDate, new Date(today))));

	const productTipsToday = await db
		.select({
			staffId: tipsProduct.staffId,
			product: products.name,
			amount: tipsProduct.amount,
			date: tipsProduct.tipDate
		})
		.from(tipsProduct)
		.leftJoin(transactionProducts, eq(tipsProduct.saleItemId, transactionProducts.id))
		.leftJoin(products, eq(transactionProducts.productId, products.id))

		.where(and(eq(tipsProduct.staffId, Number(id)), eq(tipsProduct.tipDate, new Date(today))));

	const categories = await db
		.select({
			value: staffTypes.id,
			name: staffTypes.name,
			description: staffTypes.description
		})
		.from(staffTypes);

	const schedules = await db
		.select({
			id: staffSchedule.id,
			day: staffSchedule.weekDay,
			startTime: staffSchedule.startTime,
			endTime: staffSchedule.endTime,
			status: staffSchedule.isActive,
			addedBy: user.name,
			addedById: user.id
		})
		.from(staffSchedule)
		.leftJoin(user, eq(staffSchedule.createdBy, user.id))
		.where(eq(staffSchedule.staffId, Number(id)));

	const accounts = await db
		.select({
			id: staffAccounts.id,
			paymentMethod: paymentMethods.name,
			accountDetail: staffAccounts.accountDetail,
			paymentMethodId: staffAccounts.paymentMethodId,
			status: staffAccounts.isActive,
			addedBy: user.name,
			addedById: user.id
		})
		.from(staffAccounts)
		.leftJoin(user, eq(staffAccounts.createdBy, user.id))
		.leftJoin(paymentMethods, eq(staffAccounts.paymentMethodId, paymentMethods.id))
		.where(eq(staffAccounts.staffId, Number(id)))
		.orderBy(desc(staffAccounts.isActive));

	let contacts = await db
		.select({
			id: staffContacts.id,
			contactType: staffContacts.contactType,
			contactDetail: staffContacts.contactDetail,
			status: staffContacts.isActive,
			addedBy: user.name,
			addedById: user.id
		})
		.from(staffContacts)
		.leftJoin(user, eq(staffContacts.createdBy, user.id))
		.where(eq(staffContacts.staffId, Number(id)));

	let family = await db
		.select({
			id: staffFamilies.id,
			name: staffFamilies.name,
			gender: staffFamilies.gender,
			phone: staffFamilies.phone,
			email: staffFamilies.email,
			relationShip: staffFamilies.relationship, // Note: watch for casing (relationShip vs relationship)
			otherRelationShip: staffFamilies.otherRelationship,
			emergencyContact: staffFamilies.emergencyContact,
			status: staffFamilies.isActive,
			addedBy: user.name,
			addedById: user.id
		})
		.from(staffFamilies)
		.leftJoin(user, eq(staffFamilies.createdBy, user.id))
		.where(eq(staffFamilies.staffId, Number(id)))
		.orderBy(desc(staffFamilies.emergencyContact));

	return {
		staffMember,
		form,
		categories,
		productTipsToday,
		serviceTipsToday,
		add,
		edit,
		schedules,
		terminated,
		reinstated,
		addAccountForm,
		editAccountForm,
		accounts,
		addContactForm,
		editContactForm,
		contacts,
		addFamilyForm,
		editFamilyForm,
		family
	};
};
