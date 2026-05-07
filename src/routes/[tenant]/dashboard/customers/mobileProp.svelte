<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import {
		Search,
		ChevronDown,
		ChevronUp,
		ArrowRight,
		Phone,
		Calendar,
		User,
		Users,
		Clock
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';

	type Customer = {
		id: number;
		customerName: string;
		phone: string | null;
		appointmentCount: number | null;
		salesCount: number | null;
		daysSinceJoined: number | null;
		createdBy: string | null;
		createdById: number | null;
		createdAt: string;
	};

	type SortKey = 'customerName' | 'appointmentCount' | 'salesCount' | 'daysSinceJoined' | 'createdAt';

	let { customers = [] }: { customers: Customer[] } = $props();

	let search = $state('');
	let sortKey = $state<SortKey>('createdAt');
	let sortAsc = $state(false);

	const AVATAR_COLORS = [
		'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
		'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
		'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
		'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
		'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
		'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
		'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
		'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
	];

	function avatarColor(name: string) {
		let hash = 0;
		for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
		return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
	}

	function getInitials(name: string) {
		return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
	}

	function formatCurrency(v: number | null) {
		if (v == null || v === 0) return '—';
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0
		}).format(v);
	}

	function formatDate(iso: string) {
		return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function formatTenure(days: number | null) {
		if (days == null) return '—';
		if (days < 7) return `${days}d`;
		if (days < 30) return `${Math.floor(days / 7)}w`;
		if (days < 365) return `${Math.floor(days / 30)}mo`;
		const yrs = Math.floor(days / 365);
		const mos = Math.floor((days % 365) / 30);
		return mos > 0 ? `${yrs}y ${mos}mo` : `${yrs}y`;
	}

	function segment(salesCount: number | null): { label: string; class: string } {
		const v = salesCount ?? 0;
		if (v === 0) return { label: 'New', class: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' };
		if (v < 200) return { label: 'Regular', class: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800' };
		if (v < 500) return { label: 'Loyal', class: 'bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800' };
		return { label: 'VIP', class: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' };
	}

	function toggleSort(key: SortKey) {
		if (sortKey === key) sortAsc = !sortAsc;
		else { sortKey = key; sortAsc = true; }
	}

	const filtered = $derived(() => {
		const q = search.toLowerCase().trim();
		return customers
			.filter((c) =>
				!q ||
				c.customerName.toLowerCase().includes(q) ||
				(c.phone ?? '').includes(q) ||
				(c.createdBy ?? '').toLowerCase().includes(q)
			)
			.sort((a, b) => {
				let av: string | number = a[sortKey] ?? 0;
				let bv: string | number = b[sortKey] ?? 0;
				if (typeof av === 'string') av = av.toLowerCase();
				if (typeof bv === 'string') bv = bv.toLowerCase();
				if (av < bv) return sortAsc ? -1 : 1;
				if (av > bv) return sortAsc ? 1 : -1;
				return 0;
			});
	});

	const totals = $derived(() => ({
		revenue: filtered().reduce((s, c) => s + (c.salesCount ?? 0), 0),
		appointments: filtered().reduce((s, c) => s + (c.appointmentCount ?? 0), 0)
	}));

	const COLS = [
		{ key: 'customerName',     label: 'Customer' },
		{ key: null,               label: 'Segment' },
		{ key: null,               label: 'Phone' },
		{ key: 'appointmentCount', label: 'Appts' },
		{ key: 'salesCount',       label: 'Spend' },
		{ key: 'daysSinceJoined',  label: 'Tenure' },
		{ key: 'createdAt',        label: 'Joined' },
		{ key: null,               label: 'Added By' },
		{ key: null,               label: '' }
	] as const;
</script>

<div class="w-full space-y-4 font-sans">
	<!-- Header -->
	<div class="flex flex-col gap-1">
		<h2 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">Customers</h2>
		<p class="text-sm text-gray-500 dark:text-gray-400">
			{filtered().length} of {customers.length} customers
		</p>
	</div>

	<!-- Summary cards -->
	<!-- <div class="grid grid-cols-3 gap-3">
		<div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
			<p class="text-[11px] font-medium uppercase tracking-wider text-gray-400">Total</p>
			<p class="mt-1 text-lg font-bold text-gray-900 dark:text-gray-50">{filtered().length}</p>
		</div>
		<div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
			<p class="text-[11px] font-medium uppercase tracking-wider text-gray-400">Revenue</p>
			<p class="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totals().revenue)}</p>
		</div>
		<div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
			<p class="text-[11px] font-medium uppercase tracking-wider text-gray-400">Appts</p>
			<p class="mt-1 text-lg font-bold text-gray-900 dark:text-gray-50">{totals().appointments}</p>
		</div>
	</div> -->

	<div class="flex gap-2">
  <button
    onclick={() => toggleSort('salesCount')}
    class="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all
      {sortKey === 'salesCount'
        ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'}"
  >
    Spend
    {#if sortKey === 'salesCount'}
      {#if sortAsc}<ChevronUp class="size-3" />{:else}<ChevronDown class="size-3" />{/if}
    {/if}
  </button>

  <button
    onclick={() => toggleSort('appointmentCount')}
    class="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all
      {sortKey === 'appointmentCount'
        ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'}"
  >
    Appts
    {#if sortKey === 'appointmentCount'}
      {#if sortAsc}<ChevronUp class="size-3" />{:else}<ChevronDown class="size-3" />{/if}
    {/if}
  </button>
</div>

	<!-- Search -->
	<div class="relative">
		<Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
		<Input
			bind:value={search}
			placeholder="Search by name, phone, added by…"
			class="h-10 bg-white pl-9 placeholder:text-gray-400 focus-visible:ring-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:focus-visible:ring-gray-600"
		/>
	</div>

	<!-- ─── Mobile: Cards ─── -->
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
		{#if filtered().length === 0}
			<div class="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center dark:border-gray-700">
				<Users class="mb-3 size-8 text-gray-300 dark:text-gray-600" />
				<p class="text-sm font-medium text-gray-500 dark:text-gray-400">No customers found</p>
				<p class="mt-1 text-xs text-gray-400 dark:text-gray-500">Try adjusting your search</p>
			</div>
		{/if}

		{#each filtered() as customer (customer.id)}
			{@const seg = segment(customer.salesCount)}
			<div class="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
				<div class="flex flex-1 flex-col gap-3 p-4">
					<!-- Avatar + name + segment -->
					<div class="flex items-center gap-3">
						<div class="flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold {avatarColor(customer.customerName)}">
							{getInitials(customer.customerName)}
						</div>
						<div class="min-w-0 flex-1">
							<p class="truncate font-semibold text-gray-900 dark:text-gray-50">{customer.customerName}</p>
							<span class="mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold {seg.class}">
								{seg.label}
							</span>
						</div>
					</div>

					<!-- Phone -->
					{#if customer.phone}
						<a href="tel:{customer.phone}" class="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
							<Phone class="size-3 shrink-0 text-gray-400" />
							{customer.phone}
						</a>
					{/if}

					<!-- Stats -->
					<div class="grid grid-cols-3 gap-2">
						<div class="flex flex-col gap-0.5">
							<span class="text-[10px] font-medium uppercase tracking-wider text-gray-400">Spend</span>
							<span class="text-sm font-bold text-emerald-600 dark:text-emerald-400">
								{formatCurrency(customer.salesCount)}
							</span>
						</div>
						<div class="flex flex-col gap-0.5">
							<span class="text-[10px] font-medium uppercase tracking-wider text-gray-400">Appts</span>
							<span class="text-sm font-semibold text-gray-800 dark:text-gray-100">
								{customer.appointmentCount ?? 0}
							</span>
						</div>
						<div class="flex flex-col gap-0.5">
							<span class="text-[10px] font-medium uppercase tracking-wider text-gray-400">Tenure</span>
							<span class="text-sm font-semibold text-gray-800 dark:text-gray-100">
								{formatTenure(customer.daysSinceJoined)}
							</span>
						</div>
					</div>
				</div>

				<!-- Card footer -->
				<div class="border-t border-gray-100 px-4 py-2.5 dark:border-gray-800">
					<div class="flex items-center justify-between">
						<div class="flex min-w-0 items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
							<Calendar class="size-3 shrink-0" />
							<span class="shrink-0">{formatDate(customer.createdAt)}</span>
							{#if customer.createdBy}
								<span class="text-gray-300 dark:text-gray-600">·</span>
								<User class="size-3 shrink-0" />
								<span class="truncate">{customer.createdBy}</span>
							{/if}
						</div>
						<Button
							size="sm"
							variant="ghost"
							onclick={() => goto(`/dashboard/customers/${customer.id}`)}
							class="ml-2 h-7 shrink-0 gap-1 px-2 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
						>
							View
							<ArrowRight class="size-3" />
						</Button>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- ─── Desktop: Table ─── -->
	<div class="hidden overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 md:block">
		<table class="w-full text-sm">
			<thead class="bg-gray-50 dark:bg-gray-800/60">
				<tr>
					{#each COLS as col}
						<th
							class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400
								{col.key ? 'cursor-pointer select-none hover:text-gray-800 dark:hover:text-gray-200' : ''}"
							onclick={() => col.key && toggleSort(col.key as SortKey)}
						>
							<span class="flex items-center gap-1">
								{col.label}
								{#if col.key && sortKey === col.key}
									{#if sortAsc}<ChevronUp class="size-3" />{:else}<ChevronDown class="size-3" />{/if}
								{/if}
							</span>
						</th>
					{/each}
				</tr>
			</thead>

			<tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
				{#if filtered().length === 0}
					<tr>
						<td colspan={COLS.length} class="py-16 text-center">
							<div class="flex flex-col items-center gap-2">
								<Users class="size-8 text-gray-300 dark:text-gray-600" />
								<p class="text-sm font-medium text-gray-500 dark:text-gray-400">No customers found</p>
							</div>
						</td>
					</tr>
				{/if}

				{#each filtered() as customer (customer.id)}
					{@const seg = segment(customer.salesCount)}
					<tr class="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40">

						<!-- Customer -->
						<td class="px-4 py-3">
							<div class="flex items-center gap-3">
								<div class="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold {avatarColor(customer.customerName)}">
									{getInitials(customer.customerName)}
								</div>
								<span class="font-medium text-gray-900 dark:text-gray-50">{customer.customerName}</span>
							</div>
						</td>

						<!-- Segment -->
						<td class="px-4 py-3">
							<span class="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium {seg.class}">
								{seg.label}
							</span>
						</td>

						<!-- Phone -->
						<td class="px-4 py-3">
							{#if customer.phone}
								<a href="tel:{customer.phone}" class="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
									<Phone class="size-3 text-gray-400" />
									{customer.phone}
								</a>
							{:else}
								<span class="text-xs text-gray-300 dark:text-gray-600">—</span>
							{/if}
						</td>

						<!-- Appointments -->
						<td class="px-4 py-3 text-gray-700 dark:text-gray-300">
							{customer.appointmentCount ?? 0}
						</td>

						<!-- Spend -->
						<td class="px-4 py-3">
							<span class="font-semibold {(customer.salesCount ?? 0) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}">
								{formatCurrency(customer.salesCount)}
							</span>
						</td>

						<!-- Tenure -->
						<td class="px-4 py-3">
							<span class="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
								<Clock class="size-3.5 text-gray-400" />
								{formatTenure(customer.daysSinceJoined)}
							</span>
						</td>

						<!-- Joined -->
						<td class="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">
							{formatDate(customer.createdAt)}
						</td>

						<!-- Added by -->
						<td class="px-4 py-3">
							{#if customer.createdBy}
								<div class="flex items-center gap-2">
									<div class="flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
										{customer.createdBy.charAt(0).toUpperCase()}
									</div>
									<span class="text-xs text-gray-600 dark:text-gray-300">{customer.createdBy}</span>
								</div>
							{:else}
								<span class="text-xs text-gray-300 dark:text-gray-600">—</span>
							{/if}
						</td>

						<!-- Action -->
						<td class="px-4 py-3 text-right">
							<Button
								size="sm"
								variant="ghost"
								onclick={() => goto(`/dashboard/customers/${customer.id}`)}
								class="h-8 gap-1.5 px-3 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100"
							>
								View
								<ArrowRight class="size-3" />
							</Button>
						</td>
					</tr>
				{/each}
			</tbody>

			<!-- Footer totals -->
			{#if filtered().length > 0}
				<tfoot class="border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/40">
					<tr>
						<td class="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400" colspan="2">
							{filtered().length} customer{filtered().length !== 1 ? 's' : ''}
						</td>
						<td class="px-4 py-2.5"></td>
						<td class="px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-200">
							{totals().appointments} appts
						</td>
						<td class="px-4 py-2.5 font-bold text-emerald-600 dark:text-emerald-400">
							{formatCurrency(totals().revenue)}
						</td>
						<td class="px-4 py-2.5"></td>
						<td class="px-4 py-2.5"></td>
						<td class="px-4 py-2.5"></td>
						<td class="px-4 py-2.5"></td>
					</tr>
				</tfoot>
			{/if}
		</table>
	</div>
</div>
