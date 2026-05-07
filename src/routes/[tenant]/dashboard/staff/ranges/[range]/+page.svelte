<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { editStaff } from './schema.js';

	let { data } = $props();

	import SingleTable from '$lib/components/SingleTable.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { fileProxy, superForm } from 'sveltekit-superforms/client';

	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import { ArrowLeft, Eye, Pencil, Plus, Save, Trash } from '@lucide/svelte';
	import SelectComp from '$lib/formComponents/SelectComp.svelte';
	import InputComp from '$lib/formComponents/InputComp.svelte';

	import type { Snapshot } from '@sveltejs/kit';

	import DatePicker2 from '$lib/formComponents/DatePicker2.svelte';
	import { fly } from 'svelte/transition';
	import Delete from '$lib/forms/Delete.svelte';
	import DataTable from '$lib/components/Table/data-table.svelte';
	import { commissionProduct, commissionService, overtime } from './columns.js';
	import DateMonth from '$lib/formComponents/DateMonth.svelte';
	import SingleView from '$lib/components/SingleView.svelte';

	let singleTable = $derived([
		{ name: 'Name', value: `${data.staffMember?.firstName} ${data.staffMember?.lastName} ${data.staffMember?.grandFatherName}` },
		{ name: 'Position', value: data.staffMember?.category },
		{ name: 'Hired On', value: formatEthiopianDate(new Date(data.staffMember?.hireDate)) },
		{ name: 'Added By', value: data.staffMember?.addedBy },
		{
			name: 'Employment Status',
			value:
				data.staffMember?.employmentStatus === 'terminated'
					? 'Terminated'
					: data.staffMember?.employmentStatus
		},
		{ name: 'Status', value: data.staffMember?.status ? 'Active' : 'InActive' }
	]);

	const { form, errors, enhance, delayed, capture, restore, message } = superForm(data.form, {
		validators: zod4Client(editStaff),
		resetForm: false
	});

	import { toast } from 'svelte-sonner';
	$effect(() => {
		if ($message) {
			if ($message.type === 'error') {
				toast.error($message.text);
			} else {
				toast.success($message.text);
			}
		}
	});

	$form.staffId = data?.staffMember?.id;

	$form.firstName = data?.staffMember?.firstName;
	$form.lastName = data?.staffMember?.lastName;
	$form.grandFatherName = data?.staffMember?.grandFatherName;
	$form.position = data?.staffMember?.categoryId;
	$form.phone = data?.staffMember?.phone;
	$form.email = data?.staffMember?.email;
	$form.hiredAt = data?.staffMember?.hireDate;

	export const snapshot: Snapshot = { capture, restore };

	let edit = $state(false);

	const govId = fileProxy(form, 'govId');
	const contract = fileProxy(form, 'contract');

	let govtId = $state(false);
	let contractPdf = $state(false);

	import Schedules from './schedules.svelte';
	import Terminate from './terminate.svelte';
	import Reinstate from './reinstate.svelte';
	import Accounts from './accounts.svelte';
	import Contacts from './contacts.svelte';
	import Families from './Families.svelte';

	import { page } from '$app/state';
	import { formatEthiopianDate } from '$lib/global.svelte.js';
</script>

<svelte:head>
	<title>
		{data?.staffMember
			? `${data.staffMember.firstName} ${data.staffMember.lastName} - Staff Details`
			: 'Staff Details'}</title
	>
</svelte:head>

<SingleView title="Staff Details" class="lg:w-full!" >
	<div class="mt-4 flex w-full flex-row flex-wrap items-start justify-start gap-2 pl-4">
		<Button onclick={() => (edit = !edit)}>
			{#if !edit}
				<Pencil class="h-4 w-4" />
				Edit
			{:else}
				<ArrowLeft class="h-4 w-4" />

				Back
			{/if}
		</Button>
		{#if data?.staffMember?.employmentStatus !== 'terminated'}
			<Terminate
				data={data?.terminated}
				employee="{data?.staffMember?.firstName} {data?.staffMember?.lastName} "
			/>
		{:else}
			<Reinstate
				data={data?.reinstated}
				employee="{data?.staffMember?.firstName} {data?.staffMember?.lastName} "
			/>
		{/if}
		<Button href="/dashboard/staff/ranges/{page.params.range}/guarantor">Guarantor</Button>
	</div>
	{#if edit === false}
		<div class="w-full p-4"><SingleTable {singleTable} />
			{#if data?.staffMember?.govId}
				<Button href="/dashboard/files/{data?.staffMember?.govId}" target="_blank"> <Eye /> View Government Id</Button>
			{/if}
			{#if data?.staffMember?.contract}
				<Button href="/dashboard/files/{data?.staffMember?.contract}" target="_blank"><Eye /> View Contract</Button>
			{/if}
		</div>
	{/if}
	{#if edit}
		<div class="w-full p-4">
			<form
				use:enhance
				action="?/editStaff"
				id="main"
				class="flex flex-col gap-4"
				method="POST"
				enctype="multipart/form-data"
			>



					{@render fe('Name', 'firstName', 'text', "Enter Staff's Name", true)}
					{@render fe('Father Name', 'lastName', 'text', "Enter Staff's Father Name", true)}
					{@render fe('Grand Father Name', 'grandFatherName', 'text', "Enter Staff's Grand Father Name", true)}

				{@render selects('position', data?.categories)}

				{@render fe('Phone', 'phone', 'tel', 'Enter Phone Number', true)}

				{@render fe('Email', 'email', 'email', 'Enter Email', true)}
				<!-- {@render fe('Salary', 'salary', 'number', 'Enter Salary', true)} -->

				<InputComp {form} {errors} label="Hired On" name="hiredAt" type="date" placeholder="Enter Hired On"  />
				<InputComp {form} {errors} label="Goverment Id" name="govId" type="file" placeholder="Enter Goverment Id"
			    image={data?.staffMember?.govId ? data?.staffMember?.govId : ''}
			 />
				<InputComp {form} {errors} label="Contract" name="contract" type="file" placeholder="Enter Contract"
			    image={data?.staffMember?.contract ? data?.staffMember?.contract : ''}
			 />
				<input type="hidden" name="staffId" bind:value={$form.staffId} />
				<Button type="submit" class="mt-4" form="main">
					{#if $delayed}
						<LoadingBtn name="Saving Changes" />
					{:else}
						<Save class="h-4 w-4" />

						Save Changes
					{/if}
				</Button>
			</form>
		</div>
	{/if}
</SingleView>
{#snippet totals(data, name = 'Tips')}
	<div
		class="mt-4 flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
	>
		<div class="text-sm text-gray-600 dark:text-gray-300">Total {name}</div>
		<div class="text-lg font-semibold text-gray-900 dark:text-gray-100">
			{new Intl.NumberFormat(undefined, {
				style: 'currency',
				currency: 'ETB',
				maximumFractionDigits: 2
			}).format(data.reduce((sum, row) => sum + Number(row?.amount ?? 0), 0))}
		</div>
	</div>
{/snippet}
<div class="mt-4">
	<h4>Shift Schedule</h4>
	<Schedules data={data?.schedules} form={data?.edit} addForm={data?.add} />
</div>
<div class="mt-4">
	<h4>Bank Accounts</h4>
	<Accounts
		data={data?.accounts}
		form={data?.editAccountForm}
		addForm={data?.addAccountForm}
		paymentMethods={data?.bankList}
	/>
</div>

<div class="mt-4">
	<h4>Family Members</h4>
	<Families data={data?.family} form={data?.editFamilyForm} addForm={data?.addFamilyForm} />
</div>
<div class="mt-4">
	<h4>Contact Information</h4>
	<Contacts data={data?.contacts} form={data?.editContactForm} addForm={data?.addContactForm} />
</div>
<div class="my-8 w-full lg:w-1/2">
	<div class="mb-6">
		<h3 class="text-lg font-semibold">Product Tips Today</h3>
		<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
			Tips earned from product sales by {data?.staffMember?.firstName}
			{data?.staffMember?.lastName}.
		</p>
		<DataTable data={data.productTipsToday} columns={commissionProduct} search={false} />

		{@render totals(data.productTipsToday, 'Product Tips')}
	</div>

	<div class="mb-6">
		<h3 class="text-lg font-semibold">Service Tips Today</h3>
		<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
			Tips earned from services performed by {data?.staffMember?.firstName} Today
			{data?.staffMember?.lastName}.
		</p>
		<DataTable data={data.serviceTipsToday} columns={commissionService} search={false} />

		{@render totals(data.serviceTipsToday, 'Service Tips')}
	</div>
</div>

<div class="my-8 w-full lg:w-1/2">
	<DateMonth
		id={data.staffMember?.id}
		link="/dashboard/staff"
		start={data?.start}
		end={data?.end}
	/>

	<div class="mb-6">
		<h3 class="text-lg font-semibold">Product Tips</h3>
		<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
			Tips earned from product sales by {data?.staffMember?.firstName}
			{data?.staffMember?.lastName}.
		</p>
		<DataTable data={data.productTips} columns={commissionProduct} search={false} />

		{@render totals(data.productTips, 'Product Tips')}
	</div>

	<div class="mb-6">
		<h3 class="text-lg font-semibold">Service Tips</h3>
		<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
			Tips earned from services performed by {data?.staffMember?.firstName}
			{data?.staffMember?.lastName}.
		</p>
		<DataTable data={data.serviceTips} columns={commissionService} search={false} />

		{@render totals(data.serviceTips, 'Service Tips')}
	</div>

	<div class="mb-6">
		<h3 class="text-lg font-semibold">Product Commissions</h3>
		<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
			Commissions earned from product sales by {data?.staffMember?.firstName}
			{data?.staffMember?.lastName}.
		</p>
		<DataTable data={data.productCommissions} columns={commissionProduct} search={false} />
		{@render totals(data.productCommissions, 'Product Commisions')}
	</div>

	<div class="mb-6">
		<h3 class="text-lg font-semibold">Service Commissions</h3>
		<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
			Commissions earned from services performed by {data?.staffMember?.firstName}
			{data?.staffMember?.lastName}.
		</p>
		<DataTable data={data.serviceCommissions} columns={commissionService} search={false} />
		{@render totals(data.serviceCommissions, 'Service Commisions')}
	</div>

	<div class="mb-6">
		<h3 class="text-lg font-semibold">Overtime Records</h3>
		<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
			Logged overtime shifts and corresponding pay.
		</p>
		<DataTable data={data.staffOvertime} columns={overtime} search={false} />
		{@render totals(data.staffOvertime, 'Overtime')}
	</div>

	<div class="mb-6">
		<h3 class="text-lg font-semibold">Deductions</h3>
		<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
			Salary deductions applied to {data?.staffMember?.firstName}
			{data?.staffMember?.lastName}.
		</p>
		<DataTable data={data.staffDeductions} columns={overtime} search={false} />
		{@render totals(data.staffDeductions, 'Deductions')}
	</div>

	<div class="mb-6">
		<h3 class="text-lg font-semibold">Bonuses</h3>
		<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
			Bonuses awarded to {data?.staffMember?.firstName}
			{data?.staffMember?.lastName}.
		</p>
		<DataTable data={data.staffBonuses} columns={overtime} search={false} />
		{@render totals(data.staffBonuses, 'Bonuses')}
	</div>
</div>

{#snippet fe(
	label = '',
	name = '',
	type = '',
	placeholder = '',
	required = false,
	min = '',
	max = ''
)}
	<div class="flex w-full flex-col justify-start gap-2">
		<Label for={name}>{label}</Label>
		<Input
			{type}
			{name}
			{placeholder}
			{required}
			{min}
			{max}
			bind:value={$form[name]}
			aria-invalid={$errors[name] ? 'true' : undefined}
		/>
		{#if $errors[name]}
			<span class="text-red-500">{$errors[name]}</span>
		{/if}
	</div>
{/snippet}
{#snippet selects(name, items)}
	<div class="flex w-full flex-col justify-start gap-2">
		<Label for={name} class="capitalize">{name.replace(/([a-z])([A-Z])/g, '$1 $2')}:</Label>

		<SelectComp {name} bind:value={$form[name]} {items} />
		{#if $errors[name]}<span class="text-red-500">{$errors[name]}</span>{/if}
	</div>
{/snippet}
