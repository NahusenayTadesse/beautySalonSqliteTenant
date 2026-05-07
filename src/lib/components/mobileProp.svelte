<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import {
		Search,
		Phone,
		User,
		Calendar,
		Clock,
		StickyNote,
		DollarSign,
		ChevronDown,
		ChevronUp,
		Filter,

		Eye

	} from '@lucide/svelte';
	import { formatEthiopianDate } from '$lib/global.svelte';
	import Statuses from '$lib/components/Table/statuses.svelte';

	type AppointmentStatus = 'pending' | 'completed' | 'cancelled';

	type Appointment = {
		extraSettings: number;
		customerName: string;
		phone: string | null;
		status: AppointmentStatus;
		bookedById: number;
		booker: string;
		date: string;
		time: string;
		notes: string | null;
		bookedAt: string;
		paidAmount: number;
	};

	type SortKey = 'date' | 'time' | 'customerName' | 'paidAmount' | 'status';

	let { appointments = $bindable() }: { appointments: Appointment[] } = $props();

	let search = $state('');
	let activeStatus = $state<AppointmentStatus | 'all'>('all');
	let sortKey = $state<SortKey>('date');
	let sortAsc = $state(true);
	let expandedId = $state<number | null>(null);

	const STATUS_CONFIG: Record<
		AppointmentStatus,
		{ label: string; class: string; dot: string }
	> = {
		pending: {
			label: 'Pending',
			class: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
			dot: 'bg-amber-500'
		},
		completed: {
			label: 'Completed',
			class: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
			dot: 'bg-emerald-500'
		},
		cancelled: {
			label: 'Cancelled',
			class: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
			dot: 'bg-rose-500'
		}
	};

	const STATUS_FILTERS: { value: AppointmentStatus | 'all'; label: string }[] = [
		{ value: 'all', label: 'All' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'cancelled', label: 'Cancelled' }
	];

	function formatTime(time: string) {
		const [h, m] = time.split(':').map(Number);
		const ampm = h >= 12 ? 'PM' : 'AM';
		return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
	}

	function formatDate(date: string) {
		return  formatEthiopianDate (new Date(date));
	}

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(amount);
	}

	function toggleSort(key: SortKey) {
		if (sortKey === key) sortAsc = !sortAsc;
		else {
			sortKey = key;
			sortAsc = true;
		}
	}

	const filtered = $derived(() => {
		const q = search.toLowerCase().trim();
		return appointments
			.filter((a) => {
				const matchesSearch =
					!q ||
					a.customerName.toLowerCase().includes(q) ||
					(a.phone ?? '').includes(q) ||
					a.booker.toLowerCase().includes(q) ||
					a.date.includes(q);
				const matchesStatus = activeStatus === 'all' || a.status === activeStatus;
				return matchesSearch && matchesStatus;
			})
			.sort((a, b) => {
				let av: string | number = a[sortKey] ?? '';
				let bv: string | number = b[sortKey] ?? '';
				if (typeof av === 'string') av = av.toLowerCase();
				if (typeof bv === 'string') bv = bv.toLowerCase();
				if (av < bv) return sortAsc ? -1 : 1;
				if (av > bv) return sortAsc ? 1 : -1;
				return 0;
			});
	});

	const counts = $derived(() => {
		const c = { all: appointments.length, pending: 0, completed: 0, cancelled: 0 };
		for (const a of appointments) c[a.status]++;
		return c;
	});

	function toggleExpand(id: number) {
		expandedId = expandedId === id ? null : id;
	}

	const SortIcon = (key: SortKey) => {
		if (sortKey !== key) return null;
		return sortAsc ? ChevronUp : ChevronDown;
	};
</script>

<div class="w-full space-y-4 font-sans">
	<!-- Header -->
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
				Appointments
			</h2>
			<p class="text-sm text-gray-500 dark:text-gray-400">
				{filtered().length} of {appointments.length} appointments
			</p>
		</div>
	</div>

	<!-- Search -->
	<div class="relative">
		<Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
		<Input
			bind:value={search}
			placeholder="Search by name, phone, booker…"
			class="pl-9 h-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 placeholder:text-gray-400 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-600"
		/>
	</div>

	<!-- Status filter tabs -->
	<div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
		{#each STATUS_FILTERS as filter}
			<button
				onclick={() => (activeStatus = filter.value)}
				class="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all
					{activeStatus === filter.value
					? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
					: 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'}"
			>
				{filter.label}
				<span
					class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold
					{activeStatus === filter.value
						? 'bg-white/20 text-white dark:bg-black/20 dark:text-gray-900'
						: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}"
				>
					{counts()[filter.value]}
				</span>
			</button>
		{/each}
	</div>

	<!-- ─── Mobile: Card List ─── -->
	<div class="flex flex-col gap-3 md:hidden">
		{#if filtered().length === 0}
			<div
				class="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center dark:border-gray-700"
			>
				<Calendar class="mb-3 size-8 text-gray-300 dark:text-gray-600" />
				<p class="text-sm font-medium text-gray-500 dark:text-gray-400">No appointments found</p>
				<p class="mt-1 text-xs text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
			</div>
		{/if}

		{#each filtered() as appt (appt.extraSettings)}
			{@const cfg = STATUS_CONFIG[appt.status]}
			{@const isOpen = expandedId === appt.extraSettings}
			<div
				class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
			>
				<!-- Card Header -->
				<button
					onclick={() => toggleExpand(appt.extraSettings)}
					class="flex w-full items-start justify-between gap-3 p-4 text-left"
				>
					<div class="flex min-w-0 flex-col gap-1">
						<span class="truncate text-sm font-semibold text-gray-900 dark:text-gray-50">
							{appt.customerName}
						</span>
						<div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
							<Calendar class="size-3 shrink-0" />
							<span>{formatDate(appt.date)}</span>
							<span class="text-gray-300 dark:text-gray-600">·</span>
							<Clock class="size-3 shrink-0" />
							<span>{formatTime(appt.time)}</span>
						</div>
					</div>

					<div class="flex shrink-0 flex-col items-end gap-2">
						<!-- <span
							class="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium {cfg.class}"
						>
							<span class="size-1.5 rounded-full {cfg.dot}"></span>
							{cfg.label}
						</span> -->

							<Statuses status={appt.status} />
						<span class="text-xs font-semibold text-gray-700 dark:text-gray-200">
							{formatCurrency(appt.paidAmount)}
						</span>
					</div>
				</button>

				<!-- Expandable Details -->
				{#if isOpen}
					<div class="border-t border-gray-100 dark:border-gray-800">
						<div class="grid grid-cols-2 gap-px bg-gray-100 dark:bg-gray-800">
							{#if appt.phone}
								<div class="bg-white p-3 dark:bg-gray-900">
									<p class="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">
										Phone
									</p>
									<a
										href="tel:{appt.phone}"
										class="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400"
									>
										<Phone class="size-3" />
										{appt.phone}
									</a>
								</div>
							{/if}

							<div class="bg-white p-3 dark:bg-gray-900">
								<p class="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">
									Booked By
								</p>
								<p class="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-200">
									<User class="size-3 text-gray-400" />
									{appt.booker}
								</p>
							</div>

							<div class="bg-white p-3 dark:bg-gray-900">
								<p class="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">
									Booked On
								</p>
								<p class="text-xs font-medium text-gray-700 dark:text-gray-200">
									{formatDate(appt.bookedAt)}
								</p>
							</div>

							<div class="bg-white p-3 dark:bg-gray-900">
								<p class="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">
									Paid
								</p>
								<p class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
									{formatCurrency(appt.paidAmount)}
								</p>
							</div>

							<div class="bg-white flex flex-col justify-center items-center gap-4  col-span-2 p-3 dark:bg-gray-900">
								<p class="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">
								View Appointment Details
								</p>
								<Button size="sm" variant="ghost" href="/dashboard/appointments/single/{appt.extraSettings}" class="w-full"><Eye /> View</Button>
							</div>
						</div>

						{#if appt.notes}
							<div class="bg-white p-3 dark:bg-gray-900">
								<p class="mb-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">
									Notes
								</p>
								<p class="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
									{appt.notes}
								</p>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- ─── Desktop: Table ─── -->
	<div class="hidden overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 md:block">
		<table class="w-full text-sm">
			<thead class="bg-gray-50 dark:bg-gray-800/60">
				<tr>
					{#each (
						[
							{ key: 'customerName', label: 'Customer' },
							{ key: 'date', label: 'Date' },
							{ key: 'time', label: 'Time' },
							{ key: 'status', label: 'Status' },
							{ key: null, label: 'Booker' },
							{ key: 'paidAmount', label: 'Paid' },
							{ key: null, label: 'Notes' }
						] as const
					) as col}
						<th
							class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400
								{col.key ? 'cursor-pointer select-none hover:text-gray-800 dark:hover:text-gray-200' : ''}"
							onclick={() => col.key && toggleSort(col.key as SortKey)}
						>
							<span class="flex items-center gap-1">
								{col.label}
								{#if col.key && sortKey === col.key}
									{#if sortAsc}
										<ChevronUp class="size-3" />
									{:else}
										<ChevronDown class="size-3" />
									{/if}
								{/if}
							</span>
						</th>
					{/each}
				</tr>
			</thead>

			<tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
				{#if filtered().length === 0}
					<tr>
						<td colspan="7" class="py-16 text-center">
							<div class="flex flex-col items-center gap-2">
								<Calendar class="size-8 text-gray-300 dark:text-gray-600" />
								<p class="text-sm font-medium text-gray-500 dark:text-gray-400">No appointments found</p>
								<p class="text-xs text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
							</div>
						</td>
					</tr>
				{/if}

				{#each filtered() as appt (appt.extraSettings)}
					{@const cfg = STATUS_CONFIG[appt.status]}
					<tr class="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40">
						<!-- Customer -->
						<td class="px-4 py-3">
							<div class="font-medium text-gray-900 dark:text-gray-50">{appt.customerName}</div>
							{#if appt.phone}
								<a
									href="tel:{appt.phone}"
									class="mt-0.5 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400"
								>
									<Phone class="size-3" />
									{appt.phone}
								</a>
							{/if}
						</td>

						<!-- Date -->
						<td class="px-4 py-3 text-gray-600 dark:text-gray-300">
							{formatDate(appt.date)}
						</td>

						<!-- Time -->
						<td class="px-4 py-3 text-gray-600 dark:text-gray-300">
							{formatTime(appt.time)}
						</td>

						<!-- Status -->
						<td class="px-4 py-3">
							<!-- <span
								class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium {cfg.class}"
							>
								<span class="size-1.5 rounded-full {cfg.dot}"></span>
								{cfg.label}
							</span> -->
							<Statuses status={appt.status} />
						</td>

						<!-- Booker -->
						<td class="px-4 py-3">
							<div class="flex items-center gap-2">
								<div
									class="flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300"
								>
									{appt.booker?.charAt(0).toUpperCase()}
								</div>
								<span class="text-gray-700 dark:text-gray-300">{appt.booker}</span>
							</div>
						</td>

						<!-- Paid -->
						<td class="px-4 py-3">
							<span
								class="font-semibold {appt.paidAmount > 0
									? 'text-emerald-600 dark:text-emerald-400'
									: 'text-gray-400 dark:text-gray-500'}"
							>
								{formatCurrency(appt.paidAmount)}
							</span>
						</td>

						<!-- Notes -->
						<td class="max-w-50 px-4 py-3">
							{#if appt.notes}
								<p class="truncate text-xs text-gray-500 dark:text-gray-400" title={appt.notes}>
									{appt.notes}
								</p>
							{:else}
								<span class="text-xs text-gray-300 dark:text-gray-600">—</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<!-- Table footer summary -->
		{#if filtered().length > 0}
			<div
				class="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-800/40"
			>
				<span class="text-xs text-gray-500 dark:text-gray-400">
					{filtered().length} result{filtered().length !== 1 ? 's' : ''}
				</span>
				<span class="text-xs font-semibold text-gray-700 dark:text-gray-200">
					Total paid:
					<span class="text-emerald-600 dark:text-emerald-400">
						{formatCurrency(filtered().reduce((acc, a) => acc + Number(a.paidAmount), 0))}
					</span>
				</span>
			</div>
		{/if}
	</div>
</div>
