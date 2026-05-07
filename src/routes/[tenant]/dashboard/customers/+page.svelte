<script lang="ts">
	import { columns } from './columns';

	let { data } = $props();

	import DataTable from '$lib/components/Table/data-table.svelte';

	import Loading from '$lib/components/Loading.svelte';
	import { Frown } from '@lucide/svelte';
	import MobileProp from './mobileProp.svelte';
</script>

<svelte:head>
	<title>Customers List</title>
</svelte:head>


	{#if data.customersList.length === 0}
	<div class="flex lg:h-96 h-auto w-full lg:w-5xl flex-col items-center justify-center">
			<p class="justify-self-cente mt-4 flex flex-row gap-4 text-center text-4xl">
				<Frown class="h-12 w-16  animate-bounce" />
				No customers added Yet for this date
			</p>
		</div>
	{:else}
		<h2 class="my-4 text-2xl">No of customers {data.customersList?.length}</h2>


		<div class="lg:hidden block">
			<MobileProp customers ={data.customersList} />
		</div>
		<div>
		<h2 class="lg:hidden block">Full Details</h2>

		<DataTable data={data.customersList}  {columns} fileName="Customers List" />
		</div>
	{/if}
