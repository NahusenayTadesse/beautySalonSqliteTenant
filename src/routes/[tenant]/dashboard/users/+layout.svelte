<script>
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';
	// import DialogComp from "$lib/formComponents/DialogComp.svelte";
	// import AddCustomer from "$lib/forms/AddCustomer.svelte";
	import { Plus } from '@lucide/svelte';
	let { data, children } = $props();
</script>

<div class="mb-8 flex flex-row items-center justify-start gap-2">
	{#if data?.permList?.some((p) => p.name === 'add:users')}
		<Button
			href="/dashboard/users/add-users"
			variant={page.url.pathname === '/dashboard/users/add-users' ? 'default' : 'outline'}
			><Plus /> Add Users</Button
		>
	{/if}
	<!-- <DialogComp title="Add New Customer" {content} /> -->
</div>

<!-- {#snippet content()}

  <AddCustomer data={data?.form} action="/dashbaord/customers?/addCustomer" />

{/snippet} -->

{@render children?.()}
