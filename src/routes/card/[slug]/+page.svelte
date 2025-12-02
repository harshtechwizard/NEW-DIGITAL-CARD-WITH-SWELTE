<script lang="ts">
	import { page } from '$app/stores';
	import BusinessCard from '$lib/components/BusinessCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { PageData } from './$types';

	/**
	 * Public card page component
	 * 
	 * This page displays a business card publicly with:
	 * - Full card information based on template configuration
	 * - Social media links
	 * - "Save Contact" button (vCard download)
	 * - "Share" button with QR code
	 * - Fully responsive design
	 * - SEO optimized with Open Graph and structured data
	 * 
	 * Requirements: 1.1, 5.1, 5.2
	 */

	let { data }: { data: PageData } = $props();

	let showQRCode = $state(false);
	let showShareMenu = $state(false);
	let copySuccess = $state(false);

	const cardUrl = $derived(`${$page.url.origin}/card/${data.card.slug}`);

	/**
	 * Download vCard for contact import
	 */
	function downloadVCard() {
		window.location.href = `/api/vcard?slug=${data.card.slug}`;
	}

	/**
	 * Toggle QR code display
	 */
	function toggleQRCode() {
		showQRCode = !showQRCode;
		if (showQRCode) {
			showShareMenu = false;
		}
	}

	/**
	 * Toggle share menu
	 */
	function toggleShareMenu() {
		showShareMenu = !showShareMenu;
		if (showShareMenu) {
			showQRCode = false;
		}
	}

	/**
	 * Copy card URL to clipboard
	 */
	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(cardUrl);
			copySuccess = true;
			setTimeout(() => {
				copySuccess = false;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}

	/**
	 * Share via Web Share API (mobile)
	 */
	async function shareNative() {
		if (navigator.share) {
			try {
				await navigator.share({
					title: data.ogData.title,
					text: data.ogData.description,
					url: cardUrl
				});
			} catch (err) {
				console.error('Share failed:', err);
			}
		}
	}

	/**
	 * Share on social media platforms
	 */
	function shareOnPlatform(platform: 'twitter' | 'linkedin' | 'facebook' | 'whatsapp') {
		const encodedUrl = encodeURIComponent(cardUrl);
		const encodedText = encodeURIComponent(data.ogData.title);

		const urls = {
			twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
			linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
			facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
			whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`
		};

		window.open(urls[platform], '_blank', 'width=600,height=400');
	}
</script>

<!-- SEO Meta Tags -->
<svelte:head>
	<title>{data.ogData.title}</title>
	<meta name="description" content={data.ogData.description} />
	
	<!-- Canonical URL -->
	<link rel="canonical" href={data.ogData.url} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={data.ogData.type} />
	<meta property="og:url" content={data.ogData.url} />
	<meta property="og:title" content={data.ogData.title} />
	<meta property="og:description" content={data.ogData.description} />
	<meta property="og:image" content={data.ogData.image} />
	<meta property="og:image:alt" content={`Profile photo of ${data.ogData.title}`} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:site_name" content="Digital Card Studio" />
	<meta property="og:locale" content="en_US" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={data.ogData.url} />
	<meta name="twitter:title" content={data.ogData.title} />
	<meta name="twitter:description" content={data.ogData.description} />
	<meta name="twitter:image" content={data.ogData.image} />
	<meta name="twitter:image:alt" content={`Profile photo of ${data.ogData.title}`} />

	<!-- Additional SEO Meta Tags -->
	<meta name="robots" content="index, follow" />
	<meta name="author" content={data.ogData.title} />

	<!-- Structured Data (JSON-LD) -->
	{@html `<script type="application/ld+json">${JSON.stringify(data.structuredData)}</script>`}
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
	<div class="max-w-4xl mx-auto">
		<!-- Business Card Display -->
		<div class="mb-8">
			<BusinessCard
				personalInfo={data.card.personal_info}
				professionalInfo={data.card.professional_info}
				education={data.card.education}
				awards={data.card.awards}
				productsServices={data.card.products_services}
				photoGallery={data.card.photo_gallery}
				customSections={data.card.custom_sections || []}
				fieldsConfig={data.card.fields_config}
				designConfig={data.card.design_config}
				templateType={data.card.template_type}
			/>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
			<!-- Save Contact Button -->
			<Button
				variant="default"
				size="lg"
				class="w-full sm:w-auto min-w-[200px]"
				onclick={downloadVCard}
			>
				{#snippet children()}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="w-5 h-5 mr-2"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
					Save Contact
				{/snippet}
			</Button>

			<!-- QR Code Button -->
			<Button
				variant="outline"
				size="lg"
				class="w-full sm:w-auto min-w-[200px]"
				onclick={toggleQRCode}
			>
				{#snippet children()}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="w-5 h-5 mr-2"
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
					{showQRCode ? 'Hide QR Code' : 'Show QR Code'}
				{/snippet}
			</Button>

			<!-- Share Button -->
			<Button
				variant="outline"
				size="lg"
				class="w-full sm:w-auto min-w-[200px]"
				onclick={toggleShareMenu}
			>
				{#snippet children()}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="w-5 h-5 mr-2"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"
						/>
					</svg>
					Share
				{/snippet}
			</Button>
		</div>

		<!-- QR Code Display -->
		{#if showQRCode}
			<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-300">
				<h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">
					Scan QR Code
				</h3>
				<p class="text-sm text-slate-600 dark:text-slate-400 mb-6">
					Scan this code with your phone to open this card
				</p>
				<div class="inline-block p-4 bg-white rounded-xl">
					<img
						src="/api/qr?slug={data.card.slug}&format=png"
						alt="QR Code for {data.ogData.title}"
						class="w-64 h-64 mx-auto"
					/>
				</div>
				<div class="mt-6 flex gap-3 justify-center">
					<Button
						variant="outline"
						size="sm"
						onclick={() => window.open(`/api/qr?slug=${data.card.slug}&format=png`, '_blank')}
					>
						{#snippet children()}
							Download PNG
						{/snippet}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onclick={() => window.open(`/api/qr?slug=${data.card.slug}&format=svg`, '_blank')}
					>
						{#snippet children()}
							Download SVG
						{/snippet}
					</Button>
				</div>
			</div>
		{/if}

		<!-- Share Menu -->
		{#if showShareMenu}
			<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
				<h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-4 text-center">
					Share this card
				</h3>

				<!-- Copy Link -->
				<div class="mb-6">
					<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
						Card URL
					</label>
					<div class="flex gap-2">
						<input
							type="text"
							readonly
							value={cardUrl}
							class="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
						/>
						<Button
							variant={copySuccess ? 'default' : 'outline'}
							onclick={copyToClipboard}
						>
							{#snippet children()}
								{#if copySuccess}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="w-5 h-5"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fill-rule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								{:else}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="w-5 h-5"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
										<path
											d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"
										/>
									</svg>
								{/if}
							{/snippet}
						</Button>
					</div>
				</div>

				<!-- Native Share (Mobile) -->
				{#if typeof navigator !== 'undefined' && navigator.share}
					<Button
						variant="outline"
						class="w-full mb-4"
						onclick={shareNative}
					>
						{#snippet children()}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="w-5 h-5 mr-2"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"
								/>
							</svg>
							Share via...
						{/snippet}
					</Button>
				{/if}

				<!-- Social Media Share Buttons -->
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
					<Button
						variant="outline"
						class="flex flex-col items-center gap-2 h-auto py-4"
						onclick={() => shareOnPlatform('twitter')}
					>
						{#snippet children()}
							<svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
								/>
							</svg>
							<span class="text-xs">Twitter</span>
						{/snippet}
					</Button>

					<Button
						variant="outline"
						class="flex flex-col items-center gap-2 h-auto py-4"
						onclick={() => shareOnPlatform('linkedin')}
					>
						{#snippet children()}
							<svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
								/>
							</svg>
							<span class="text-xs">LinkedIn</span>
						{/snippet}
					</Button>

					<Button
						variant="outline"
						class="flex flex-col items-center gap-2 h-auto py-4"
						onclick={() => shareOnPlatform('facebook')}
					>
						{#snippet children()}
							<svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
								/>
							</svg>
							<span class="text-xs">Facebook</span>
						{/snippet}
					</Button>

					<Button
						variant="outline"
						class="flex flex-col items-center gap-2 h-auto py-4"
						onclick={() => shareOnPlatform('whatsapp')}
					>
						{#snippet children()}
							<svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
								/>
							</svg>
							<span class="text-xs">WhatsApp</span>
						{/snippet}
					</Button>
				</div>
			</div>
		{/if}

		<!-- Footer -->
		<div class="text-center text-sm text-slate-500 dark:text-slate-400 mt-12">
			<p>
				Powered by <a href="/" class="font-medium hover:text-primary transition">Digital Card Studio</a>
			</p>
			<p class="mt-2">
				<a href="/signup" class="hover:text-primary transition">Create your own digital business card</a>
			</p>
		</div>
	</div>
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slide-in-from-top-4 {
		from {
			transform: translateY(-1rem);
		}
		to {
			transform: translateY(0);
		}
	}

	.animate-in {
		animation: fade-in 0.3s ease-out, slide-in-from-top-4 0.3s ease-out;
	}
</style>
