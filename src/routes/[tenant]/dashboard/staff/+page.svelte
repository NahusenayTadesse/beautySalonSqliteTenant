<script lang="ts">
	import { columns } from './columns';

	let { data } = $props();

	import DataTable from '$lib/components/Table/data-table.svelte';

	import Loading from '$lib/components/Loading.svelte';
	import { Frown, Plus } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import FilterMenu from '$lib/components/Table/FilterMenu.svelte';
	import MobileProp from './mobileProp.svelte';

	let filteredList = $derived(data.staffList);
</script>

<svelte:head>
	<title>Staff List</title>
</svelte:head>


	{#if data.staffList.length === 0}
		<div class="flex lg:h-96 h-auto w-full lg:w-5xl flex-col items-center justify-center">
			<p class="justify-self-cente mt-4 flex flex-row gap-4 text-center text-4xl">
				<Frown class="h-12 w-16  animate-bounce" />
				No staff members added yet
			</p>
			<Button href="/dashboard/staff/add-staff"><Plus />Add New Staff Members</Button>
		</div>
	{:else}
	<div class="flex flex-col gap-6">
		<h2 class="my-4 text-2xl lg:block hidden">No of Staff: {data.staffList?.length}</h2>

		<!-- <div class="lg:w-full w-[350px] lg:p-0 p-2 mt-8 mb-4 pt-4">

   <DataTable data={data.staffList} {columns} filterBlacklist={['id']} />
 </div> -->
		<FilterMenu
			data={data.staffList}
			bind:filteredList
			filterKeys={['position', 'years', 'status']}
		/>
		<div class="lg:hidden block">
			<MobileProp bind:staffList={filteredList} />
		</div>
		<div>
		<h2 class="lg:hidden block">Full Details</h2>
		<DataTable data={filteredList} {columns} />
		</div>
	</div>
	{/if}
