<script>
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';

	import { Plus, Sheet } from '@lucide/svelte';
	let { data, children } = $props();
</script>

<div class="mb-8 flex flex-row flex-wrap items-center justify-start gap-2">
   	<Button
		href="/dashboard/services"
		variant={page.url.pathname === '/dashboard/services' ? 'default' : 'outline'}
		><Sheet /> Services</Button
	>
	{#if data?.permList?.some((p) => p.name === 'add:services')}
		<Button
			href="/dashboard/services/add-services"
			variant={page.url.pathname === '/dashboard/services/add-services' ? 'default' : 'outline'}
			><Plus /> Add Services</Button
		>
	{/if}
	<Button
		href="/dashboard/services/categories"
		variant={page.url.pathname === '/dashboard/services/categories' ? 'default' : 'outline'}
		><Sheet /> Categories</Button
	>

</div>

{@render children?.()}
