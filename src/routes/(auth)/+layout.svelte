<script lang="ts">
	let { children } = $props();
</script>

<div class="min-h-screen flex items-center justify-center bg-background p-4">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-foreground">Digital Card Studio</h1>
			<p class="text-muted-foreground mt-2">Create and share your digital business cards</p>
		</div>
		
		{@render children()}
	</div>
</div>
