<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		name?: string;
		checked?: boolean;
		disabled?: boolean;
		class?: string;
		onchange?: (checked: boolean) => void;
	}

	let {
		name,
		checked = $bindable(false),
		disabled = false,
		class: className,
		onchange
	}: Props = $props();

	function handleChange(event: Event) {
		const target = event.target as HTMLInputElement;
		checked = target.checked;
		if (onchange) {
			onchange(checked);
		}
	}
</script>

<input
	type="checkbox"
	{name}
	bind:checked
	{disabled}
	onchange={handleChange}
	class={cn(
		'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
		className
	)}
/>
