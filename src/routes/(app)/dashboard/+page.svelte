<script lang="ts">
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
</script>

<div class="max-w-4xl mx-auto">
	<h1 class="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
	<p class="text-muted-foreground mb-8">Welcome back, {data.user?.email}!</p>
	
	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		<a 
			href="/profile" 
			class="p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-shadow"
		>
			<h2 class="text-xl font-semibold mb-2">Profile</h2>
			<p class="text-sm text-muted-foreground">
				Manage your personal and professional information
			</p>
		</a>
		
		<a 
			href="/cards" 
			class="p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-shadow"
		>
			<h2 class="text-xl font-semibold mb-2">My Cards</h2>
			<p class="text-sm text-muted-foreground">
				Create and manage your digital business cards
			</p>
		</a>
		
		<a 
			href="/analytics" 
			class="p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-shadow"
		>
			<h2 class="text-xl font-semibold mb-2">Analytics</h2>
			<p class="text-sm text-muted-foreground">
				View engagement metrics and visitor data
			</p>
		</a>
	</div>
</div>
