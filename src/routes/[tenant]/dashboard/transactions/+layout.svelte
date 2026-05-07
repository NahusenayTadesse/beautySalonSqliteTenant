<script>
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';

	import { Plus, Sheet } from '@lucide/svelte';
	let { data, children } = $props();
</script>

<div class="mb-8 flex flex-row flex-wrap items-center justify-start gap-2">
   	{#if data?.permList?.some((p) => p.name === 'view:transactions')}
		<Button
			href="/dashboard/transactions"
			variant={page.url.pathname.startsWith('/dashboard/transactions') && !page.url.pathname.includes('expenses') ? 'default' : 'outline'}
			><Sheet /> Transactions</Button
		>
	{/if}

	{#if data?.permList?.some((p) => p.name === 'add:expenses')}
		<Button
			href="/dashboard/transactions/expenses/add-expense"
			variant={page.url.pathname === '/dashboard/transactions/expenses/add-expense'
				? 'default'
				: 'outline'}><Plus /> Add Expense</Button
		>


	{/if}
	{#if data?.permList?.some((p) => p.name === 'view:expenses')}
		<Button
			href="/dashboard/transactions/expenses"
			variant={page.url.pathname.startsWith('/dashboard/transactions/expenses') && !page.url.pathname.includes('categories') ? 'default' : 'outline'}
			><Sheet /> Expenses</Button
		>
		<Button
			href="/dashboard/transactions/expenses/categories"
			variant={page.url.pathname === '/dashboard/transactions/expenses/categories'
				? 'default'
				: 'outline'}><Sheet />  Expense Categories</Button
		>
	{/if}
</div>

{@render children()}
