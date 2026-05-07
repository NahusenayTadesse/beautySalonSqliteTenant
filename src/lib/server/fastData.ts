import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { paymentMethods as paymentMethod } from '$lib/server/db/schema/';

export async function paymentMethods() {
	const paymentMethods = await db
		.select({
			value: paymentMethod.id,
			name: paymentMethod.name
		})
		.from(paymentMethod)
		.where(eq(paymentMethod.isActive, true));

	return paymentMethods;
}
