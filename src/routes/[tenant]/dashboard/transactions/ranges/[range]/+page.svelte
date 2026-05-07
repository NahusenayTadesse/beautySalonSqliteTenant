<script lang="ts">
	import { columns } from './columns';

	let { data } = $props();

	import DataTable from '$lib/components/Table/data-table.svelte';

	import Loading from '$lib/components/Loading.svelte';
	import { Frown } from '@lucide/svelte';
	import DateMonth from '$lib/formComponents/DateMonth.svelte';
	import FilterMenu from '$lib/components/Table/FilterMenu.svelte';
	import MobileProp from './mobileProp.svelte';

	let filteredList = $derived(data.allTransactions);


</script>

<svelte:head>
	<title>Transactions</title>
</svelte:head>


	{#if data.allTransactions.length === 0}
	<div class="flex lg:h-96 h-auto w-full lg:w-5xl flex-col items-center justify-center">
			<p class="justify-self-cente mt-4 flex flex-row gap-4 text-center text-4xl">
				<Frown class="h-12 w-16  animate-bounce" />

				Transactions is Empty for this Date Range Choose Another Range
			</p>
			<DateMonth start={data?.start} end={data?.end} link="/dashboard/transactions/ranges" />
		</div>
	{:else}
		<div class="flex w-full flex-col gap-4">
			<h2 class="my-4 text-2xl">No of Transactions {data.allTransactions?.length}</h2>

			<DateMonth start={data?.start} end={data?.end} link="/dashboard/transactions/ranges" />
          <FilterMenu bind:filteredList data={data.allTransactions} filterKeys={['amount', 'customerName', 'paymentMethods', 'noOfProducts', 'noOfServices', 'noOfSupplies', 'recievedBy']} />
          <div class="lg:hidden block">
				<MobileProp bind:transactions ={filteredList} />
			</div>
			<div>
			<h2 class="lg:hidden block">Full Details</h2>
			<DataTable data={filteredList} {columns} class="max-w-6xl!" fileName="Transactions List from {data.start} - {data.end}" />
			</div>
		</div>
	{/if}
