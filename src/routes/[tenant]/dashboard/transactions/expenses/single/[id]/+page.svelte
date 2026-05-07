<script lang="ts">
	let { data } = $props();
	import SingleTable from '$lib/components/SingleTable.svelte';

	import { Button } from '$lib/components/ui/button/index.js';
	import { Download, Eye } from '@lucide/svelte';
	import SingleView from '$lib/components/SingleView.svelte';

	let singleTable = $derived([
		{ name: 'Date', value: data.singleTransaction?.date },
		{ name: 'Amount', value: 'ETB ' + data.singleTransaction?.amount },
		{ name: 'Type', value: data.singleTransaction?.type },
		{ name: 'Reason', value: data.singleTransaction?.reason },
		{ name: 'Payment Method', value: data.singleTransaction?.paymentMethods },
		{ name: 'Recieved By', value: data.singleTransaction?.recievedBy }
	]);
</script>

<svelte:head>
	<title>Expense Details</title>
</svelte:head>
<SingleView title="Expense Details">
	<div class="mt-4 flex w-full flex-row items-start justify-start pl-4">
		<div class="w-full p-4">
			<SingleTable {singleTable} />
			<div class="flex w-full flex-row justify-end gap-2">
				<Button href="/dashboard/files/{data.singleTransaction?.recieptLink}" target="_blank">
					<Eye />
					View Reciept
				</Button>
				<Button
					href="/dashboard/files/{data.singleTransaction.recieptLink}"
					download="Transaction Reciept"
				>
					<Download />
					Download Reciept
				</Button>
			</div>
		</div>
	</div></SingleView
>
