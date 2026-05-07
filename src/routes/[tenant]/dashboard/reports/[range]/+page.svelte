<script lang="ts">
	import { columns } from './columns';

	let { data } = $props();

	import DataTable from '$lib/components/Table/data-table.svelte';

	import Loading from '$lib/components/Loading.svelte';
	import { Frown } from '@lucide/svelte';
	import DateMonth from '$lib/formComponents/DateMonth.svelte';
	import FilterMenu from '$lib/components/Table/FilterMenu.svelte';
	import MobileProp from './mobileProp.svelte';
	let filteredList = $derived(data.allReports);
</script>

<svelte:head>
	<title>Reports</title>
</svelte:head>


	{#if data.allReports.length === 0}
	<div class="flex lg:h-96 h-auto w-full lg:w-5xl flex-col items-center justify-center">
			<p class="justify-self-cente mt-4 flex flex-row gap-4 text-center text-4xl">
				<Frown class="h-12 w-16  animate-bounce" />

				Reports is Empty for this Date Range Choose Another Range
			</p>
			<DateMonth start={data?.start} end={data?.end} link="/dashboard/reports" />
		</div>
	{:else}
	  <div class="flex flex-col gap-6">
		<h2 class="my-4 text-2xl lg:hidden block">No of Reports: {data.allReports?.length}</h2>


		<DateMonth start={data?.start} end={data?.end} link="/dashboard/reports" />

		<FilterMenu bind:filteredList data={data.allReports}
	 filterKeys={['bookedAppointments', 'productsSold', 'serviceRendered', 'dailyExpenses', 'dailyIncome', 'transactions', 'staffPaid', 'totalStaffPaid', 'staffHired', 'staffFired']} />

		<div class="">
			<MobileProp bind:reports={filteredList} />
		</div>
		<div>
		<h2 class="">Full Details</h2>
		<DataTable data={filteredList} {columns} class="lg:max-w-6xl!" fileName="Reports for {data?.start} to {data?.end}" />
		</div>
			</div>
	{/if}
