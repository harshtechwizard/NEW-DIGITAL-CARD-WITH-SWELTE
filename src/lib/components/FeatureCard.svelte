<script lang="ts">
	import { Card, CardContent, CardDescription, CardTitle } from '$lib/components/ui';
	
	interface Props {
		icon: string;
		title: string;
		description: string;
	}
	
	let { icon, title, description }: Props = $props();
</script>

<Card class="h-full hover:shadow-lg transition-shadow">
	<CardContent class="pt-6">
		<div class="text-4xl mb-4">{icon}</div>
		<CardTitle class="mb-2">{title}</CardTitle>
		<CardDescription>{description}</CardDescription>
	</CardContent>
</Card>
