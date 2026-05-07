<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	import ComboboxComp from '$lib/formComponents/ComboboxComp.svelte';
	import { Plus, X, BrushCleaning } from '@lucide/svelte';
	import DialogComp from '$lib/formComponents/DialogComp.svelte';
	import AddCustomer from '$lib/forms/AddCustomer.svelte';


	let { data } = $props();

	function getPrice(
		List: Array<{ value: number; name: string; price: string }>,
		value: number
	): number | null {
		const item = List.find((s) => s.value === value);
		return item ? Number(item.price) : null;
	}

	let arrParts = `flex flex-col justify-start gap-2 w-full`;
	let singleContainer = `flex lg:flex-row flex-col gap-3 border-1
 border-white/20 dark:border-black/20
 backdrop-blur-lg shadow-lg bg-white/10 dark:bg-black/50
  dark:bg-gray-700 p-3 rounded-lg w-full items-end`;
	let errorsStyle = `text-red-500 text-sm`;

	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { salesSchema } from './schema';
	import { superForm } from 'sveltekit-superforms/client';
	import { fly } from 'svelte/transition';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import FileUpload from '$lib/formComponents/FileUpload.svelte';
	import Errors from '$lib/formComponents/Errors.svelte';
	import type { Snapshot } from '@sveltejs/kit';

	const { form, errors, enhance, delayed, allErrors, capture, restore, message } = superForm(
		data.form,
		{
			taintedMessage: () => {
				return new Promise((resolve) => {
					resolve(window.confirm('Do you want to leave?\nChanges you made may not be saved.'));
				});
			},
			resetForm: true,
			dataType: 'json',
			validators: zod4Client(salesSchema),
			id: 'sales-form',
		}
	);

	import { toast } from 'svelte-sonner';
	$effect(() => {
		if ($message) {
			if ($message.type === 'error') {
				toast.error($message.text);

			} else {
				toast.success($message.text);
			}
		}
	});

	export const snapshot: Snapshot = { capture, restore };

	function addProduct() {
		$form.products = [...$form.products, { staff: 0, product: 0, noofproducts: 1, tip: 0 }];
	}

	function addService() {
		$form.services = [...$form.services, { staff: 0, service: 0, serviceTip: 0 }];
	}

	let checkoutTotal = $derived(
		$form.products.reduce((total, _, i) => {
			const price = getPrice(data.products, $form.products[i].product) || 0;
			const qty = $form.products[i].noofproducts || 0;
			const tip = $form.products[i].tip || 0;
			return total + price * qty + tip;
		}, 0)
	);
	let checkoutTotalService = $derived(
		$form.services.reduce((total, _, i) => {
			const price = getPrice(data.services, $form.services[i].service) || 0;
			const tip = $form.services[i].serviceTip || 0;
			return total + price + tip;
		}, 0)
	);

	let total = $derived(checkoutTotal + checkoutTotalService + ($form?.generalTip || 0));

	$effect(() => {
		$form.productAmount = checkoutTotal;
		$form.serviceAmount = checkoutTotalService;
		$form.total = total;
	});

	function handleNewCustomer(newId: number) {
        $form.customer = newId;
        // The Combobox usually reacts to the bound value,
        // so this should auto-select the new customer.

        toast.success("Customer selected automatically");
    }
</script>

<svelte:head>
	<title>Sales</title>
</svelte:head>

<h1>Sales</h1>

{#snippet combo(name, items)}
	<div class="flex w-full flex-col justify-start gap-2">
		<Label for={name} class="capitalize">{name.replace(/([a-z])([A-Z])/g, '$1 $2')}:</Label>

		<ComboboxComp {name} required={true} bind:value={$form[name]} {items} />
		{#if $errors[name]}<span class="text-red-500">{$errors[name]}</span>{/if}
	</div>
{/snippet}

{#key data.customers}
<DialogComp title="Add New Customer" variant="default">
						<AddCustomer onCustomerAdded={handleNewCustomer} data={data?.addCus} action="?/addCustomer" />
					</DialogComp>
					{/key}

<form action="?/addSales" method="post" enctype="multipart/form-data" use:enhance>
	<div
		class="mt-6 w-full max-w-3xl rounded-lg border border-slate-200 bg-white p-4 shadow dark:border-slate-700 dark:bg-slate-800"
	>
		<Errors allErrors={$allErrors} />

		<div class="flex flex-row gap-4">
			<Button type="button" onclick={() => addProduct()}><Plus /> Add Product</Button>
			<Button type="button" onclick={() => addService()}><Plus /> Add Service</Button>
		</div>
		<div class="mt-6 flex flex-col gap-4">
			{#if $form.products.length}
				<h2>Products</h2>
			{/if}

			{#each [...$form.products].reverse() as _, i}
				<div class={singleContainer} transition:fly={{ x: -200, duration: 200 }}>
					{$form.products.length - (i)}
					<div class={arrParts}>
						<Label for="staff">Selling Staff Member</Label>
						<ComboboxComp
							items={data.staffes}
							required={true}
							name="staff"
							bind:value={$form.products[i].staff}
						/>

						{#if $errors.products?.[i]?.staff}
							<p class={errorsStyle}>{$errors.products[i].staff}</p>
						{/if}
					</div>

					<div class={arrParts}>
						<Label for="product">Selling Product</Label>

						<ComboboxComp
							items={data.products}
							name="product"
							required={true}
							bind:value={$form.products[i].product}
						/>

						{#if $errors.products?.[i]?.product}
							<p class={errorsStyle}>{$errors.products[i].product}</p>
						{/if}
					</div>
					<div class={arrParts}>
						<Label for="noofproducts">Number of Product</Label>

						<Input
							type="number"
							min="1"
							name="noOfProducts"
							bind:value={$form.products[i].noofproducts}
						/>

						{#if $errors.products?.[i]?.noofproducts}
							<p class={errorsStyle}>{$errors.products[i].noofproducts}</p>
						{/if}
					</div>
					<div class={arrParts}>
						<Label for="tip">Tip</Label>

						<Input type="number" name="tip" bind:value={$form.products[i].tip} />
						{#if $errors.products?.[i]?.tip}
							<p class={errorsStyle}>{$errors.products[i].tip}</p>
						{/if}
					</div>

					<Button
						type="button"
						variant="outline"
						title="Remove this product from list"
						onclick={() => {
    const originalIndex = $form.products.length - 1 - i;
    $form.products.splice(originalIndex, 1);
    $form.products = $form.products;
}}
					>
						<X class="h-8 w-8" />
					</Button>
				</div>
			{/each}

			{#if $form.services.length}
				<h2>Services</h2>
			{/if}

			{#each [...$form.services].reverse() as _, i}
				<div class={singleContainer} transition:fly={{ x: -200, duration: 200 }}>
					{$form.services.length - (i)}
					<div class={arrParts}>
						<Label for="staff">Service Provider</Label>

						<ComboboxComp
							items={data.staffes}
							required={true}
							name="staff"
							bind:value={$form.services[i].staff}
						/>
						{#if $errors.services?.[i]?.staff}
							<p class={errorsStyle}>{$errors.services[i].staff}</p>
						{/if}
					</div>
					<div class={arrParts}>
						<Label for="service">Service</Label>

						<ComboboxComp
							items={data.services}
							required={true}
							name="service"
							bind:value={$form.services[i].service}
						/>

						{#if $errors.services?.[i]?.service}
							<p class={errorsStyle}>{$errors.services[i].service}</p>
						{/if}
					</div>
					<div class={arrParts}>
						<Label for="serviceTip">Tip</Label>

						<Input type="number" name="tip" bind:value={$form.services[i].serviceTip} />

						{#if $errors.services?.[i]?.serviceTip}
							<p class={errorsStyle}>{$errors.services[i].serviceTip}</p>
						{/if}
					</div>

					<Button
						type="button"
						variant="outline"
						title="Remove this service from list"
						onclick={() => {
    const originalIndex = $form.services.length - 1 - i;
    $form.services.splice(originalIndex, 1);
    $form.services = $form.services;
}}
					>
						<X class="h-8 w-8" />
					</Button>
				</div>
			{/each}
		</div>

		<div class="mt-8 mb-2 flex items-center justify-between">
			<h3 class="text-lg font-medium text-slate-700 dark:text-slate-100">Transaction summary</h3>
			<span class="text-sm text-slate-500 dark:text-slate-400"
				>{$form.products.length} products · {$form.services.length} services</span
			>
		</div>

		<div class="grid grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-300">
			<div class="flex flex-col">
				<span class="text-xs tracking-wide text-slate-400 uppercase">Products</span>
				<span class="mt-1 text-base font-semibold text-slate-800 dark:text-slate-50"
					>ETB
					{$form.productAmount ? Number($form.productAmount).toFixed(2) : '0.00'}
					<input type="hidden" bind:value={$form.productAmount} name="productAmount" />
				</span>
			</div>

			<div class="flex flex-col">
				<span class="text-xs tracking-wide text-slate-400 uppercase">Services</span>
				<span class="mt-1 text-base font-semibold text-slate-800 dark:text-slate-50"
					>ETB
					{$form.serviceAmount ? Number($form.serviceAmount).toFixed(2) : '0.00'}
					<input type="hidden" bind:value={$form.serviceAmount} name="serviceAmount" />
				</span>
			</div>
		</div>

		{#if $form.products.length > 0 || $form.services.length > 0}
			<div class="flex flex-col gap-4">
				<div class={arrParts}>
					<Label for="generalTip">General Tip</Label>

					<Input type="number" name="generalTip" bind:value={$form.generalTip} />

					{#if $errors.generalTip}
						<p class={errorsStyle}>{$errors.generalTip}</p>
					{/if}
				</div>

				{@render combo('paymentMethod', data.allMethods)}
					{@render combo('customer', data.customers)}


				<FileUpload name="receipt" {form} {errors} />
			</div>
		{/if}

		<div
			class="mt-4 flex items-baseline justify-between border-t border-slate-100 pt-3 dark:border-slate-700"
		>
			<span class="text-lg text-gray-900 dark:text-white">Grand Total</span>
			<span class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400"
				>ETB
				{$form.total ? Number($form.total).toFixed(2) : '0.00'}
				<input type="hidden" bind:value={$form.total} name="total" />
			</span>
		</div>

		{#if $errors._errors}
			<p class={errorsStyle}>{$errors._errors}</p>
		{/if}

			<Errors allErrors={$allErrors} />

		<div class="mt-3 flex lg:flex-row flex-col gap-2">
			<Button type="submit" class="w-full lg:w-auto">
				{#if $delayed}
					<LoadingBtn name="Adding Sale" />
				{:else}
					<Plus />
					Add Sale
				{/if}</Button
			>
			<Button
				variant="outline"
				type="reset"
				onclick={() => {
					$form.products.length = 0;
					$form.services.length = 0;
				}}
			>
				<BrushCleaning />

				Reset</Button
			>
		</div>
	</div>
</form>
