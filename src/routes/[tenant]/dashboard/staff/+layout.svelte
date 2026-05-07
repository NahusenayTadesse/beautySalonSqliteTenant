<script>
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';

	import { Plus, Sheet } from '@lucide/svelte';
	let { data, children } = $props();
</script>

<div class="mb-8 flex flex-row items-center justify-start gap-2">
	<Button
		href="/dashboard/staff"
		variant={page.url.pathname === '/dashboard/staff' ? 'default' : 'outline'}
		><Sheet /> All Staff</Button
	>
	{#if data?.permList?.some((p) => p.name === 'add:staff')}
		<Button
			href="/dashboard/staff/add-staff"
			variant={page.url.pathname === '/dashboard/staff/add-staff' ? 'default' : 'outline'}
			><Plus /> Add Staff</Button
		>
	{/if}
	<Button
		href="/dashboard/staff/positions"
		variant={page.url.pathname === '/dashboard/staff/positions' ? 'default' : 'outline'}
		><Sheet /> Positions</Button
	>
</div>

{@render children()}
