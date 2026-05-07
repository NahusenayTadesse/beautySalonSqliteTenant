<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import {
		Search,
		ChevronDown,
		ChevronUp,
		ArrowRight,
		Phone,
		Mail,
		Briefcase,
		Users
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';

	type StaffMember = {
		id: number;
		name: string;
		position: string | null;
		phone: string | null;
		email: string | null;
		status: string | null;
		years: number | null;
	};

	type SortKey = 'name' | 'position' | 'status' | 'years';

	let { staffList = $bindable() }: { staffList: StaffMember[] } = $props();

	let search = $state('');
	let activePosition = $state<string>('all');
	let sortKey = $state<SortKey>('name');
	let sortAsc = $state(true);

	function getInitials(name: string) {
		return name
			.split(' ')
			.map((n) => n[0])
			.slice(0, 2)
			.join('')
			.toUpperCase();
	}

	// Deterministic avatar color from name
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

	function formatYears(years: number | null) {
		if (years == null) return '—';
		if (years === 0) return '< 1 yr';
		return `${years} yr${years !== 1 ? 's' : ''}`;
	}

	function normalizeStatus(status: string | null) {
		if (!status) return { label: 'Unknown', class: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' };
		const s = status.toLowerCase();
		if (s === 'full-time' || s === 'fulltime' || s === 'full_time')
			return { label: 'Full-time', class: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800' };
		if (s === 'part-time' || s === 'parttime' || s === 'part_time')
			return { label: 'Part-time', class: 'bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800' };
		if (s === 'contract' || s === 'contractor')
			return { label: 'Contract', class: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' };
		if (s === 'casual')
			return { label: 'Casual', class: 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800' };
		// fallback: capitalise whatever value comes through
		return {
			label: status.charAt(0).toUpperCase() + status.slice(1),
			class: 'bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
		};
	}

	function toggleSort(key: SortKey) {
		if (sortKey === key) sortAsc = !sortAsc;
		else { sortKey = key; sortAsc = true; }
	}

	const positions = $derived(() => {
		const set = new Set(staffList.map((s) => s.position ?? 'Unassigned'));
		return ['all', ...Array.from(set).sort()];
	});

	const positionCounts = $derived(() => {
		const map: Record<string, number> = { all: staffList.length };
		for (const s of staffList) {
			const p = s.position ?? 'Unassigned';
			map[p] = (map[p] ?? 0) + 1;
		}
		return map;
	});

	const filtered = $derived(() => {
		const q = search.toLowerCase().trim();
		return staffList
			.filter((s) => {
				const matchesSearch =
					!q ||
					s.name.toLowerCase().includes(q) ||
					(s.position ?? '').toLowerCase().includes(q) ||
					(s.email ?? '').toLowerCase().includes(q) ||
					(s.phone ?? '').includes(q);
				const matchesPosition =
					activePosition === 'all' || (s.position ?? 'Unassigned') === activePosition;
				return matchesSearch && matchesPosition;
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
</script>

<div class="w-full space-y-4 font-sans">
	<!-- Header -->
	<div class="flex flex-col gap-1">
		<h2 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">Staff</h2>
		<p class="text-sm text-gray-500 dark:text-gray-400">
			{filtered().length} of {staffList.length} members
		</p>
	</div>

	<!-- Search -->
	<div class="relative">
		<Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
		<Input
			bind:value={search}
			placeholder="Search by name, position, email…"
			class="h-10 bg-white pl-9 placeholder:text-gray-400 focus-visible:ring-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:focus-visible:ring-gray-600"
		/>
	</div>

	<!-- Position filter tabs -->
	<div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
		{#each positions() as pos}
			<button
				onclick={() => (activePosition = pos)}
				class="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all
					{activePosition === pos
					? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
					: 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'}"
			>
				{pos === 'all' ? 'All' : pos}
				<span
					class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold
					{activePosition === pos
						? 'bg-white/20 text-white dark:bg-black/20 dark:text-gray-900'
						: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}"
				>
					{positionCounts()[pos] ?? 0}
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
				<Users class="mb-3 size-8 text-gray-300 dark:text-gray-600" />
				<p class="text-sm font-medium text-gray-500 dark:text-gray-400">No staff found</p>
				<p class="mt-1 text-xs text-gray-400 dark:text-gray-500">Try adjusting your search or filter</p>
			</div>
		{/if}

		{#each filtered() as member (member.id)}
			{@const status = normalizeStatus(member.status)}
			<div
				class="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
			>
				<div class="flex flex-1 flex-col gap-3 p-4">
					<!-- Avatar + name -->
					<div class="flex items-center gap-3">
						<div
							class="flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold {avatarColor(member.name)}"
						>
							{getInitials(member.name)}
						</div>
						<div class="min-w-0">
							<p class="truncate font-semibold text-gray-900 dark:text-gray-50">{member.name}</p>
							{#if member.position}
								<p class="flex items-center gap-1 truncate text-xs text-gray-500 dark:text-gray-400">
									<Briefcase class="size-3 shrink-0" />
									{member.position}
								</p>
							{/if}
						</div>
					</div>

					<!-- Status + tenure -->
					<div class="flex items-center gap-2">
						<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium {status.class}">
							{status.label}
						</span>
						<span class="text-xs text-gray-400 dark:text-gray-500">
							{formatYears(member.years)}
						</span>
					</div>

					<!-- Contact -->
					<div class="space-y-1">
						{#if member.phone}
							<a
								href="tel:{member.phone}"
								class="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
							>
								<Phone class="size-3 shrink-0 text-gray-400" />
								{member.phone}
							</a>
						{/if}
						{#if member.email}
							<a
								href="mailto:{member.email}"
								class="flex items-center gap-2 truncate text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
							>
								<Mail class="size-3 shrink-0 text-gray-400" />
								{member.email}
							</a>
						{/if}
					</div>
				</div>

				<!-- Card footer -->
				<div class="border-t border-gray-100 px-4 py-2.5 dark:border-gray-800">
					<div class="flex justify-end">
						<Button
							size="sm"
							variant="ghost"
							onclick={() => goto(`/dashboard/staff/${member.id}`)}
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
							{ key: 'name', label: 'Name' },
							{ key: 'position', label: 'Position' },
							{ key: 'status', label: 'Status' },
							{ key: null, label: 'Contact' },
							{ key: 'years', label: 'Tenure' },
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
						<td colspan="6" class="py-16 text-center">
							<div class="flex flex-col items-center gap-2">
								<Users class="size-8 text-gray-300 dark:text-gray-600" />
								<p class="text-sm font-medium text-gray-500 dark:text-gray-400">No staff found</p>
								<p class="text-xs text-gray-400 dark:text-gray-500">Try adjusting your search or filter</p>
							</div>
						</td>
					</tr>
				{/if}

				{#each filtered() as member (member.id)}
					{@const status = normalizeStatus(member.status)}
					<tr class="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40">
						<!-- Name + avatar -->
						<td class="px-4 py-3">
							<div class="flex items-center gap-3">
								<div
									class="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold {avatarColor(member.name)}"
								>
									{getInitials(member.name)}
								</div>
								<span class="font-medium text-gray-900 dark:text-gray-50">{member.name}</span>
							</div>
						</td>

						<!-- Position -->
						<td class="px-4 py-3">
							{#if member.position}
								<span class="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
									<Briefcase class="size-3.5 text-gray-400" />
									{member.position}
								</span>
							{:else}
								<span class="text-xs text-gray-300 dark:text-gray-600">—</span>
							{/if}
						</td>

						<!-- Status -->
						<td class="px-4 py-3">
							<span class="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium {status.class}">
								{status.label}
							</span>
						</td>

						<!-- Contact -->
						<td class="px-4 py-3">
							<div class="flex flex-col gap-0.5">
								{#if member.phone}
									<a
										href="tel:{member.phone}"
										class="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
									>
										<Phone class="size-3 text-gray-400" />
										{member.phone}
									</a>
								{/if}
								{#if member.email}
									<a
										href="mailto:{member.email}"
										class="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
									>
										<Mail class="size-3 text-gray-400" />
										{member.email}
									</a>
								{/if}
								{#if !member.phone && !member.email}
									<span class="text-xs text-gray-300 dark:text-gray-600">—</span>
								{/if}
							</div>
						</td>

						<!-- Tenure -->
						<td class="px-4 py-3 text-gray-600 dark:text-gray-300">
							{formatYears(member.years)}
						</td>

						<!-- Action -->
						<td class="px-4 py-3 text-right">
							<Button
								size="sm"
								variant="ghost"
								onclick={() => goto(`/dashboard/staff/${member.id}`)}
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

		<!-- Footer -->
		{#if filtered().length > 0}
			<div
				class="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-800/40"
			>
				<span class="text-xs text-gray-500 dark:text-gray-400">
					{filtered().length} member{filtered().length !== 1 ? 's' : ''}
				</span>
				<span class="text-xs text-gray-500 dark:text-gray-400">
					Avg tenure:
					<span class="font-semibold text-gray-700 dark:text-gray-200">
						{#if filtered().length > 0}
							{(filtered().reduce((acc, s) => acc + (s.years ?? 0), 0) / filtered().length).toFixed(1)} yrs
						{:else}
							—
						{/if}
					</span>
				</span>
			</div>
		{/if}
	</div>
</div>
