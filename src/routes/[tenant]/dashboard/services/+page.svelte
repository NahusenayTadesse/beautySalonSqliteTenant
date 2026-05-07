
  <script lang='ts'>
    import { columns } from "./columns";


  let { data } = $props();

  import DataTable from '$lib/components/Table/data-table.svelte';

	import { Frown, Plus } from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button";
    import FilterMenu from '$lib/components/Table/FilterMenu.svelte';
	import MobileProp from "./mobileProp.svelte";

  let filteredList = $derived(data.serviceList);

</script>

<svelte:head>
        <title> Services List</title>
</svelte:head>




  {#if data.serviceList.length === 0}
     	<div class="flex lg:h-96 h-auto w-full lg:w-5xl flex-col items-center justify-center">
   <p class="text-center flex flex-row gap-4 mt-4 text-4xl justify-self-cente"><Frown class="animate-bounce w-16  h-12" />
     No services added yet </p>
     <Button href="/dashboard/services/add-services"><Plus />Add New Services</Button>

     </div>
 {:else}
     <h2 class="text-2xl my-4 lg:hidden block">No of Services: {data.serviceList?.length} </h2>

 <div class="lg:w-[90%] w-87.5 flex flex-col gap-6 lg:p-0 p-2 mt-8 mb-4 pt-4">
<FilterMenu bind:filteredList data={data?.serviceList} filterKeys={['category', 'price', 'commission', 'saleCount'  ]}  />
	<div class="lg:hidden block">
<MobileProp bind:services={filteredList}/> </div>

	<div>
<h2 class="lg:hidden block">Full Details</h2>

   <DataTable data={filteredList} {columns} fileName="Services List" />
	</div>
 </div>
 {/if}
