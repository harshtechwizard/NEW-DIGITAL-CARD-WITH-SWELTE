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
		showTitle?: boolean;
	}

	let { slug, cardName = 'Business Card', showTitle = true }: Props = $props();

	let qrFormat = $state<'png' | 'svg'>('png');
	let isLoading = $state(false);
	let error = $state('');

	const qrUrl = $derived(`/api/qr?slug=${encodeURIComponent(slug)}&format=${qrFormat}`);

	/**
	 * Download QR code
	 */
	async function downloadQR(format: 'png' | 'svg') {
		isLoading = true;
		error = '';

		try {
			const response = await fetch(`/api/qr?slug=${encodeURIComponent(slug)}&format=${format}`);

			if (!response.ok) {
				const result = await response.json();
				error = result.error || 'Failed to generate QR code';
				return;
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${slug}-qr.${format}`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (err) {
			console.error('Download error:', err);
			error = 'Failed to download QR code';
		} finally {
			isLoading = false;
		}
	}
</script>

{#if showTitle}
	<Card>
		<CardHeader>
			<CardTitle>
				{#snippet children()}QR Code{/snippet}
			</CardTitle>
			<CardDescription>
				{#snippet children()}Share your card with a QR code{/snippet}
			</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<!-- QR Code Preview -->
				<div class="flex justify-center p-4 bg-white rounded-lg border border-border">
					<img
						src={qrUrl}
						alt="QR Code for {cardName}"
						class="w-64 h-64"
						onerror={() => (error = 'Failed to load QR code')}
					/>
				</div>

				{#if error}
					<div class="text-sm text-destructive text-center">
						{error}
					</div>
				{/if}

				<!-- Format Selector -->
				<div class="flex items-center justify-center gap-2">
					<label class="text-sm text-muted-foreground">Format:</label>
					<div class="flex gap-2">
						<button
							onclick={() => (qrFormat = 'png')}
							class="px-3 py-1 text-sm rounded-md transition-colors {qrFormat === 'png'
								? 'bg-primary text-primary-foreground'
								: 'bg-muted text-muted-foreground hover:bg-muted/80'}"
						>
							PNG
						</button>
						<button
							onclick={() => (qrFormat = 'svg')}
							class="px-3 py-1 text-sm rounded-md transition-colors {qrFormat === 'svg'
								? 'bg-primary text-primary-foreground'
								: 'bg-muted text-muted-foreground hover:bg-muted/80'}"
						>
							SVG
						</button>
					</div>
				</div>

				<!-- Download Buttons -->
				<div class="flex gap-2">
					<Button
						onclick={() => downloadQR('png')}
						variant="outline"
						disabled={isLoading}
						class="flex-1"
					>
						{#snippet children()}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4 mr-2"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
									clip-rule="evenodd"
								/>
							</svg>
							Download PNG
						{/snippet}
					</Button>
					<Button
						onclick={() => downloadQR('svg')}
						variant="outline"
						disabled={isLoading}
						class="flex-1"
					>
						{#snippet children()}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4 mr-2"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
									clip-rule="evenodd"
								/>
							</svg>
							Download SVG
						{/snippet}
					</Button>
				</div>

				<p class="text-xs text-muted-foreground text-center">
					Scan this QR code to view your digital business card
				</p>
			</div>
		</CardContent>
	</Card>
{:else}
	<!-- Compact version for card list -->
	<div class="space-y-2">
		<div class="flex justify-center p-2 bg-white rounded border border-border">
			<img
				src={qrUrl}
				alt="QR Code for {cardName}"
				class="w-24 h-24"
				onerror={() => (error = 'Failed to load QR code')}
			/>
		</div>
		{#if error}
			<div class="text-xs text-destructive text-center">
				{error}
			</div>
		{/if}
	</div>
{/if}
