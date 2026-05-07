<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { BadgeCheck, Loader, OctagonMinus } from '@lucide/svelte';

	/* ---------- public prop ---------- */
	interface Props {
		status: string;
	}
	let { status }: Props = $props();

	/* ---------- lookup tables ---------- */
	const statusMeta = {
		/* confirmed / paid */
		confirmed: { icon: BadgeCheck, colour: 'bg-green-400' },
		paid: { icon: BadgeCheck, colour: 'bg-green-400' },

		/* cancelled / unpaid */
		cancelled: { icon: OctagonMinus, colour: 'bg-red-500' },
		unpaid: { icon: OctagonMinus, colour: 'bg-red-500' },

		/* pending */
		pending: { icon: Loader, colour: 'bg-yellow-500' },

		/* active */
		active: { icon: BadgeCheck, colour: 'bg-green-400' },
		inactive: { icon: OctagonMinus, colour: 'bg-red-500' },

		yes: { icon: BadgeCheck, colour: 'bg-green-400' },
		no: { icon: OctagonMinus, colour: 'bg-red-500' },

		unremovable: { icon: BadgeCheck, colour: 'bg-green-400' },
		removable: { icon: OctagonMinus, colour: 'bg-red-500' },

		/* fallback */
		unknown: { icon: Loader, colour: 'bg-gray-500' },

		terminated: { icon: OctagonMinus, colour: 'bg-red-500' },
		full_time: { icon: BadgeCheck, colour: 'bg-green-400' },
		on_leave: { icon: OctagonMinus, colour: 'bg-red-500' },
		probation: { icon: OctagonMinus, colour: 'bg-red-500' },
		contract: { icon: BadgeCheck, colour: 'bg-green-400' }
	} as const;

	/* ---------- derived ---------- */
	const key = String(status).trim().toLowerCase() as keyof typeof statusMeta;
	const { icon: Icon, colour } = statusMeta[key] ?? statusMeta.unknown;
</script>

<Badge variant="secondary" class="{colour} text-white">
	<Icon />
	{status
		.split('_')
		.map((w) => w[0].toUpperCase() + w.slice(1))
		.join(' ')}
</Badge>
