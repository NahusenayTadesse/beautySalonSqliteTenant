<script>
	import AdminNavCard from '$lib/components/AdminCard.svelte';

	let users = [
		{ name: 'Users', href: '/dashboard/users' },
		{ name: 'Roles', href: '/dashboard/admin-panel/roles' },
		{ name: 'Payment Methods', href: '/dashboard/admin-panel/payment-methods' }
	];
</script>

<svele:head>
	<title>Admin Panel</title>
</svele:head>

<div class="min-h-dvh w-full text-foreground transition-colors duration-300">
	<!-- Header -->

	<!-- Main Content -->
	<main class="mx-auto max-w-7xl px-6 py-12">
		<!-- Hero Section -->
		<div class="mb-16 flex flex-col gap-4">
			<h2 class="text-4xl font-bold tracking-tight">Welcome to Admin Dashboard</h2>
			<p class="max-w-2xl text-lg text-muted-foreground">
				Manage locations, organizational structure, and user access. Select a category below to get
				started.
			</p>
		</div>

		<!-- Navigation Cards Grid -->
		<div class="grid gap-8 md:grid-cols-2">
			<AdminNavCard
				title="Organization"
				description="Configure departments and payment methods"
				icon="Building2"
				items={users}
				accentColor="from-blue-500/15 to-blue-500/5"
			/>
		</div>
	</main>

	<!-- Footer -->
</div>
