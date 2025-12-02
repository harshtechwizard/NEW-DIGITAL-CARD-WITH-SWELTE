<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import QRCodeDisplay from '$lib/components/QRCodeDisplay.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let showQRForCard = $state<string | null>(null);

	/**
	 * Format date to readable string
	 */
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	/**
	 * Navigate to card edit page
	 */
	function editCard(cardId: string) {
		goto(`/cards/${cardId}`);
	}

	/**
	 * Navigate to card creation page
	 */
	function createNewCard() {
		goto('/cards/new');
	}

	/**
	 * Delete card
	 */
	async function deleteCard(cardId: string, cardName: string) {
		if (!confirm(`Are you sure you want to delete "${cardName}"? This action cannot be undone.`)) {
			return;
		}

		try {
			const response = await fetch('/api/cards', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id: cardId })
			});

			const result = await response.json();

			if (!response.ok) {
				alert(`Failed to delete card: ${result.error || 'Unknown error'}`);
				return;
			}

			// Success - reload the page to refresh the cards list
			window.location.reload();
		} catch (err) {
			console.error('Delete error:', err);
			alert('An unexpected error occurred while deleting the card');
		}
	}
</script>

<svelte:head>
	<title>My Cards - Digital Card Studio</title>
	<meta name="description" content="Manage your digital business cards" />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-7xl">
	<!-- Header -->
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold text-foreground">My Business Cards</h1>
			<p class="text-muted-foreground mt-2">
				Create and manage your digital business cards
			</p>
		</div>
		<Button onclick={createNewCard}>
			{#snippet children()}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
						clip-rule="evenodd"
					/>
				</svg>
				Create New Card
			{/snippet}
		</Button>
	</div>

	<!-- Error Message -->
	{#if data.error}
		<div class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-6">
			<p class="font-medium">Error</p>
			<p class="text-sm">{data.error}</p>
		</div>
	{/if}

	<!-- Cards Grid -->
	{#if data.cards && data.cards.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each data.cards as card (card.id)}
				<div
					class="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
				>
					<!-- Card Header -->
					<div class="flex items-start justify-between mb-4">
						<div class="flex-1">
							<h3 class="text-xl font-semibold text-foreground mb-1">
								{card.name}
							</h3>
							<p class="text-sm text-muted-foreground font-mono">
								/{card.slug}
							</p>
						</div>
						<!-- Status Badge -->
						<span
							class="px-2 py-1 text-xs font-medium rounded-full {card.is_active
								? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
								: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}"
						>
							{card.is_active ? 'Active' : 'Inactive'}
						</span>
					</div>

					<!-- Card Info -->
					<div class="space-y-2 mb-4">
						{#if card.template_type}
							<div class="flex items-center text-sm text-muted-foreground">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4 mr-2"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fill-rule="evenodd"
										d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z"
										clip-rule="evenodd"
									/>
								</svg>
								<span class="capitalize">{card.template_type.replace('-', ' ')}</span>
							</div>
						{/if}
						<div class="flex items-center text-sm text-muted-foreground">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4 mr-2"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
									clip-rule="evenodd"
								/>
							</svg>
							<span>Created {formatDate(card.created_at)}</span>
						</div>
						{#if card.is_default}
							<div class="flex items-center text-sm text-primary font-medium">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4 mr-2"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
									/>
								</svg>
								<span>Default Card</span>
							</div>
						{/if}
					</div>

					<!-- QR Code Section (Collapsible) -->
					{#if showQRForCard === card.id}
						<div class="pt-4 border-t border-border">
							<QRCodeDisplay slug={card.slug} cardName={card.name} showTitle={false} />
						</div>
					{/if}

					<!-- Action Buttons -->
					<div class="flex gap-2 pt-4 border-t border-border">
						<Button onclick={() => editCard(card.id)} variant="outline" class="flex-1">
							{#snippet children()}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
									/>
								</svg>
								Edit
							{/snippet}
						</Button>
						<Button
							onclick={() => window.open(`/card/${card.slug}`, '_blank')}
							variant="outline"
							class="flex-1"
						>
							{#snippet children()}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"
									/>
									<path
										d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"
									/>
								</svg>
								View
							{/snippet}
						</Button>
						<Button
							onclick={() => (showQRForCard = showQRForCard === card.id ? null : card.id)}
							variant="outline"
							class="flex-1"
							title="Show QR Code"
						>
							{#snippet children()}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fill-rule="evenodd"
										d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z"
										clip-rule="evenodd"
									/>
									<path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z" />
								</svg>
								QR
							{/snippet}
						</Button>
						<Button
							onclick={() => deleteCard(card.id, card.name)}
							variant="outline"
							class="text-destructive hover:bg-destructive hover:text-destructive-foreground"
						>
							{#snippet children()}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fill-rule="evenodd"
										d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
										clip-rule="evenodd"
									/>
								</svg>
							{/snippet}
						</Button>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<!-- Empty State -->
		<div class="text-center py-16">
			<div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-8 w-8 text-muted-foreground"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
					/>
				</svg>
			</div>
			<h2 class="text-2xl font-semibold text-foreground mb-2">No cards yet</h2>
			<p class="text-muted-foreground mb-6 max-w-md mx-auto">
				Get started by creating your first digital business card. Share it with anyone via a
				unique URL, QR code, or NFC tag.
			</p>
			<Button onclick={createNewCard}>
				{#snippet children()}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
							clip-rule="evenodd"
						/>
					</svg>
					Create Your First Card
				{/snippet}
			</Button>
		</div>
	{/if}
</div>

<style>
	/* Additional styles if needed */
</style>
