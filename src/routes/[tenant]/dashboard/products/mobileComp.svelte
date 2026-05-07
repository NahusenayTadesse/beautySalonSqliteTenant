<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import {
		Search,
		ChevronDown,
		ChevronUp,
		ArrowRight,
		Tag,
		Package,
		Truck,
		AlertTriangle
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';

	type Product = {
		id: number;
		name: string;
		price: number;
		description: string | null;
		category: string | null;
		commission: number | null;
		quantity: number | null;
		supplier: string | null;
		saleCount: number | null;
	};

	type SortKey = 'name' | 'price' | 'commission' | 'quantity' | 'saleCount';

	let { products = $bindable([]) }: { products: Product[] } = $props();

	let search = $state('');
	let activeCategory = $state('all');
	let activeSupplier = $state('all');
	let sortKey = $state<SortKey>('name');
	let sortAsc = $state(true);

	const LOW_STOCK_THRESHOLD = 5;

	function formatCurrency(v: number | null) {
		if (v == null) return '—';
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
	}

	function stockStatus(qty: number | null) {
		if (qty == null) return { label: 'Unknown', class: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400', dot: 'bg-gray-400' };
		if (qty === 0) return { label: 'Out of stock', class: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800', dot: 'bg-rose-500' };
		if (qty <= LOW_STOCK_THRESHOLD) return { label: 'Low stock', class: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800', dot: 'bg-amber-500' };
		return { label: 'In stock', class: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800', dot: 'bg-emerald-500' };
	}

	function toggleSort(key: SortKey) {
		if (sortKey === key) sortAsc = !sortAsc;
		else { sortKey = key; sortAsc = true; }
	}

	const categories = $derived(() => {
		const set = new Set(products.map((p) => p.category ?? 'Uncategorised'));
		return ['all', ...Array.from(set).sort()];
	});

	const suppliers = $derived(() => {
		const set = new Set(products.map((p) => p.supplier ?? 'Unknown'));
		return ['all', ...Array.from(set).sort()];
	});

	const categoryCounts = $derived(() => {
		const map: Record<string, number> = { all: products.length };
		for (const p of products) {
			const c = p.category ?? 'Uncategorised';
			map[c] = (map[c] ?? 0) + 1;
		}
		return map;
	});

	const filtered = $derived(() => {
		const q = search.toLowerCase().trim();
		return products
			.filter((p) => {
				const matchesSearch =
					!q ||
					p.name.toLowerCase().includes(q) ||
					(p.description ?? '').toLowerCase().includes(q) ||
					(p.category ?? '').toLowerCase().includes(q) ||
					(p.supplier ?? '').toLowerCase().includes(q);
				const matchesCategory =
					activeCategory === 'all' || (p.category ?? 'Uncategorised') === activeCategory;
				const matchesSupplier =
					activeSupplier === 'all' || (p.supplier ?? 'Unknown') === activeSupplier;
				return matchesSearch && matchesCategory && matchesSupplier;
			})
			.sort((a, b) => {
				let av: string | number = a[sortKey] ?? (typeof a[sortKey] === 'number' ? 0 : '');
				let bv: string | number = b[sortKey] ?? (typeof b[sortKey] === 'number' ? 0 : '');
				if (typeof av === 'string') av = av.toLowerCase();
				if (typeof bv === 'string') bv = bv.toLowerCase();
				if (av < bv) return sortAsc ? -1 : 1;
				if (av > bv) return sortAsc ? 1 : -1;
				return 0;
			});
	});

	const lowStockCount = $derived(() =>
		products.filter((p) => p.quantity != null && p.quantity <= LOW_STOCK_THRESHOLD).length
	);
</script>

<div class="w-full space-y-4 font-sans">
	<!-- Header -->
	<div class="flex items-start justify-between">
		<div class="flex flex-col gap-1">
			<h2 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">Products</h2>
			<p class="text-sm text-gray-500 dark:text-gray-400">
				{filtered().length} of {products.length} products
			</p>
		</div>
		{#if lowStockCount() > 0}
			<span class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
				<AlertTriangle class="size-3" />
				{lowStockCount()} low stock
			</span>
		{/if}
	</div>

	<!-- Search -->
	<div class="relative">
		<Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
		<Input
			bind:value={search}
			placeholder="Search by name, category, supplier…"
			class="h-10 bg-white pl-9 placeholder:text-gray-400 focus-visible:ring-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:focus-visible:ring-gray-600"
		/>
	</div>

	<!-- Category filter -->
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
				<span class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold
					{activeCategory === cat
						? 'bg-white/20 text-white dark:bg-black/20 dark:text-gray-900'
						: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}">
					{categoryCounts()[cat] ?? 0}
				</span>
			</button>
		{/each}
	</div>

	<!-- Supplier filter -->
	{#if suppliers().length > 2}
		<div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
			<span class="shrink-0 text-[11px] font-medium uppercase tracking-wider text-gray-400">
				<Truck class="inline size-3 mr-1" />Supplier
			</span>
			{#each suppliers() as sup}
				<button
					onclick={() => (activeSupplier = sup)}
					class="shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium transition-all
						{activeSupplier === sup
						? 'border-gray-700 bg-gray-700 text-white dark:border-gray-300 dark:bg-gray-300 dark:text-gray-900'
						: 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'}"
				>
					{sup === 'all' ? 'All suppliers' : sup}
				</button>
			{/each}
		</div>
	{/if}

	<!-- ─── Mobile: Card Grid ─── -->
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
		{#if filtered().length === 0}
			<div class="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center dark:border-gray-700">
				<Package class="mb-3 size-8 text-gray-300 dark:text-gray-600" />
				<p class="text-sm font-medium text-gray-500 dark:text-gray-400">No products found</p>
				<p class="mt-1 text-xs text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
			</div>
		{/if}

		{#each filtered() as product (product.id)}
			{@const stock = stockStatus(product.quantity)}
			<div class="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
				<div class="flex flex-1 flex-col gap-2.5 p-4">
					<!-- Category pill -->
					{#if product.category}
						<span class="inline-flex w-fit items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-400">
							<Tag class="size-2.5" />
							{product.category}
						</span>
					{/if}

					<!-- Name + description -->
					<div>
						<h3 class="font-semibold text-gray-900 dark:text-gray-50">{product.name}</h3>
						{#if product.description}
							<p class="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
								{product.description}
							</p>
						{/if}
					</div>

					<!-- Supplier -->
					{#if product.supplier}
						<div class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
							<Truck class="size-3 shrink-0" />
							{product.supplier}
						</div>
					{/if}

					<!-- Stats -->
					<div class="mt-auto grid grid-cols-3 gap-2 pt-1">
						<div class="flex flex-col gap-0.5">
							<span class="text-[10px] font-medium uppercase tracking-wider text-gray-400">Price</span>
							<span class="text-sm font-bold text-gray-900 dark:text-gray-50">
								{formatCurrency(product.price)}
							</span>
						</div>
						<div class="flex flex-col gap-0.5">
							<span class="text-[10px] font-medium uppercase tracking-wider text-gray-400">Qty</span>
							<span class="text-sm font-semibold
								{(product.quantity ?? 0) === 0
									? 'text-rose-600 dark:text-rose-400'
									: (product.quantity ?? 0) <= LOW_STOCK_THRESHOLD
										? 'text-amber-600 dark:text-amber-400'
										: 'text-gray-800 dark:text-gray-100'}">
								{product.quantity ?? '—'}
							</span>
						</div>
						<div class="flex flex-col gap-0.5">
							<span class="text-[10px] font-medium uppercase tracking-wider text-gray-400">Sold</span>
							<span class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
								{product.saleCount ?? 0}
							</span>
						</div>
					</div>
				</div>

				<!-- Footer -->
				<div class="border-t border-gray-100 px-4 py-2.5 dark:border-gray-800">
					<div class="flex items-center justify-between">
						<span class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium {stock.class}">
							<span class="size-1.5 rounded-full {stock.dot}"></span>
							{stock.label}
						</span>
						<Button
							size="sm"
							variant="ghost"
							onclick={() => goto(`/dashboard/products/${product.id}`)}
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
	<div class="hidden overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 md:block">
		<table class="w-full text-sm">
			<thead class="bg-gray-50 dark:bg-gray-800/60">
				<tr>
					{#each (
						[
							{ key: 'name',       label: 'Product' },
							{ key: null,         label: 'Category' },
							{ key: null,         label: 'Supplier' },
							{ key: 'price',      label: 'Price' },
							{ key: 'commission', label: 'Commission' },
							{ key: 'quantity',   label: 'Stock' },
							{ key: 'saleCount',  label: 'Units Sold' },
							{ key: null,         label: '' }
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
						<td colspan="8" class="py-16 text-center">
							<div class="flex flex-col items-center gap-2">
								<Package class="size-8 text-gray-300 dark:text-gray-600" />
								<p class="text-sm font-medium text-gray-500 dark:text-gray-400">No products found</p>
								<p class="text-xs text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
							</div>
						</td>
					</tr>
				{/if}

				{#each filtered() as product (product.id)}
					{@const stock = stockStatus(product.quantity)}
					<tr class="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40">

						<!-- Product name + description -->
						<td class="max-w-[200px] px-4 py-3">
							<div class="font-medium text-gray-900 dark:text-gray-50">{product.name}</div>
							{#if product.description}
								<p class="mt-0.5 truncate text-xs text-gray-400 dark:text-gray-500" title={product.description}>
									{product.description}
								</p>
							{/if}
						</td>

						<!-- Category -->
						<td class="px-4 py-3">
							{#if product.category}
								<span class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
									<Tag class="size-2.5" />
									{product.category}
								</span>
							{:else}
								<span class="text-xs text-gray-300 dark:text-gray-600">—</span>
							{/if}
						</td>

						<!-- Supplier -->
						<td class="px-4 py-3">
							{#if product.supplier}
								<span class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
									<Truck class="size-3.5 text-gray-400" />
									{product.supplier}
								</span>
							{:else}
								<span class="text-xs text-gray-300 dark:text-gray-600">—</span>
							{/if}
						</td>

						<!-- Price -->
						<td class="px-4 py-3 font-semibold text-gray-900 dark:text-gray-50">
							{formatCurrency(product.price)}
						</td>

						<!-- Commission -->
						<td class="px-4 py-3 text-gray-600 dark:text-gray-300">
							{formatCurrency(product.commission)}
						</td>

						<!-- Stock -->
						<td class="px-4 py-3">
							<div class="flex items-center gap-2">
								<span class="font-semibold
									{(product.quantity ?? 0) === 0
										? 'text-rose-600 dark:text-rose-400'
										: (product.quantity ?? 0) <= LOW_STOCK_THRESHOLD
											? 'text-amber-600 dark:text-amber-400'
											: 'text-gray-800 dark:text-gray-100'}">
									{product.quantity ?? '—'}
								</span>
								<span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium {stock.class}">
									<span class="size-1.5 rounded-full {stock.dot}"></span>
									{stock.label}
								</span>
							</div>
						</td>

						<!-- Units sold -->
						<td class="px-4 py-3">
							<span class="font-semibold
								{(product.saleCount ?? 0) > 0
									? 'text-emerald-600 dark:text-emerald-400'
									: 'text-gray-400 dark:text-gray-500'}">
								{product.saleCount ?? 0}
							</span>
						</td>

						<!-- Action -->
						<td class="px-4 py-3 text-right">
							<Button
								size="sm"
								variant="ghost"
								onclick={() => goto(`/dashboard/products/${product.id}`)}
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
						<td class="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400" colspan="3">
							Totals
						</td>
						<td class="px-4 py-2.5 font-bold text-gray-900 dark:text-gray-50">
							—
						</td>
						<td class="px-4 py-2.5 text-gray-500 dark:text-gray-400">—</td>
						<td class="px-4 py-2.5 font-bold text-gray-800 dark:text-gray-100">
							{filtered().reduce((acc, p) => acc + (p.quantity ?? 0), 0)} units
						</td>
						<td class="px-4 py-2.5 font-bold text-emerald-600 dark:text-emerald-400">
							{filtered().reduce((acc, p) => acc + (p.saleCount ?? 0), 0)} sold
						</td>
						<td></td>
					</tr>
				</tfoot>
			{/if}
		</table>
	</div>
</div>
