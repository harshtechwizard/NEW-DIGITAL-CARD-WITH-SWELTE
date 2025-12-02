<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import CardHeader from '$lib/components/ui/CardHeader.svelte';
	import CardTitle from '$lib/components/ui/CardTitle.svelte';
	import CardDescription from '$lib/components/ui/CardDescription.svelte';
	import CardContent from '$lib/components/ui/CardContent.svelte';

	interface Props {
		slug: string;
		cardName?: string;
	}

	let { slug, cardName = 'Business Card' }: Props = $props();

	let isLoading = $state(false);
	let error = $state('');
	let nfcPayload = $state<any>(null);
	let showPayload = $state(false);

	/**
	 * Fetch NFC payload from API
	 */
	async function fetchNFCPayload() {
		isLoading = true;
		error = '';

		try {
			const response = await fetch(`/api/nfc?slug=${encodeURIComponent(slug)}`);

			if (!response.ok) {
				const result = await response.json();
				error = result.error || 'Failed to generate NFC payload';
				return;
			}

			nfcPayload = await response.json();
			showPayload = true;
		} catch (err) {
			console.error('NFC fetch error:', err);
			error = 'Failed to fetch NFC payload';
		} finally {
			isLoading = false;
		}
	}

	/**
	 * Copy NFC payload to clipboard
	 */
	async function copyPayload() {
		if (!nfcPayload) return;

		try {
			await navigator.clipboard.writeText(JSON.stringify(nfcPayload, null, 2));
			// Show success feedback (could be enhanced with a toast notification)
			const button = document.getElementById('copy-button');
			if (button) {
				const originalText = button.textContent;
				button.textContent = 'Copied!';
				setTimeout(() => {
					button.textContent = originalText;
				}, 2000);
			}
		} catch (err) {
			console.error('Copy error:', err);
			error = 'Failed to copy to clipboard';
		}
	}
</script>

<Card>
	<CardHeader>
		<CardTitle>
			{#snippet children()}NFC Tag{/snippet}
		</CardTitle>
		<CardDescription>
			{#snippet children()}Write your card to an NFC tag for instant sharing{/snippet}
		</CardDescription>
	</CardHeader>
	<CardContent>
		<div class="space-y-4">
			<!-- NFC Icon -->
			<div class="flex justify-center p-6 bg-muted rounded-lg">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="w-24 h-24 text-primary"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
					/>
				</svg>
			</div>

			{#if error}
				<div class="text-sm text-destructive text-center p-3 bg-destructive/10 rounded-md">
					{error}
				</div>
			{/if}

			<!-- Instructions -->
			<div class="space-y-3 text-sm text-muted-foreground">
				<h4 class="font-semibold text-foreground">How to use NFC tags:</h4>
				<ol class="list-decimal list-inside space-y-2 ml-2">
					<li>Get the NFC payload by clicking the button below</li>
					<li>Use an NFC writing app on your smartphone</li>
					<li>Copy the payload data to the app</li>
					<li>Write the data to a blank NFC tag</li>
					<li>Share your tag - anyone can tap it to view your card!</li>
				</ol>
			</div>

			<!-- Get Payload Button -->
			{#if !showPayload}
				<Button onclick={fetchNFCPayload} disabled={isLoading} class="w-full">
					{#snippet children()}
						{#if isLoading}
							<svg
								class="animate-spin -ml-1 mr-3 h-5 w-5"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Loading...
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5 mr-2"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
									clip-rule="evenodd"
								/>
							</svg>
							Get NFC Payload
						{/if}
					{/snippet}
				</Button>
			{/if}

			<!-- NFC Payload Display -->
			{#if showPayload && nfcPayload}
				<div class="space-y-3">
					<div class="bg-muted p-4 rounded-md border border-border">
						<pre
							class="text-xs overflow-x-auto">{JSON.stringify(nfcPayload, null, 2)}</pre>
					</div>

					<Button id="copy-button" onclick={copyPayload} variant="outline" class="w-full">
						{#snippet children()}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4 mr-2"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
								<path
									d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"
								/>
							</svg>
							Copy Payload
						{/snippet}
					</Button>

					<Button onclick={() => (showPayload = false)} variant="ghost" class="w-full">
						{#snippet children()}Hide Payload{/snippet}
					</Button>
				</div>
			{/if}

			<!-- Recommended Apps -->
			<div class="border-t border-border pt-4 space-y-3">
				<h4 class="font-semibold text-sm text-foreground">Recommended NFC Writing Apps:</h4>
				<div class="grid grid-cols-2 gap-3">
					<!-- iOS Apps -->
					<div class="space-y-2">
						<p class="text-xs font-medium text-muted-foreground">iOS (iPhone 7+)</p>
						<a
							href="https://apps.apple.com/app/nfc-tools/id1252962749"
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-2 text-sm text-primary hover:underline"
						>
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
							NFC Tools
						</a>
					</div>

					<!-- Android Apps -->
					<div class="space-y-2">
						<p class="text-xs font-medium text-muted-foreground">Android</p>
						<a
							href="https://play.google.com/store/apps/details?id=com.wakdev.wdnfc"
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-2 text-sm text-primary hover:underline"
						>
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
							NFC Tools
						</a>
					</div>
				</div>
			</div>

			<p class="text-xs text-muted-foreground text-center">
				NFC tags are reusable and work with most modern smartphones
			</p>
		</div>
	</CardContent>
</Card>
