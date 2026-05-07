<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import {
		Search,
		ChevronDown,
		ChevronUp,
		ArrowRight,
		Tag,
		Clock,
		DollarSign,
		TrendingUp,
		Layers
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';

	type Service = {
		id: number;
		name: string;
		price: number;
		description: string | null;
		category: string | null;
		commission: number | null;
		duration: number | null;
		saleCount: number | null;
	};

	type SortKey = 'name' | 'price' | 'commission' | 'duration' | 'saleCount';

	let { services = $bindable() }: { services: Service[] } = $props();

	let search = $state('');
	let activeCategory = $state<string>('all');
	let sortKey = $state<SortKey>('name');
	let sortAsc = $state(true);

	function formatCurrency(amount: number | null) {
		if (amount == null) return '—';
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(amount);
	}

	function formatDuration(minutes: number | null) {
		if (!minutes) return '—';
		if (minutes < 60) return `${minutes}m`;
		const h = Math.floor(minutes / 60);
		const m = minutes % 60;
		return m ? `${h}h ${m}m` : `${h}h`;
	}

	function toggleSort(key: SortKey) {
		if (sortKey === key) sortAsc = !sortAsc;
		else {
			sortKey = key;
			sortAsc = true;
		}
	}

	const categories = $derived(() => {
		const cats = new Set(services.map((s) => s.category ?? 'Uncategorised'));
		return ['all', ...Array.from(cats).sort()];
	});

	const categoryCounts = $derived(() => {
		const map: Record<string, number> = { all: services.length };
		for (const s of services) {
			const cat = s.category ?? 'Uncategorised';
			map[cat] = (map[cat] ?? 0) + 1;
		}
		return map;
	});

	const filtered = $derived(() => {
		const q = search.toLowerCase().trim();
		return services
			.filter((s) => {
				const matchesSearch =
					!q ||
					s.name.toLowerCase().includes(q) ||
					(s.description ?? '').toLowerCase().includes(q) ||
					(s.category ?? '').toLowerCase().includes(q);
				const matchesCategory =
					activeCategory === 'all' || (s.category ?? 'Uncategorised') === activeCategory;
				return matchesSearch && matchesCategory;
			})
			.sort((a, b) => {
				let av = a[sortKey] ?? (typeof a[sortKey] === 'number' ? 0 : '');
				let bv = b[sortKey] ?? (typeof b[sortKey] === 'number' ? 0 : '');
				if (typeof av === 'string') av = av.toLowerCase();
				if (typeof bv === 'string') bv = bv.toLowerCase();
				if (av < bv) return sortAsc ? -1 : 1;
				if (av > bv) return sortAsc ? 1 : -1;
				return 0;
			});
	});
</script>

<div class="w-full space-y-4 font-sans">
	<!-- Header -->
	<div class="flex flex-col gap-1">
		<h2 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">Services</h2>
		<p class="text-sm text-gray-500 dark:text-gray-400">
			{filtered().length} of {services.length} services
		</p>
	</div>

	<!-- Search -->
	<div class="relative">
		<Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
		<Input
			bind:value={search}
			placeholder="Search by name, description, category…"
			class="h-10 bg-white pl-9 placeholder:text-gray-400 focus-visible:ring-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:focus-visible:ring-gray-600"
		/>
	</div>

	<!-- Category filter tabs -->
	<div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
		{#each categories() as cat}
			<button
				onclick={() => (activeCategory = cat)}
				class="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all
					{activeCategory === cat
					? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
					: 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'}"
			>
				{cat === 'all' ? 'All' : cat}
				<span
					class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold
					{activeCategory === cat
						? 'bg-white/20 text-white dark:bg-black/20 dark:text-gray-900'
						: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}"
				>
					{categoryCounts()[cat] ?? 0}
				</span>
			</button>
		{/each}
	</div>

	<!-- ─── Mobile: Card Grid ─── -->
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
		{#if filtered().length === 0}
			<div
				class="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center dark:border-gray-700"
			>
				<Layers class="mb-3 size-8 text-gray-300 dark:text-gray-600" />
				<p class="text-sm font-medium text-gray-500 dark:text-gray-400">No services found</p>
				<p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
					Try adjusting your search or filter
				</p>
			</div>
		{/if}

		{#each filtered() as service (service.id)}
			<div
				class="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
			>
				<!-- Card body -->
				<div class="flex flex-1 flex-col gap-2 p-4">
					<!-- Category pill -->
					{#if service.category}
						<span
							class="inline-flex w-fit items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-400"
						>
							<Tag class="size-2.5" />
							{service.category}
						</span>
					{/if}

					<div>
						<h3 class="font-semibold text-gray-900 dark:text-gray-50">{service.name}</h3>
						{#if service.description}
							<p class="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
								{service.description}
							</p>
						{/if}
					</div>

					<!-- Stats row -->
					<div class="mt-auto grid grid-cols-3 gap-2 pt-2">
						<div class="flex flex-col gap-0.5">
							<span class="text-[10px] font-medium uppercase tracking-wider text-gray-400">Price</span>
							<span class="text-sm font-bold text-gray-900 dark:text-gray-50">
								{formatCurrency(service.price)}
							</span>
						</div>
						<div class="flex flex-col gap-0.5">
							<span class="text-[10px] font-medium uppercase tracking-wider text-gray-400"
								>Duration</span
							>
							<span class="text-sm font-semibold text-gray-700 dark:text-gray-200">
								{formatDuration(service.duration)}
							</span>
						</div>
						<div class="flex flex-col gap-0.5">
							<span class="text-[10px] font-medium uppercase tracking-wider text-gray-400">Sales</span>
							<span class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
								{formatCurrency(service.saleCount)}
							</span>
						</div>
					</div>
				</div>

				<!-- Card footer -->
				<div class="border-t border-gray-100 px-4 py-2.5 dark:border-gray-800">
					<div class="flex items-center justify-between">
						{#if service.commission != null}
							<span class="text-xs text-gray-400 dark:text-gray-500">
								Commission:
								<span class="font-medium text-gray-600 dark:text-gray-300">
									{formatCurrency(service.commission)}
								</span>
							</span>
						{:else}
							<span></span>
						{/if}
						<Button
							size="sm"
							variant="ghost"
							onclick={() => goto(`/dashboard/services/${service.id}`)}
							class="h-7 gap-1 px-2 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
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
	<div
		class="hidden overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 md:block"
	>
		<table class="w-full text-sm">
			<thead class="bg-gray-50 dark:bg-gray-800/60">
				<tr>
					{#each (
						[
							{ key: 'name', label: 'Service' },
							{ key: null, label: 'Category' },
							{ key: 'price', label: 'Price' },
							{ key: 'commission', label: 'Commission' },
							{ key: 'duration', label: 'Duration' },
							{ key: 'saleCount', label: 'Total Sales' },
							{ key: null, label: '' }
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
								<Layers class="size-8 text-gray-300 dark:text-gray-600" />
								<p class="text-sm font-medium text-gray-500 dark:text-gray-400">No services found</p>
								<p class="text-xs text-gray-400 dark:text-gray-500">
									Try adjusting your search or filter
								</p>
							</div>
						</td>
					</tr>
				{/if}

				{#each filtered() as service (service.id)}
					<tr class="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40">
						<!-- Service name + description -->
						<td class="max-w-[220px] px-4 py-3">
							<div class="font-medium text-gray-900 dark:text-gray-50">{service.name}</div>
							{#if service.description}
								<p class="mt-0.5 truncate text-xs text-gray-400 dark:text-gray-500" title={service.description}>
									{service.description}
								</p>
							{/if}
						</td>

						<!-- Category -->
						<td class="px-4 py-3">
							{#if service.category}
								<span
									class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
								>
									<Tag class="size-2.5" />
									{service.category}
								</span>
							{:else}
								<span class="text-xs text-gray-300 dark:text-gray-600">—</span>
							{/if}
						</td>

						<!-- Price -->
						<td class="px-4 py-3 font-semibold text-gray-900 dark:text-gray-50">
							{formatCurrency(service.price)}
						</td>

						<!-- Commission -->
						<td class="px-4 py-3 text-gray-600 dark:text-gray-300">
							{formatCurrency(service.commission)}
						</td>

						<!-- Duration -->
						<td class="px-4 py-3">
							<span class="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
								<Clock class="size-3.5 text-gray-400" />
								{formatDuration(service.duration)}
							</span>
						</td>

						<!-- Total Sales -->
						<td class="px-4 py-3">
							<span
								class="font-semibold {(service.saleCount ?? 0) > 0
									? 'text-emerald-600 dark:text-emerald-400'
									: 'text-gray-400 dark:text-gray-500'}"
							>
								{formatCurrency(service.saleCount)}
							</span>
						</td>

						<!-- Action -->
						<td class="px-4 py-3 text-right">
							<Button
								size="sm"
								variant="ghost"
								onclick={() => goto(`/dashboard/services/${service.id}`)}
								class="h-8 gap-1.5 px-3 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100"
							>
								View
								<ArrowRight class="size-3" />
							</Button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<!-- Table footer -->
		{#if filtered().length > 0}
			<div
				class="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-800/40"
			>
				<span class="text-xs text-gray-500 dark:text-gray-400">
					{filtered().length} result{filtered().length !== 1 ? 's' : ''}
				</span>
				<span class="text-xs font-semibold text-gray-700 dark:text-gray-200">
					Total revenue:
					<span class="text-emerald-600 dark:text-emerald-400">
						{formatCurrency(filtered().reduce((acc, s) => acc + (s.saleCount ?? 0), 0))}
					</span>
				</span>
			</div>
		{/if}
	</div>
</div>
