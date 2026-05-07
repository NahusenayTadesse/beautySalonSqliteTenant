<script lang="ts">
	import { columns } from './columns';

	let { data } = $props();

	import DataTable from '$lib/components/Table/data-table.svelte';

	import Loading from '$lib/components/Loading.svelte';
	import { Frown, Plus } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import FilterMenu from '$lib/components/Table/FilterMenu.svelte';
	import MobileComp from './mobileComp.svelte';

	let filteredList = $derived(data?.productList);
</script>

<svelte:head>
	<title>Products List</title>
</svelte:head>

	{#if data.productList.length === 0}
	<div class="flex lg:h-96 h-auto w-full lg:w-5xl flex-col items-center justify-center">
			<p class="justify-self-cente mt-4 flex flex-row gap-4 text-center text-4xl">
				<Frown class="h-12 w-16  animate-bounce" />
				Products List is Empty
			</p>
			<Button href="/dashboard/products/add-products"><Plus />Add New Products</Button>
		</div>
	{:else}
		<h2 class="my-4 text-2xl">No of Products {data.productList?.length}</h2>

		<div class="mt-8 mb-4 w-[350px] p-0 pt-4 lg:w-full lg:p-0">
			<FilterMenu
				bind:filteredList
				data={data?.productList}
				filterKeys={['category', 'commission', 'saleCount', 'quantity', 'supplier']}
			/>

			<div class="lg:hidden block">
				<MobileComp bind:products ={filteredList} />
			</div>
			<div>
			<h2 class="lg:hidden block">Full Details</h2>


			<DataTable data={data.productList} {columns} fileName="Products List"   />
			</div>
		</div>
	{/if}
