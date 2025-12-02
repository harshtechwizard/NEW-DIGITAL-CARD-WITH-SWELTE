<script lang="ts">
	import { cn } from '$lib/utils';

	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		name: string;
		value?: string;
		options: Option[];
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		error?: string;
		label?: string;
		class?: string;
	}

	let {
		name,
		value = $bindable(''),
		options,
		placeholder,
		required = false,
		disabled = false,
		error,
		label,
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
	<select
		{name}
		id={name}
		bind:value
		{required}
		{disabled}
		class={cn(
			'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
			error && 'border-destructive focus-visible:ring-destructive',
			className
		)}
	>
		{#if placeholder}
			<option value="" disabled selected={!value}>{placeholder}</option>
		{/if}
		{#each options as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
	{#if error}
		<p class="text-sm text-destructive">{error}</p>
	{/if}
</div>
