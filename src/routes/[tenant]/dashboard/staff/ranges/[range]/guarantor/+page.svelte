<script>
	import SingleTable from '$lib/components/SingleTable.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import EditGuarantor from './editGuarantor.svelte';
	import AddGuarantor from './addGuarantor.svelte';
	import SingleView from '$lib/components/SingleView.svelte';
	import { formatETB } from '$lib/global.svelte';
	import { FileX, Eye, MapPin, IdCard, ArrowLeft } from '@lucide/svelte';
	import { page } from '$app/state';
	let { data } = $props();

	let employeeGuarantor = $derived([
		{ name: 'Name', value: data?.guarantor?.name },
		{ name: 'Phone', value: data?.guarantor?.phone.slice(0, 15) },
		{ name: 'Email', value: data?.guarantor?.email },
		{
			name: 'Relationship',
			value:
				data?.guarantor?.relationship !== 'other'
					? data?.guarantor?.relationship
					: data?.guarantor?.relation
		},
		{ name: 'Job Type', value: data?.guarantor?.jobType },
		{ name: 'Company', value: data?.guarantor?.company },
		{ name: 'Salary', value: formatETB(Number(data?.guarantor?.salary), true) }
	]);

	let guarantorAddress = $derived([
		{ name: 'Subcity', value: data?.guarantor?.subcity },
		{ name: 'Street', value: data?.guarantor?.street },
		{ name: 'Kebele', value: data?.guarantor?.kebele },
		{ name: 'Building', value: data?.guarantor?.buildingNumber },
		{ name: 'Floor', value: data?.guarantor?.floor },
		{ name: 'House Number', value: data?.guarantor?.houseNumber }
	]);
</script>

<svelte:head>
	<title>Guarantor Details</title>
</svelte:head>
<Button class="my-3 justify-self-start" href="/dashboard/staff/ranges/{page.params.range}">
	<ArrowLeft /> Back to {data?.staffMember?.firstName}
	{data?.staffMember?.lastName}
</Button>
<SingleView title="Guarantor Details" class="w-full!">
	<div class="grid grid-cols-1 gap-4 px-4 py-4 wrap-break-word lg:grid-cols-2">
		{#if data.guarantor}
			<div class="flex flex-col gap-2">
				<h4 class="flex items-center gap-2">
					<IdCard /> Guarantor Details
					{#key data?.guarantor}
						<EditGuarantor formData={data?.editGuarantorForm} data={data?.guarantor} />
					{/key}
				</h4>
				{#if data.guarantor}
					<SingleTable singleTable={employeeGuarantor} />
				{/if}
			</div>
			<div class="flex flex-col gap-2">
				<h4 class="flex items-center gap-2">
					<MapPin /> Guarantor Address
				</h4>
				<SingleTable singleTable={guarantorAddress} />
			</div>
		{:else}
			No Guarantor!
			<AddGuarantor data={data?.addGuarantorForm} />
		{/if}
	</div>
	<div class="flex w-full flex-wrap items-center gap-2">
		{#if data?.guarantor?.photo}
			<Button
				variant="outline"
				href="/dashboard/files/{data?.guarantor?.photo}"
				target="_blank"
				rel="noopener noreferrer"
			>
				<Eye class="mr-2" size={16} />
				View Photo
			</Button>
		{:else}
			<Button variant="ghost" disabled class="cursor-not-allowed">
				<FileX class="mr-2" size={16} />
				No Photo Added
			</Button>
		{/if}
		{#if data?.guarantor?.govtId}
			<Button
				title="View {data?.guarantor?.name}'s ID"
				variant="outline"
				href="/dashboard/files/{data?.guarantor?.govtId}"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="View {data?.guarantor?.name}'s Government Id(FIDA) in a new tab"
			>
				<Eye /> View Guarantor ID
			</Button>
		{:else}
			<Button variant="ghost" disabled class="cursor-not-allowed">
				<FileX class="mr-2" size={16} />
				No Id Added
			</Button>
		{/if}
		{#if data?.guarantor?.gurantorDocument}
			<Button
				title="View {data?.guarantor?.name}'s ID"
				variant="outline"
				href="/dashboard/files/{data?.guarantor?.gurantorDocument}"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="View {data?.guarantor?.name}'s Government Id(FIDA) in a new tab"
			>
				<Eye /> View Guarantor Document
			</Button>
		{:else}
			<Button variant="ghost" disabled class="cursor-not-allowed">
				<FileX class="mr-2" size={16} />
				No Id Added
			</Button>
		{/if}
	</div>
</SingleView>
