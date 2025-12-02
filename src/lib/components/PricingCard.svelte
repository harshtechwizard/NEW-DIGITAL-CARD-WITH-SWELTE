<script lang="ts">
	import { Card, CardContent, CardDescription, CardTitle } from '$lib/components/ui';
	import Button from '$lib/components/ui/Button.svelte';
	
	interface Props {
		name: string;
		price: string;
		description: string;
		features: string[];
		highlighted?: boolean;
		ctaText?: string;
		ctaHref?: string;
	}
	
	let { 
		name, 
		price, 
		description, 
		features, 
		highlighted = false,
		ctaText = 'Get Started',
		ctaHref = '/signup'
	}: Props = $props();
</script>

<Card class="h-full {highlighted ? 'border-primary shadow-lg' : ''}">
	<CardContent class="pt-6">
		{#if highlighted}
			<div class="text-xs font-semibold text-primary mb-2 uppercase tracking-wide">Most Popular</div>
		{/if}
		<CardTitle class="mb-2">{name}</CardTitle>
		<div class="mb-4">
			<span class="text-4xl font-bold">{price}</span>
			{#if price !== 'Free'}
				<span class="text-muted-foreground">/month</span>
			{/if}
		</div>
		<CardDescription class="mb-6">{description}</CardDescription>
		
		<ul class="space-y-3 mb-6">
			{#each features as feature}
				<li class="flex items-start gap-2">
					<svg class="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
					</svg>
					<span class="text-sm">{feature}</span>
				</li>
			{/each}
		</ul>
		
		<Button 
			href={ctaHref}
			variant={highlighted ? 'default' : 'outline'}
			class="w-full"
		>
			{ctaText}
		</Button>
	</CardContent>
</Card>
