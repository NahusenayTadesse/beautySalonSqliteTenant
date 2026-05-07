<script lang="ts">
	import { columns } from './columns';

	let { data } = $props();
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import DataTable from '$lib/components/Table/data-table.svelte';

	import { getLocalTimeZone, today } from '@internationalized/date';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import { CalendarDate } from '@internationalized/date';
	import { page } from '$app/state';
	import * as Card from '$lib/components/ui/card/index.js';

	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import FilterMenu from '$lib/components/Table/FilterMenu.svelte';
	import { CalendarDays, Frown } from '@lucide/svelte';
	import { formatEthiopianDate } from '$lib/global.svelte';
	import MobileProp from '$lib/components/mobileProp.svelte';

	let todayDate = today(getLocalTimeZone());
	let value = $state<CalendarDate | undefined>(todayDate);
	let urlDate = $state(page.url.pathname.split('/').pop() || today(getLocalTimeZone()).toString());
	const [year, month, day] = urlDate.split('-').map(Number);

	let placeholder = $derived(todayDate);
	let open = $state(false);
	let filteredList = $derived(data.appointmentsList);


</script>

<svelte:head>
	<title>Appointments on {formatEthiopianDate(new Date(data.date))}</title>
</svelte:head>
<div>
	<Popover.Root bind:open>
		<Popover.Trigger class={buttonVariants({ variant: 'outline' })}>
			<CalendarDays /> {formatEthiopianDate(new Date(value?.toString()))}</Popover.Trigger
		>
		<Popover.Content class="p-0">
			<Card.Root>
				<Card.Header>
					<Card.Title>Appointment</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="text-sm text-muted-foreground">
						Ethiopian Date: <span class="font-semibold text-foreground"
							>{formatEthiopianDate(new Date(value?.toString()))}</span
						>
					</div>
					<Calendar
						locale="am-ET"
						type="single"
						bind:placeholder
						bind:value
						onValueChange={() => {
							goto(`/dashboard/appointments/${value}`);
							open = false;
						}}
						class="bg-transparent p-0"
					/>
				</Card.Content>
				<Card.Footer class="flex flex-wrap gap-2 border-t px-4 !pt-4">
					{#each [{ label: 'Today', value: 0 }, { label: 'Tomorrow', value: 1 }, { label: 'In 3 days', value: 3 }, { label: 'In a week', value: 7 }, { label: 'In 2 weeks', value: 14 }] as preset (preset.value)}
						<Button
							variant="outline"
							size="sm"
							class="flex-1"
							onclick={() => {
								value = todayDate?.add({ days: preset.value });
								goto(`/dashboard/appointments/${value}`);
								open = false;
							}}
						>
							{preset.label}
						</Button>
					{/each}
				</Card.Footer>
			</Card.Root>
		</Popover.Content>
	</Popover.Root>
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
		<p class="mt-4 flex flex-row gap-2 justify-self-center text-center text-4xl">
			<Frown class="h-12 w-16  animate-bounce" />
			No appointments for this date, try another date.
		</p>
	</div>
{:else}
	<h2 class="my-4 text-2xl hidden lg:block">No of appointments: {data.appointmentsList?.length}</h2>

	<div class="mt-8 flex flex-col gap-4 mb-4 w-87.5 p-2 pt-4 lg:w-full lg:p-0">
	<div class="lg:hidden block">   <MobileProp bind:appointments={filteredList} /></div>

        <h2 class="lg:hidden block">Full Details</h2>
		<DataTable data={filteredList} {columns} fileName="Appointment List for {formatEthiopianDate(new Date(data?.date))}" />
	</div>
{/if}
