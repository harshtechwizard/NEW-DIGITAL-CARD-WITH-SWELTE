<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui';
	
	interface Props {
		quote: string;
		author: string;
		role: string;
		avatar?: string;
	}
	
	let { quote, author, role, avatar }: Props = $props();
</script>

<Card class="h-full">
	<CardContent class="pt-6">
		<div class="mb-4">
			<svg class="w-8 h-8 text-primary opacity-50" fill="currentColor" viewBox="0 0 24 24">
				<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
			</svg>
		</div>
		<p class="text-muted-foreground mb-4 italic">"{quote}"</p>
		<div class="flex items-center gap-3">
			{#if avatar}
				<img src={avatar} alt={author} class="w-10 h-10 rounded-full object-cover" />
			{:else}
				<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
					<span class="text-primary font-semibold">{author.charAt(0)}</span>
				</div>
			{/if}
			<div>
				<p class="font-semibold text-sm">{author}</p>
				<p class="text-xs text-muted-foreground">{role}</p>
			</div>
		</div>
	</CardContent>
</Card>
