<script lang='ts'>
    import { columns } from "./columns";


  let { data } = $props();
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import DataTable from '$lib/components/Table/data-table.svelte';

      import { getLocalTimeZone, today } from "@internationalized/date";
  import { Calendar } from "$lib/components/ui/calendar/index.js";
  import { CalendarDate } from "@internationalized/date";
  import { page } from '$app/state'
	import * as Card from '$lib/components/ui/card/index.js';

	import { goto } from '$app/navigation';
    import Button from "$lib/components/ui/button/button.svelte";
	import { CalendarDays, Frown } from '@lucide/svelte';
	import DateMonth from "$lib/formComponents/DateMonth.svelte";
	import FilterMenu from '$lib/components/Table/FilterMenu.svelte';
	import MobileProp from '$lib/components/mobileProp.svelte';
	import { formatEthiopianDate } from "$lib/global.svelte";
  let todayDate = today(getLocalTimeZone());
  let value = $state<CalendarDate | undefined>(todayDate);
  let urlDate = $state(page.url.pathname.split('/').pop() || today(getLocalTimeZone()).toString());
    const [year, month, day] = urlDate.split("-").map(Number);

  let placeholder = $derived(todayDate);
  let open = $state(false);
  	let filteredList = $derived(data.appointmentsList);


</script>

<svelte:head>
        <title> Appointments on {placeholder}</title>
</svelte:head>
 <div>

   <DateMonth start={data?.start} end={data?.end} link="/dashboard/appointments/all-appointments"  />



  </div>
  <!-- <div class="lg:w-full w-4/5 mt-8">
 {#if data.appointmentsList.length === 0}
   <p class="text-center">No appointments for this date.</p>
 {:else}
 <ChildrenTable {tableHeaders} mainlist={data.appointmentsList} search={true} link="appointments/single"  />
  {/if}
 </div> -->
  {#if data.appointmentsList.length === 0}
     	<div class="mt-8 flex h-auto w-full flex-col items-center justify-center gap-8 lg:h-96 lg:w-5xl">
   <p class="text-center flex flex-row gap-4 mt-4 text-4xl justify-self-cente"><Frown class="animate-bounce w-16  h-12" />
     No appointments for this date range, try another date range. </p>
     </div>
 {:else}
	<h2 class="my-4 text-2xl hidden lg:block">No of appointments: {data.appointmentsList?.length}</h2>

	<div class="mt-8 flex flex-col gap-4 mb-4 w-87.5 p-2 pt-4 lg:w-full lg:p-0">
	<div class="lg:hidden block">   <MobileProp bind:appointments={filteredList} /></div>

        <h2 class="lg:hidden block">Full Details </h2>
		<DataTable data={filteredList} {columns} fileName="Appointment List for {data.start} to {data.end}"  />
	</div>
 {/if}
