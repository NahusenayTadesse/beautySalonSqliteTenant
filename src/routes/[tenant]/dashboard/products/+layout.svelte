<script>
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';
	// import DialogComp from "$lib/formComponents/DialogComp.svelte";
	// import AddCustomer from "$lib/forms/AddCustomer.svelte";
	import { Plus, Sheet } from '@lucide/svelte';
	let { data, children } = $props();
</script>

<div class="mb-8 flex flex-row flex-wrap  items-center lg:justify-start justify-start gap-2">

   	<Button
		href="/dashboard/products"
		variant={page.url.pathname === '/dashboard/products' ? 'default' : 'outline'}
		><Sheet />All Products</Button
	>
	{#if data?.permList?.some((p) => p.name === 'add:products')}
		<Button
			href="/dashboard/products/add-products"
			variant={page.url.pathname === '/dashboard/products/add-products' ? 'default' : 'outline'}
			><Plus /> Add Products</Button
		>
	{/if}

	<Button
		href="/dashboard/products/categories"
		variant={page.url.pathname === '/dashboard/products/categories' ? 'default' : 'outline'}
		><Sheet /> Categories</Button
	>
	<Button
		href="/dashboard/products/suppliers"
		variant={page.url.pathname === '/dashboard/products/suppliers' ? 'default' : 'outline'}
		><Sheet /> Suppliers</Button
	>
	<Button
		href="/dashboard/products/suppliers/add-suppliers"
		variant={page.url.pathname === '/dashboard/products/suppliers/add-suppliers'
			? 'default'
			: 'outline'}><Plus /> Add Suppliers</Button
	>
	<!-- <DialogComp title="Add New Customer" {content} /> -->
</div>

<!-- {#snippet content()}

  <AddCustomer data={data?.form} action="/dashbaord/customers?/addCustomer" />

{/snippet} -->

{@render children?.()}
