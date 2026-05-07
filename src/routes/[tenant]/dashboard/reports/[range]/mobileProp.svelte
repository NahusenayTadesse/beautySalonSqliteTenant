<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import {
		Search,
		ChevronDown,
		ChevronUp,
		TrendingUp,
		TrendingDown,
		ShoppingBag,
		Scissors,
		Calendar,
		Users,
		ReceiptText,
		ArrowUpRight,
		ArrowDownRight,
		BarChart3
	} from '@lucide/svelte';

	type Report = {
		id: number;
		date: string; // e.g. "Monday 2025-01-06"
		bookedAppointments: number | null;
		productsSold: number | null;
		serviceRendered: number | null;
		dailyExpenses: number | null;
		dailyIncome: number | null;
		transactions: number | null;
		staffPaid: number | null;
		totalStaffPaid: number | null;
		staffHired: number | null;
		staffFired: number | null;
	};

	type SortKey = keyof Omit<Report, 'id'>;

	let { reports = $bindable([]) }: { reports: Report[] } = $props();

	let search = $state('');
	let sortKey = $state<SortKey>('date');
	let sortAsc = $state(true);

	function currency(v: number | null) {
		if (v == null) return '—';
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
	}

	function num(v: number | null) {
		return v ?? 0;
	}

	// "Monday 2025-01-06" → { day: "Monday", date: "Jan 6" }
	function parseDate(raw: string) {
		const [day, iso] = raw.split(' ');
		const d = new Date(iso + 'T00:00:00');
		return {
			day: day ?? '',
			short: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
			iso
		};
	}

	function net(r: Report) {
		return num(Number(r.dailyIncome)) - num(Number(r.dailyExpenses)) - num(Number(r.totalStaffPaid));
	}

	function toggleSort(key: SortKey) {
		if (sortKey === key) sortAsc = !sortAsc;
		else { sortKey = key; sortAsc = true; }
	}

	const filtered = $derived(() => {
		const q = search.toLowerCase().trim();
		return reports
			.filter((r) => !q || r.date.toLowerCase().includes(q))
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
		income: filtered().reduce((s, r) => s + num(Number(r.dailyIncome)), 0),
		expenses: filtered().reduce((s, r) => s + num(r.dailyExpenses), 0),
		staffPaid: filtered().reduce((s, r) => s + num(r.totalStaffPaid), 0),
		appointments: filtered().reduce((s, r) => s + num(r.bookedAppointments), 0),
		products: filtered().reduce((s, r) => s + num(r.productsSold), 0),
		services: filtered().reduce((s, r) => s + num(r.serviceRendered), 0),
		transactions: filtered().reduce((s, r) => s + num(r.transactions), 0),
		net: filtered().reduce((s, r) => s + net(r), 0)
	}));

	const COLS = [
		{ key: 'date',              label: 'Date' },
		{ key: 'dailyIncome',       label: 'Income' },
		{ key: 'dailyExpenses',     label: 'Expenses' },
		{ key: 'totalStaffPaid',    label: 'Staff Paid' },
		{ key: null,                label: 'Net' },
		{ key: 'transactions',      label: 'Txns' },
		{ key: 'bookedAppointments',label: 'Appts' },
		{ key: 'productsSold',      label: 'Products' },
		{ key: 'serviceRendered',   label: 'Services' },
		{ key: 'staffHired',        label: 'Hired' },
		{ key: 'staffFired',        label: 'Fired' }
	] as const;
</script>

<div class="w-full space-y-4 font-sans">
	<!-- Header -->
	<div class="flex flex-col gap-1">
		<h2 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">Reports</h2>
		<p class="text-sm text-gray-500 dark:text-gray-400">
			{filtered().length} day{filtered().length !== 1 ? 's' : ''} in view
		</p>
	</div>

	<!-- Summary stat cards -->
	<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
		<div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
			<p class="text-[11px] font-medium uppercase tracking-wider text-gray-400">Income</p>
			<p class="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">{currency(totals().income)}</p>
		</div>
		<div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
			<p class="text-[11px] font-medium uppercase tracking-wider text-gray-400">Expenses</p>
			<p class="mt-1 text-lg font-bold text-rose-600 dark:text-rose-400">{currency(totals().expenses)}</p>
		</div>
		<div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
			<p class="text-[11px] font-medium uppercase tracking-wider text-gray-400">Staff Paid</p>
			<p class="mt-1 text-lg font-bold text-amber-600 dark:text-amber-400">{currency(totals().staffPaid)}</p>
		</div>
		<div class="rounded-xl border border-gray-200 p-4 dark:border-gray-700
			{totals().net >= 0
				? 'bg-emerald-50 dark:bg-emerald-950/40'
				: 'bg-rose-50 dark:bg-rose-950/40'}">
			<p class="text-[11px] font-medium uppercase tracking-wider text-gray-400">Net</p>
			<p class="mt-1 text-lg font-bold
				{totals().net >= 0
					? 'text-emerald-700 dark:text-emerald-300'
					: 'text-rose-700 dark:text-rose-300'}">
				{currency(totals().net)}
			</p>
		</div>
	</div>

	<!-- Search -->
	<div class="relative">
		<Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
		<Input
			bind:value={search}
			placeholder="Search by date or day name…"
			class="h-10 bg-white pl-9 placeholder:text-gray-400 focus-visible:ring-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:focus-visible:ring-gray-600"
		/>
	</div>

	<!-- ─── Mobile: Cards ─── -->
	<div class="flex flex-col gap-3 md:hidden">
		{#if filtered().length === 0}
			<div class="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center dark:border-gray-700">
				<BarChart3 class="mb-3 size-8 text-gray-300 dark:text-gray-600" />
				<p class="text-sm font-medium text-gray-500 dark:text-gray-400">No reports found</p>
				<p class="mt-1 text-xs text-gray-400 dark:text-gray-500">Try adjusting your search</p>
			</div>
		{/if}

		{#each filtered() as r (r.id)}
			{@const d = parseDate(r.date)}
			{@const dayNet = net(r)}
			<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
				<!-- Date bar -->
				<div class="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-800/50">
					<div class="flex items-baseline gap-2">
						<span class="text-sm font-semibold text-gray-900 dark:text-gray-50">{d.short}</span>
						<span class="text-xs text-gray-400">{d.day}</span>
					</div>
					<span class="text-xs font-semibold
						{dayNet >= 0
							? 'text-emerald-600 dark:text-emerald-400'
							: 'text-rose-600 dark:text-rose-400'}">
						{dayNet >= 0 ? '+' : ''}{currency(dayNet)}
					</span>
				</div>

				<!-- Financial row -->
				<div class="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-800">
					<div class="p-3 text-center">
						<p class="text-[10px] font-medium uppercase tracking-wider text-gray-400">Income</p>
						<p class="mt-0.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
							{currency(r.dailyIncome)}
						</p>
					</div>
					<div class="p-3 text-center">
						<p class="text-[10px] font-medium uppercase tracking-wider text-gray-400">Expenses</p>
						<p class="mt-0.5 text-sm font-bold text-rose-600 dark:text-rose-400">
							{currency(r.dailyExpenses)}
						</p>
					</div>
					<div class="p-3 text-center">
						<p class="text-[10px] font-medium uppercase tracking-wider text-gray-400">Staff</p>
						<p class="mt-0.5 text-sm font-bold text-amber-600 dark:text-amber-400">
							{currency(r.totalStaffPaid)}
						</p>
					</div>
				</div>

				<!-- Activity row -->
				<div class="grid grid-cols-4 gap-px border-t border-gray-100 bg-gray-100 dark:border-gray-800 dark:bg-gray-800">
					{#each [
						{ icon: Calendar, label: 'Appts', value: num(r.bookedAppointments) },
						{ icon: ReceiptText, label: 'Txns', value: num(r.transactions) },
						{ icon: ShoppingBag, label: 'Products', value: num(r.productsSold) },
						{ icon: Scissors, label: 'Services', value: num(r.serviceRendered) }
					] as stat}
						<div class="flex flex-col items-center gap-0.5 bg-white p-2.5 dark:bg-gray-900">
							<stat.icon class="size-3.5 text-gray-400" />
							<span class="text-sm font-semibold text-gray-800 dark:text-gray-100">{stat.value}</span>
							<span class="text-[9px] font-medium uppercase tracking-wider text-gray-400">{stat.label}</span>
						</div>
					{/each}
				</div>

				<!-- Staff changes (only show if non-zero) -->
				{#if num(r.staffHired) > 0 || num(r.staffFired) > 0}
					<div class="flex items-center gap-3 border-t border-gray-100 px-4 py-2 dark:border-gray-800">
						{#if num(r.staffHired) > 0}
							<span class="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
								<ArrowUpRight class="size-3" />
								{r.staffHired} hired
							</span>
						{/if}
						{#if num(r.staffFired) > 0}
							<span class="flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
								<ArrowDownRight class="size-3" />
								{r.staffFired} let go
							</span>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- ─── Desktop: Table ─── -->
	<div class="hidden overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 md:block">
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead class="bg-gray-50 dark:bg-gray-800/60">
					<tr>
						{#each COLS as col}
							<th
								class="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400
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
									<BarChart3 class="size-8 text-gray-300 dark:text-gray-600" />
									<p class="text-sm font-medium text-gray-500 dark:text-gray-400">No reports found</p>
								</div>
							</td>
						</tr>
					{/if}

					{#each filtered() as r (r.id)}
						{@const d = parseDate(r.date)}
						{@const dayNet = net(r)}
						<tr class="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40">

							<!-- Date -->
							<td class="whitespace-nowrap px-4 py-3">
								<div class="font-medium text-gray-900 dark:text-gray-50">{d.short}</div>
								<div class="text-xs text-gray-400">{d.day}</div>
							</td>

							<!-- Income -->
							<td class="whitespace-nowrap px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
								{currency(r.dailyIncome)}
							</td>

							<!-- Expenses -->
							<td class="whitespace-nowrap px-4 py-3 font-semibold text-rose-600 dark:text-rose-400">
								{currency(r.dailyExpenses)}
							</td>

							<!-- Staff paid -->
							<td class="whitespace-nowrap px-4 py-3 text-amber-600 dark:text-amber-400">
								{currency(r.totalStaffPaid)}
								{#if num(r.staffPaid) > 0}
									<span class="ml-1 text-[10px] text-gray-400">({r.staffPaid})</span>
								{/if}
							</td>

							<!-- Net -->
							<td class="whitespace-nowrap px-4 py-3">
								<span class="inline-flex items-center gap-1 font-semibold
									{dayNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">
									{#if dayNet >= 0}
										<TrendingUp class="size-3.5" />
									{:else}
										<TrendingDown class="size-3.5" />
									{/if}
									{currency(dayNet)}
								</span>
							</td>

							<!-- Transactions -->
							<td class="px-4 py-3 text-gray-700 dark:text-gray-300">{num(r.transactions)}</td>

							<!-- Appointments -->
							<td class="px-4 py-3 text-gray-700 dark:text-gray-300">{num(r.bookedAppointments)}</td>

							<!-- Products -->
							<td class="px-4 py-3 text-gray-700 dark:text-gray-300">{num(r.productsSold)}</td>

							<!-- Services -->
							<td class="px-4 py-3 text-gray-700 dark:text-gray-300">{num(r.serviceRendered)}</td>

							<!-- Hired -->
							<td class="px-4 py-3">
								{#if num(r.staffHired) > 0}
									<span class="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
										<ArrowUpRight class="size-3" />{r.staffHired}
									</span>
								{:else}
									<span class="text-gray-300 dark:text-gray-600">—</span>
								{/if}
							</td>

							<!-- Fired -->
							<td class="px-4 py-3">
								{#if num(r.staffFired) > 0}
									<span class="inline-flex items-center gap-1 font-medium text-rose-600 dark:text-rose-400">
										<ArrowDownRight class="size-3" />{r.staffFired}
									</span>
								{:else}
									<span class="text-gray-300 dark:text-gray-600">—</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>

				<!-- Totals footer -->
				{#if filtered().length > 0}
					<tfoot class="border-t-2 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/60">
						<tr>
							<td class="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
								Totals
							</td>
							<td class="whitespace-nowrap px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
								{currency(totals().income)}
							</td>
							<td class="whitespace-nowrap px-4 py-3 font-bold text-rose-600 dark:text-rose-400">
								{currency(totals().expenses)}
							</td>
							<td class="whitespace-nowrap px-4 py-3 font-bold text-amber-600 dark:text-amber-400">
								{currency(totals().staffPaid)}
							</td>
							<td class="whitespace-nowrap px-4 py-3">
								<span class="inline-flex items-center gap-1 font-bold
									{totals().net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">
									{#if totals().net >= 0}
										<TrendingUp class="size-3.5" />
									{:else}
										<TrendingDown class="size-3.5" />
									{/if}
									{currency(totals().net)}
								</span>
							</td>
							<td class="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">{totals().transactions}</td>
							<td class="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">{totals().appointments}</td>
							<td class="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">{totals().products}</td>
							<td class="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">{totals().services}</td>
							<td class="px-4 py-3"></td>
							<td class="px-4 py-3"></td>
						</tr>
					</tfoot>
				{/if}
			</table>
		</div>
	</div>
</div>
