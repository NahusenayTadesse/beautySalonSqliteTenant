<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import {
		Search,
		ChevronDown,
		ChevronUp,
		ArrowRight,
		Receipt,
		User,
		ShoppingBag,
		Scissors,
		Package,
		CreditCard,
		ExternalLink,

		Eye

	} from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { formatEthiopianDate } from '$lib/global.svelte';

	type Transaction = {
		id: number;
		date: string; // "Monday 2025-01-06"
		amount: number;
		paymentMethods: string | null;
		customerName: string | null;
		customerId: number | null;
		noOfProducts: number | null;
		noOfServices: number | null;
		noOfSupplies: number | null;
		recievedBy: string | null;
		recievedById: number | null;
		recieptLink: string | null;
	};

	type SortKey = 'date' | 'amount' | 'customerName' | 'noOfProducts' | 'noOfServices';

	let { transactions = $bindable([]) }: { transactions: Transaction[] } = $props();

	let search = $state('');
	let activeMethod = $state('all');
	let sortKey = $state<SortKey>('date');
	let sortAsc = $state(false);

	function formatCurrency(v: number) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(v);
	}

	function parseDate(raw: string) {
		const [day, iso] = raw.split(' ');
		const d = new Date(iso + 'T00:00:00');
		return {
			day: day ?? '',
			short: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
			iso
		};
	}

	// Payment method → style
	function methodStyle(method: string | null): { class: string; dot: string } {
		if (!method) return { class: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400', dot: 'bg-gray-400' };
		const m = method.toLowerCase();
		if (m.includes('cash'))   return { class: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800', dot: 'bg-emerald-500' };
		if (m.includes('card') || m.includes('credit') || m.includes('debit'))
			return { class: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800', dot: 'bg-blue-500' };
		if (m.includes('transfer') || m.includes('bank'))
			return { class: 'bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800', dot: 'bg-violet-500' };
		if (m.includes('mobile') || m.includes('pay') || m.includes('wallet'))
			return { class: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800', dot: 'bg-amber-500' };
		return { class: 'bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700', dot: 'bg-gray-500' };
	}

	function toggleSort(key: SortKey) {
		if (sortKey === key) sortAsc = !sortAsc;
		else { sortKey = key; sortAsc = true; }
	}

	const paymentMethods = $derived(() => {
		const set = new Set(transactions.map((t) => t.paymentMethods ?? 'Unknown'));
		return ['all', ...Array.from(set).sort()];
	});

	const methodCounts = $derived(() => {
		const map: Record<string, number> = { all: transactions.length };
		for (const t of transactions) {
			const m = t.paymentMethods ?? 'Unknown';
			map[m] = (map[m] ?? 0) + 1;
		}
		return map;
	});

	const filtered = $derived(() => {
		const q = search.toLowerCase().trim();
		return transactions
			.filter((t) => {
				const matchesSearch =
					!q ||
					(t.customerName ?? '').toLowerCase().includes(q) ||
					(t.recievedBy ?? '').toLowerCase().includes(q) ||
					(t.paymentMethods ?? '').toLowerCase().includes(q) ||
					t.date.toLowerCase().includes(q) ||
					t.amount.toString().includes(q);
				const matchesMethod =
					activeMethod === 'all' || (t.paymentMethods ?? 'Unknown') === activeMethod;
				return matchesSearch && matchesMethod;
			})
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
		revenue: filtered().reduce((s, t) => s + Number(t.amount), 0),
		transactions: filtered().length,
		products: filtered().reduce((s, t) => s + (t.noOfProducts ?? 0), 0),
		services: filtered().reduce((s, t) => s + (t.noOfServices ?? 0), 0),
		supplies: filtered().reduce((s, t) => s + (t.noOfSupplies ?? 0), 0)
	}));

	const COLS = [
		{ key: 'date',         label: 'Date' },
		{ key: 'customerName', label: 'Customer' },
		{ key: 'amount',       label: 'Amount' },
		{ key: null,           label: 'Method' },
		{ key: 'noOfServices', label: 'Services' },
		{ key: 'noOfProducts', label: 'Products' },
		{ key: null,           label: 'Supplies' },
		{ key: null,           label: 'Received By' },
		{ key: null,           label: '' }
	] as const;
</script>

<div class="w-full space-y-4 font-sans">
	<!-- Header -->
	<div class="flex flex-col gap-1">
		<h2 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">Transactions</h2>
		<p class="text-sm text-gray-500 dark:text-gray-400">
			{filtered().length} of {transactions.length} transactions
		</p>
	</div>

	<!-- Summary cards -->
	<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
		<div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
			<p class="text-[11px] font-medium uppercase tracking-wider text-gray-400">Revenue</p>
			<p class="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totals().revenue)}</p>
		</div>
		<div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
			<p class="text-[11px] font-medium uppercase tracking-wider text-gray-400">Transactions</p>
			<p class="mt-1 text-lg font-bold text-gray-900 dark:text-gray-50">{totals().transactions}</p>
		</div>
		<div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
			<p class="text-[11px] font-medium uppercase tracking-wider text-gray-400">Services</p>
			<p class="mt-1 text-lg font-bold text-gray-900 dark:text-gray-50">{totals().services}</p>
		</div>
		<div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
			<p class="text-[11px] font-medium uppercase tracking-wider text-gray-400">Products</p>
			<p class="mt-1 text-lg font-bold text-gray-900 dark:text-gray-50">{totals().products}</p>
		</div>
	</div>

	<!-- Search -->
	<div class="relative">
		<Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
		<Input
			bind:value={search}
			placeholder="Search by customer, staff, method, amount…"
			class="h-10 bg-white pl-9 placeholder:text-gray-400 focus-visible:ring-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:focus-visible:ring-gray-600"
		/>
	</div>

	<!-- Payment method filter -->
	<div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
		{#each paymentMethods() as method}
			{@const style = methodStyle(method === 'all' ? null : method)}
			<button
				onclick={() => (activeMethod = method)}
				class="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all
					{activeMethod === method
					? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
					: 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'}"
			>
				{#if method !== 'all'}
					<span class="size-1.5 rounded-full {style.dot}"></span>
				{/if}
				{method === 'all' ? 'All methods' : method}
				<span class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold
					{activeMethod === method
						? 'bg-white/20 text-white dark:bg-black/20 dark:text-gray-900'
						: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}">
					{methodCounts()[method] ?? 0}
				</span>
			</button>
		{/each}
	</div>

	<!-- ─── Mobile: Cards ─── -->
	<div class="flex flex-col gap-3 md:hidden">
		{#if filtered().length === 0}
			<div class="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center dark:border-gray-700">
				<Receipt class="mb-3 size-8 text-gray-300 dark:text-gray-600" />
				<p class="text-sm font-medium text-gray-500 dark:text-gray-400">No transactions found</p>
				<p class="mt-1 text-xs text-gray-400 dark:text-gray-500">Try adjusting your search or filter</p>
			</div>
		{/if}

		{#each filtered() as txn (txn.id)}
			{@const d = parseDate(txn.date)}
			{@const style = methodStyle(txn.paymentMethods)}
			<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
				<!-- Top row: date + amount -->
				<div class="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-800/50">
					<div class="flex items-baseline gap-2">
						<span class="text-sm font-semibold text-gray-900 dark:text-gray-50">{d.short}</span>
						<span class="text-xs text-gray-400">{d.day}</span>
					</div>
					<span class="text-base font-bold text-emerald-600 dark:text-emerald-400">
						{formatCurrency(txn.amount)}
					</span>
				</div>

				<div class="flex flex-col gap-3 p-4">
					<!-- Customer + method -->
					<div class="flex items-start justify-between gap-3">
						<div class="flex flex-col gap-0.5">
							{#if txn.customerName}
								<button
									onclick={() => txn.customerId && goto(`/dashboard/customers/${txn.customerId}`)}
									class="flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-blue-600 dark:text-gray-50 dark:hover:text-blue-400"
								>
									<User class="size-3.5 text-gray-400" />
									{txn.customerName}
								</button>
							{:else}
								<span class="text-xs text-gray-400">Walk-in</span>
							{/if}
							{#if txn.recievedBy}
							<button
								onclick={() => txn.customerId && goto(`/dashboard/users/${txn.recievedById}`)}
								class="flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-blue-600 dark:text-gray-50 dark:hover:text-blue-400"
							>
								<User class="size-3.5 text-gray-400" />
								{txn.recievedBy}
							</button>
							{/if}
						</div>
						{#if txn.paymentMethods}
							<span class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium {style.class}">
								<span class="size-1.5 rounded-full {style.dot}"></span>
								{txn.paymentMethods}
							</span>
						{/if}
					</div>

					<!-- Item counts -->
					<div class="flex items-center gap-4">
						{#if (txn.noOfServices ?? 0) > 0}
							<span class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
								<Scissors class="size-3.5 text-gray-400" />
								{txn.noOfServices} service{txn.noOfServices !== 1 ? 's' : ''}
							</span>
						{/if}
						{#if (txn.noOfProducts ?? 0) > 0}
							<span class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
								<ShoppingBag class="size-3.5 text-gray-400" />
								{txn.noOfProducts} product{txn.noOfProducts !== 1 ? 's' : ''}
							</span>
						{/if}
						{#if (txn.noOfSupplies ?? 0) > 0}
							<span class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
								<Package class="size-3.5 text-gray-400" />
								{txn.noOfSupplies} suppl{txn.noOfSupplies !== 1 ? 'ies' : 'y'}
							</span>
						{/if}
						{#if !(txn.noOfServices ?? 0) && !(txn.noOfProducts ?? 0) && !(txn.noOfSupplies ?? 0)}
							<span class="text-xs text-gray-300 dark:text-gray-600">No items</span>
						{/if}
					</div>
				</div>

				<!-- Footer -->
				{#if txn.recieptLink}
					<div class="border-t border-gray-100 px-4 py-2.5 dark:border-gray-800">
						<a
							href="/dashboard/files/{txn.recieptLink}"
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
						>
							<ExternalLink class="size-3" />
							View receipt
						</a>
					</div>
				{/if}

				<div class="border-t border-gray-100 px-4 py-2.5 dark:border-gray-800">
					<a
						href="/dashboard/transactions/single/{txn.id}"

						class="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
					>
						<Eye class="size-3" />
						View details
					</a>
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
								<Receipt class="size-8 text-gray-300 dark:text-gray-600" />
								<p class="text-sm font-medium text-gray-500 dark:text-gray-400">No transactions found</p>
							</div>
						</td>
					</tr>
				{/if}

				{#each filtered() as txn (txn.id)}
					{@const d = formatEthiopianDate(new Date(txn.date))}
					{@const style = methodStyle(txn.paymentMethods)}
					<tr class="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40">

						<!-- Date -->
						<td class="whitespace-nowrap px-4 py-3">
							<div class="font-medium text-gray-900 dark:text-gray-50">{d.short}</div>
							<div class="text-xs text-gray-400">{d.day}</div>
						</td>

						<!-- Customer -->
						<td class="px-4 py-3">
							{#if txn.customerName}
								<button
									onclick={() => txn.customerId && goto(`/dashboard/customers/${txn.customerId}`)}
									class="font-medium text-gray-900 hover:text-blue-600 dark:text-gray-50 dark:hover:text-blue-400"
								>
									{txn.customerName}
								</button>
							{:else}
								<span class="text-xs text-gray-400">Walk-in</span>
							{/if}
						</td>

						<!-- Amount -->
						<td class="whitespace-nowrap px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
							{formatCurrency(txn.amount)}
						</td>

						<!-- Method -->
						<td class="px-4 py-3">
							{#if txn.paymentMethods}
								<span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium {style.class}">
									<span class="size-1.5 rounded-full {style.dot}"></span>
									{txn.paymentMethods}
								</span>
							{:else}
								<span class="text-xs text-gray-300 dark:text-gray-600">—</span>
							{/if}
						</td>

						<!-- Services -->
						<td class="px-4 py-3">
							{#if (txn.noOfServices ?? 0) > 0}
								<span class="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
									<Scissors class="size-3.5 text-gray-400" />
									{txn.noOfServices}
								</span>
							{:else}
								<span class="text-gray-300 dark:text-gray-600">—</span>
							{/if}
						</td>

						<!-- Products -->
						<td class="px-4 py-3">
							{#if (txn.noOfProducts ?? 0) > 0}
								<span class="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
									<ShoppingBag class="size-3.5 text-gray-400" />
									{txn.noOfProducts}
								</span>
							{:else}
								<span class="text-gray-300 dark:text-gray-600">—</span>
							{/if}
						</td>

						<!-- Supplies -->
						<td class="px-4 py-3">
							{#if (txn.noOfSupplies ?? 0) > 0}
								<span class="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
									<Package class="size-3.5 text-gray-400" />
									{txn.noOfSupplies}
								</span>
							{:else}
								<span class="text-gray-300 dark:text-gray-600">—</span>
							{/if}
						</td>

						<!-- Received by -->
						<td class="px-4 py-3">
							{#if txn.recievedBy}
								<div class="flex items-center gap-2">
									<div class="flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
										{txn.recievedBy.charAt(0).toUpperCase()}
									</div>
									<span class="text-xs text-gray-600 dark:text-gray-300">{txn.recievedBy}</span>
								</div>
							{:else}
								<span class="text-xs text-gray-300 dark:text-gray-600">—</span>
							{/if}
						</td>

						<!-- Action -->
						<td class="px-4 py-3 text-right">
							<div class="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
								{#if txn.recieptLink}
									<a
										href={txn.recieptLink}
										target="_blank"
										rel="noopener noreferrer"
										class="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
									>
										<ExternalLink class="size-3.5" />
										Receipt
									</a>
								{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>

			<!-- Footer totals -->
			{#if filtered().length > 0}
				<tfoot class="border-t-2 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/60">
					<tr>
						<td class="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
							{filtered().length} total
						</td>
						<td class="px-4 py-2.5"></td>
						<td class="whitespace-nowrap px-4 py-2.5 font-bold text-emerald-600 dark:text-emerald-400">
							{formatCurrency(totals().revenue)}
						</td>
						<td class="px-4 py-2.5"></td>
						<td class="px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-200">{totals().services}</td>
						<td class="px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-200">{totals().products}</td>
						<td class="px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-200">{totals().supplies}</td>
						<td class="px-4 py-2.5"></td>
						<td class="px-4 py-2.5"></td>
					</tr>
				</tfoot>
			{/if}
		</table>
	</div>
</div>
