<script lang="ts">
	import { themeStore } from '$lib/stores/theme.svelte';
</script>

<button
	onclick={() => themeStore.toggle()}
	class="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-accent transition-colors"
	aria-label="Toggle theme"
>
	{#if themeStore.current === 'light'}
		🌙 Dark Mode
	{:else}
		☀️ Light Mode
	{/if}
</button>
