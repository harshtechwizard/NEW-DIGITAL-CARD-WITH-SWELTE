<script lang="ts">
	/**
	 * CustomSection Component
	 * Displays a custom rich content section on the business card
	 */

	interface Props {
		title: string;
		content: string;
		class?: string;
	}

	let { title, content, class: className = '' }: Props = $props();
</script>

<div class="custom-section {className}">
	{#if title}
		<h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 text-center">
			{title}
		</h2>
	{/if}

	<div class="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-lg prose-img:shadow-md">
		{@html content}
	</div>
</div>

<style>
	.custom-section :global(iframe) {
		max-width: 100%;
		aspect-ratio: 16 / 9;
		border-radius: 12px;
		box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
	}

	.custom-section :global(img) {
		max-width: 100%;
		height: auto;
	}

	.custom-section :global(ul),
	.custom-section :global(ol) {
		margin-left: 1.5rem;
	}

	.custom-section :global(blockquote) {
		border-left: 4px solid var(--primary);
		padding-left: 1rem;
		font-style: italic;
		color: var(--muted-foreground);
	}

	.custom-section :global(a) {
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.custom-section :global(code) {
		background: var(--muted);
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}
</style>
