<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		message?: string;
		class?: string;
	}

	let { message, class: className }: Props = $props();
</script>

{#if message}
	<div
		class={cn(
			'flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive',
			className
		)}
		role="alert"
	>
		<svg
			class="h-4 w-4 flex-shrink-0"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
		<span>{message}</span>
	</div>
{/if}
