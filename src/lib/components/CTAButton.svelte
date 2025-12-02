<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	
	interface Props {
		href: string;
		variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
		size?: 'default' | 'sm' | 'lg' | 'icon';
		class?: string;
		children: any;
	}
	
	let { 
		href, 
		variant = 'default', 
		size = 'lg',
		class: className = '',
		children
	}: Props = $props();
</script>

<Button 
	{href}
	{variant}
	{size}
	class="font-semibold {className}"
>
	{@render children()}
</Button>
