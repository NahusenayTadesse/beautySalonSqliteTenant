<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import { Plus } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	// import { zod4Client } from "sveltekit-superforms/adapters";
	import type { AddCustomerSchema } from '$lib/ZodSchema';
	// import { createRoleSchema } from "$lib/ZodSchema";
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';


	let {
		data,
		onCustomerAdded,
		action = '/dashboard/cusotmers?/addCustomer'
	}: { data: SuperValidated<Infer<AddCustomerSchema>>; action: string, onCustomerAdded?: (id: number) => void } = $props();

	const { form, errors, enhance, delayed, message } = superForm(data, {
	onUpdated({ form }) {
            if ($message?.type === 'success' && onCustomerAdded) {
                // Pass the ID back to the main Sales page
                onCustomerAdded($message.id);
            }
        }

	});

	import { toast } from 'svelte-sonner';
	$effect(() => {
		if ($message) {
			if ($message.type === 'error') {
				toast.error($message.text);
			} else {
				toast.success($message.text);

				if(onCustomerAdded){
					onCustomerAdded($message.id);
				}
			}
		}
	});
</script>

{#snippet fe(
	label = '',
	name = '',
	type = '',
	placeholder = '',
	required = false,
	min = '',
	max = ''
)}
	<div class="flex w-full flex-col justify-start gap-2">
		<Label for={name}>{label}</Label>
		<Input
			{type}
			{name}
			{placeholder}
			{required}
			{min}
			{max}
			bind:value={$form[name]}
			aria-invalid={$errors[name] ? 'true' : undefined}
		/>
		{#if $errors[name]}
			<span class="text-red-500">{$errors[name]}</span>
		{/if}
	</div>
{/snippet}


<form {action} use:enhance method="post" id="edit" class="flex w-full flex-col gap-4 p-4">
	{@render fe('Customer Name', 'name', 'text', 'Edit Customer Name', true)}
	{@render fe('Customer Phone', 'phone', 'tel', 'Edit Customer Phone', true)}
	<Button type="submit" class="mt-4" form="edit">
		{#if $delayed}
			<LoadingBtn name="Adding Customer" />
		{:else}
			<Plus class="h-4 w-4" />

			Add Customer
		{/if}
	</Button>
</form>
