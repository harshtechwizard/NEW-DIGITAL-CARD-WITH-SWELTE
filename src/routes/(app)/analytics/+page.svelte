<script lang="ts">
	/**
	 * Analytics Dashboard Page
	 * 
	 * Displays comprehensive analytics for user's business cards including:
	 * - Total views and unique visitors
	 * - Daily views chart
	 * - Views by card
	 * - Top referrers
	 * - Recent views table
	 * - Date range selector
	 * 
	 * Requirements: 4.2, 5.1
	 */

	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/Card.svelte';
	import CardHeader from '$lib/components/ui/CardHeader.svelte';
	import CardTitle from '$lib/components/ui/CardTitle.svelte';
	import CardDescription from '$lib/components/ui/CardDescription.svelte';
	import CardContent from '$lib/components/ui/CardContent.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import AnalyticsChart from '$lib/components/AnalyticsChart.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Date range options
	const dateRangeOptions = [
		{ value: 7, label: 'Last 7 days' },
		{ value: 30, label: 'Last 30 days' },
		{ value: 90, label: 'Last 90 days' },
		{ value: 365, label: 'Last year' }
	];

	// Handle date range change
	function changeDateRange(days: number) {
		goto(`/analytics?days=${days}`);
	}

	// Format date for display
	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	// Format referrer for display
	function formatReferrer(referrer: string | null): string {
		if (!referrer || referrer === 'Direct') return 'Direct';
		
		try {
			const url = new URL(referrer);
			return url.hostname;
		} catch {
			return referrer;
		}
	}

	// Truncate user agent for display
	function truncateUserAgent(userAgent: string | null): string {
		if (!userAgent) return 'Unknown';
		
		// Extract browser name from user agent
		if (userAgent.includes('Chrome')) return 'Chrome';
		if (userAgent.includes('Firefox')) return 'Firefox';
		if (userAgent.includes('Safari')) return 'Safari';
		if (userAgent.includes('Edge')) return 'Edge';
		
		return userAgent.length > 50 ? userAgent.substring(0, 50) + '...' : userAgent;
	}
</script>

<svelte:head>
	<title>Analytics - Digital Card Studio</title>
	<meta name="description" content="View analytics for your digital business cards" />
</svelte:head>

<div class="container mx-auto py-8 px-4 max-w-7xl">
	<div class="mb-8">
		<h1 class="text-3xl font-bold mb-2">Analytics Dashboard</h1>
		<p class="text-muted-foreground">
			Track views and engagement for your digital business cards
		</p>
	</div>

	{#if data.error}
		<Card class="mb-6">
			<CardContent class="pt-6">
				<div class="text-center text-destructive">
					<p class="font-medium">Error loading analytics</p>
					<p class="text-sm mt-1">{data.error}</p>
				</div>
			</CardContent>
		</Card>
	{/if}

	{#if data.cards.length === 0}
		<Card>
			<CardContent class="pt-6">
				<div class="text-center py-12">
					<h3 class="text-lg font-medium mb-2">No cards yet</h3>
					<p class="text-muted-foreground mb-6">
						Create your first business card to start tracking analytics
					</p>
					<Button href="/cards/new">
						{#snippet children()}
							Create Card
						{/snippet}
					</Button>
				</div>
			</CardContent>
		</Card>
	{:else}
		<!-- Date Range Selector -->
		<div class="flex flex-wrap gap-2 mb-6">
			{#each dateRangeOptions as option}
				<Button
					variant={data.selectedDays === option.value ? 'default' : 'outline'}
					onclick={() => changeDateRange(option.value)}
				>
					{#snippet children()}
						{option.label}
					{/snippet}
				</Button>
			{/each}
		</div>

		<!-- Summary Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			<!-- Total Views -->
			<Card>
				<CardHeader>
					<CardDescription>Total Views</CardDescription>
					<CardTitle class="text-3xl">{data.totalViews.toLocaleString()}</CardTitle>
				</CardHeader>
			</Card>

			<!-- Unique Visitors -->
			<Card>
				<CardHeader>
					<CardDescription>Unique Visitors</CardDescription>
					<CardTitle class="text-3xl">{data.uniqueVisitors.toLocaleString()}</CardTitle>
				</CardHeader>
			</Card>

			<!-- Total Cards -->
			<Card>
				<CardHeader>
					<CardDescription>Total Cards</CardDescription>
					<CardTitle class="text-3xl">{data.cards.length}</CardTitle>
				</CardHeader>
			</Card>

			<!-- Active Cards -->
			<Card>
				<CardHeader>
					<CardDescription>Active Cards</CardDescription>
					<CardTitle class="text-3xl">
						{data.cards.filter((c) => c.is_active).length}
					</CardTitle>
				</CardHeader>
			</Card>
		</div>

		<!-- Daily Views Chart -->
		<Card class="mb-8">
			<CardHeader>
				<CardTitle>Daily Views</CardTitle>
				<CardDescription>
					View trends over the last {data.selectedDays} days
				</CardDescription>
			</CardHeader>
			<CardContent>
				<AnalyticsChart data={data.dailyViews} height={300} />
			</CardContent>
		</Card>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
			<!-- Views by Card -->
			<Card>
				<CardHeader>
					<CardTitle>Views by Card</CardTitle>
					<CardDescription>Performance of each business card</CardDescription>
				</CardHeader>
				<CardContent>
					{#if data.cardViews.length === 0}
						<p class="text-muted-foreground text-sm text-center py-8">
							No views recorded yet
						</p>
					{:else}
						<div class="space-y-4">
							{#each data.cardViews as cardView}
								<div class="flex items-center justify-between">
									<div class="flex-1 min-w-0">
										<p class="font-medium truncate">{cardView.cardName}</p>
										<p class="text-sm text-muted-foreground">
											/{cardView.slug}
										</p>
									</div>
									<div class="text-right ml-4">
										<p class="font-semibold">{cardView.views}</p>
										<p class="text-xs text-muted-foreground">
											{cardView.uniqueVisitors} unique
										</p>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</CardContent>
			</Card>

			<!-- Top Referrers -->
			<Card>
				<CardHeader>
					<CardTitle>Top Referrers</CardTitle>
					<CardDescription>Where your visitors come from</CardDescription>
				</CardHeader>
				<CardContent>
					{#if data.topReferrers.length === 0}
						<p class="text-muted-foreground text-sm text-center py-8">
							No referrer data available
						</p>
					{:else}
						<div class="space-y-4">
							{#each data.topReferrers as referrer}
								<div class="flex items-center justify-between">
									<div class="flex-1 min-w-0">
										<p class="font-medium truncate">
											{formatReferrer(referrer.referrer)}
										</p>
									</div>
									<div class="text-right ml-4">
										<p class="font-semibold">{referrer.views}</p>
										<p class="text-xs text-muted-foreground">
											{Math.round((referrer.views / data.totalViews) * 100)}%
										</p>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>

		<!-- Recent Views Table -->
		<Card>
			<CardHeader>
				<CardTitle>Recent Views</CardTitle>
				<CardDescription>Latest visitors to your cards</CardDescription>
			</CardHeader>
			<CardContent>
				{#if data.recentViews.length === 0}
					<p class="text-muted-foreground text-sm text-center py-8">
						No recent views
					</p>
				{:else}
					<div class="overflow-x-auto">
						<table class="w-full">
							<thead>
								<tr class="border-b">
									<th class="text-left py-3 px-2 font-medium text-sm">Card</th>
									<th class="text-left py-3 px-2 font-medium text-sm">Time</th>
									<th class="text-left py-3 px-2 font-medium text-sm">Referrer</th>
									<th class="text-left py-3 px-2 font-medium text-sm">Browser</th>
								</tr>
							</thead>
							<tbody>
								{#each data.recentViews as view}
									<tr class="border-b last:border-0 hover:bg-muted/50">
										<td class="py-3 px-2 text-sm">{view.cardName}</td>
										<td class="py-3 px-2 text-sm text-muted-foreground">
											{formatDate(view.viewedAt)}
										</td>
										<td class="py-3 px-2 text-sm text-muted-foreground">
											{formatReferrer(view.referrer)}
										</td>
										<td class="py-3 px-2 text-sm text-muted-foreground">
											{truncateUserAgent(view.userAgent)}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</CardContent>
		</Card>
	{/if}
</div>

<style>
	table {
		border-collapse: collapse;
	}
</style>
