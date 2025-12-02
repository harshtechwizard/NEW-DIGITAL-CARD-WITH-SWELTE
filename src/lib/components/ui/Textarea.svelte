<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		name: string;
		value?: string;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		error?: string;
		label?: string;
		rows?: number;
		maxlength?: number;
		class?: string;
	}

	let {
		name,
		value = $bindable(''),
		placeholder,
		required = false,
		disabled = false,
		error,
		label,
		rows = 4,
		maxlength,
		class: className
	}: Props = $props();
</script>

<div class="space-y-2">
	{#if label}
		<label for={name} class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
			{label}
			{#if required}
				<span class="text-destructive">*</span>
			{/if}
		</label>
	{/if}
	<textarea
		{name}
		id={name}
		bind:value
		{placeholder}
		{required}
		{disabled}
		{rows}
		{maxlength}
		class={cn(
			'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
			error && 'border-destructive focus-visible:ring-destructive',
			className
		)}
	></textarea>
	{#if maxlength && value}
		<p class="text-xs text-muted-foreground text-right">
			{value.length}/{maxlength}
		</p>
	{/if}
	{#if error}
		<p class="text-sm text-destructive">{error}</p>
	{/if}
</div>
