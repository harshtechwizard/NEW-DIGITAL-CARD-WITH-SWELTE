<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	
	let searchQuery = $state('');
	let selectedCategory = $state('all');
	
	const categories = [
		{ id: 'all', name: 'All Questions', icon: '📚' },
		{ id: 'getting-started', name: 'Getting Started', icon: '🚀' },
		{ id: 'features', name: 'Features', icon: '✨' },
		{ id: 'sharing', name: 'Sharing & QR Codes', icon: '📱' },
		{ id: 'analytics', name: 'Analytics', icon: '📊' },
		{ id: 'billing', name: 'Billing & Plans', icon: '💳' },
		{ id: 'privacy', name: 'Privacy & Security', icon: '🔒' },
		{ id: 'technical', name: 'Technical', icon: '⚙️' }
	];
	
	const faqs = [
		// Getting Started
		{
			category: 'getting-started',
			question: 'How do I create my first digital business card?',
			answer: 'Creating your first card is easy! Sign up for a free account, go to the dashboard, click "Create New Card", fill in your information, choose a template, and customize the design. Your card will be live instantly with a unique URL.'
		},
		{
			category: 'getting-started',
			question: 'Do I need to download an app?',
			answer: 'No! Digital Card Studio works entirely in your web browser. Recipients don\'t need an app either - they can view your card on any device with a web browser.'
		},
		{
			category: 'getting-started',
			question: 'How long does it take to set up?',
			answer: 'Most users complete their first card in under 5 minutes. You can start with basic information and add more details later.'
		},
		
		// Features
		{
			category: 'features',
			question: 'Can I have multiple business cards?',
			answer: 'Yes! You can create unlimited cards on all plans. This is perfect for having different cards for work, personal projects, events, or different roles.'
		},
		{
			category: 'features',
			question: 'What information can I include on my card?',
			answer: 'You can include: name, photo, job title, company, contact details (email, phone, WhatsApp), social media links, bio, website, address, products/services, photo gallery, education, and awards.'
		},
		{
			category: 'features',
			question: 'Can I customize the design of my card?',
			answer: 'Absolutely! Choose from pre-designed templates or customize colors, fonts, layout, and which fields to display. Premium plans offer even more customization options.'
		},
		{
			category: 'features',
			question: 'Can I add my company logo?',
			answer: 'Yes! You can upload your company logo, profile photo, product images, and create a photo gallery. All images are automatically optimized for fast loading.'
		},
		
		// Sharing & QR Codes
		{
			category: 'sharing',
			question: 'How do I share my digital business card?',
			answer: 'You can share your card via: direct link (URL), QR code (download as PNG or SVG), NFC tag, or social media. Each card has a unique, memorable URL like digitalcardstudio.com/card/your-name.'
		},
		{
			category: 'sharing',
			question: 'What is a QR code and how do I use it?',
			answer: 'A QR code is a scannable image that links to your card. Download your QR code from your card settings, then print it on materials, add it to email signatures, or display it at events. Anyone can scan it with their phone camera.'
		},
		{
			category: 'sharing',
			question: 'Can I use NFC tags?',
			answer: 'Yes! You can write your card URL to NFC tags (like stickers or cards). When someone taps their phone on the tag, your card opens instantly. We provide the NFC payload in your card settings.'
		},
		{
			category: 'sharing',
			question: 'Can recipients save my contact to their phone?',
			answer: 'Yes! Every card has a "Save Contact" button that downloads a vCard (.vcf) file. This works with all phones and automatically adds your information to their contacts.'
		},
		
		// Analytics
		{
			category: 'analytics',
			question: 'Can I see who viewed my card?',
			answer: 'Yes! The analytics dashboard shows total views, unique visitors, view trends over time, referral sources, and geographic data. All data is anonymized to protect visitor privacy (GDPR compliant).'
		},
		{
			category: 'analytics',
			question: 'How accurate is the analytics?',
			answer: 'Very accurate! We track views server-side, so they can\'t be blocked by ad blockers. We use IP anonymization and don\'t track personal information to ensure privacy compliance.'
		},
		{
			category: 'analytics',
			question: 'Can I track which QR code was scanned?',
			answer: 'Yes! Analytics show referral sources, so you can see if views came from QR codes, direct links, social media, or other sources.'
		},
		
		// Billing & Plans
		{
			category: 'billing',
			question: 'Is Digital Card Studio really free?',
			answer: 'Yes! Our free plan includes unlimited cards, QR codes, basic analytics, and all core features. Premium plans add advanced analytics, custom domains, and priority support.'
		},
		{
			category: 'billing',
			question: 'What payment methods do you accept?',
			answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) and PayPal. All payments are processed securely through Stripe.'
		},
		{
			category: 'billing',
			question: 'Can I cancel anytime?',
			answer: 'Yes! You can cancel your subscription anytime from your account settings. Your cards will continue to work, but you\'ll lose access to premium features at the end of your billing period.'
		},
		{
			category: 'billing',
			question: 'Do you offer refunds?',
			answer: 'We offer a 30-day money-back guarantee on all paid plans. If you\'re not satisfied, contact support within 30 days for a full refund.'
		},
		
		// Privacy & Security
		{
			category: 'privacy',
			question: 'Is my data secure?',
			answer: 'Yes! We use industry-standard encryption (HTTPS/TLS), secure authentication, and follow OWASP security best practices. Your data is stored in secure, SOC 2 compliant data centers.'
		},
		{
			category: 'privacy',
			question: 'Who can see my information?',
			answer: 'Only people with your card link can see your information. You control what information appears on each card. You can deactivate or delete cards anytime.'
		},
		{
			category: 'privacy',
			question: 'Do you sell my data?',
			answer: 'Never! We don\'t sell, rent, or share your personal information with third parties for marketing purposes. Read our Privacy Policy for full details.'
		},
		{
			category: 'privacy',
			question: 'Are you GDPR compliant?',
			answer: 'Yes! We\'re fully GDPR compliant. We anonymize IP addresses, provide data export/deletion, and only collect necessary data. EU users\' data is stored in EU data centers.'
		},
		
		// Technical
		{
			category: 'technical',
			question: 'What browsers are supported?',
			answer: 'Digital Card Studio works on all modern browsers: Chrome, Firefox, Safari, Edge, and mobile browsers. We recommend keeping your browser updated for the best experience.'
		},
		{
			category: 'technical',
			question: 'Does it work offline?',
			answer: 'The app requires internet to load initially, but we use Progressive Web App (PWA) technology to cache content for faster loading. Recipients need internet to view cards.'
		},
		{
			category: 'technical',
			question: 'What image formats can I upload?',
			answer: 'We accept JPEG, PNG, and WebP images. Images are automatically optimized and converted to WebP for fast loading. Maximum file sizes: 5MB for profile photos, 10MB for logos.'
		},
		{
			category: 'technical',
			question: 'Can I use my own domain?',
			answer: 'Yes! Premium plans allow custom domains (e.g., card.yourcompany.com). Contact support to set this up.'
		},
		{
			category: 'technical',
			question: 'Do you have an API?',
			answer: 'We\'re currently developing a public API for enterprise customers. Join our waitlist or contact sales for early access.'
		}
	];
	
	// Filter FAQs based on search and category
	const filteredFaqs = $derived(() => {
		let filtered = faqs;
		
		// Filter by category
		if (selectedCategory !== 'all') {
			filtered = filtered.filter(faq => faq.category === selectedCategory);
		}
		
		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(faq => 
				faq.question.toLowerCase().includes(query) || 
				faq.answer.toLowerCase().includes(query)
			);
		}
		
		return filtered;
	});

</script>

<svelte:head>
	<title>{data.seoData.title}</title>
	<meta name="description" content={data.seoData.description} />
	<meta property="og:title" content={data.seoData.title} />
	<meta property="og:description" content={data.seoData.description} />
	<meta property="og:type" content={data.seoData.type} />
	<meta property="og:url" content={data.seoData.url} />
</svelte:head>

<!-- Navigation -->
<nav class="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
	<div class="container mx-auto px-4 py-4">
		<div class="flex justify-between items-center">
			<a href="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
				<span class="text-2xl">💳</span>
				<span class="text-xl font-bold">Digital Card Studio</span>
			</a>
			
			<div class="flex items-center gap-4">
				<Button href="/" variant="ghost">Home</Button>
				<Button href="/about" variant="ghost">About</Button>
				<Button href="/contact" variant="ghost">Contact</Button>
				<Button href="/signup">Get Started</Button>
			</div>
		</div>
	</div>
</nav>

<!-- Hero Section -->
<section class="py-20 md:py-32 bg-gradient-to-b from-background to-muted/20">
	<div class="container mx-auto px-4">
		<div class="max-w-4xl mx-auto text-center">
			<h1 class="text-4xl md:text-6xl font-bold mb-6">
				Frequently Asked Questions
			</h1>
			<p class="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8">
				Find answers to common questions about Digital Card Studio
			</p>
			
			<!-- Search Bar -->
			<div class="max-w-2xl mx-auto">
				<div class="relative">
					<Input
						type="search"
						placeholder="Search questions..."
						bind:value={searchQuery}
						class="pl-12 pr-4 py-6 text-lg"
					/>
					<svg 
						class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" 
						fill="none" 
						stroke="currentColor" 
						viewBox="0 0 24 24"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
					</svg>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Category Filter -->
<section class="py-8 bg-muted/30 sticky top-[73px] z-40 border-b border-border">
	<div class="container mx-auto px-4">
		<div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
			{#each categories as category}
				<button
					onclick={() => selectedCategory = category.id}
					class="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors {selectedCategory === category.id 
						? 'bg-primary text-primary-foreground' 
						: 'bg-card hover:bg-accent border border-border'}"
				>
					<span>{category.icon}</span>
					<span class="text-sm font-medium">{category.name}</span>
				</button>
			{/each}
		</div>
	</div>
</section>

<!-- FAQ Content -->
<section class="py-20">
	<div class="container mx-auto px-4">
		<div class="max-w-4xl mx-auto">
			{#if filteredFaqs().length === 0}
				<div class="text-center py-12">
					<div class="text-6xl mb-4">🔍</div>
					<h3 class="text-2xl font-bold mb-2">No results found</h3>
					<p class="text-muted-foreground mb-6">
						Try adjusting your search or browse all categories
					</p>
					<Button onclick={() => { searchQuery = ''; selectedCategory = 'all'; }}>
						Clear Filters
					</Button>
				</div>
			{:else}
				<div class="mb-6 text-sm text-muted-foreground">
					Showing {filteredFaqs().length} {filteredFaqs().length === 1 ? 'question' : 'questions'}
				</div>
				
				<div class="space-y-4">
					{#each filteredFaqs() as faq, index (faq.question)}
						<details 
							class="group bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
							open={index === 0 && searchQuery === ''}
						>
							<summary class="font-semibold text-lg cursor-pointer list-none p-6 flex justify-between items-start gap-4">
								<span class="flex-1">{faq.question}</span>
								<svg 
									class="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform flex-shrink-0 mt-1" 
									fill="none" 
									stroke="currentColor" 
									viewBox="0 0 24 24"
								>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
								</svg>
							</summary>
							<div class="px-6 pb-6">
								<p class="text-muted-foreground leading-relaxed">
									{faq.answer}
								</p>
							</div>
						</details>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</section>

<!-- Still Have Questions Section -->
<section class="py-20 bg-muted/30">
	<div class="container mx-auto px-4">
		<div class="max-w-3xl mx-auto text-center">
			<h2 class="text-3xl font-bold mb-4">Still Have Questions?</h2>
			<p class="text-lg text-muted-foreground mb-8">
				Can't find what you're looking for? Our support team is here to help.
			</p>
			
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<Button href="/contact" size="lg">
					Contact Support
				</Button>
				<Button href="mailto:support@digitalcardstudio.com" variant="outline" size="lg">
					Email Us
				</Button>
			</div>
			
			<p class="mt-6 text-sm text-muted-foreground">
				Average response time: Under 24 hours
			</p>
		</div>
	</div>
</section>

<!-- Popular Resources -->
<section class="py-20">
	<div class="container mx-auto px-4">
		<div class="max-w-5xl mx-auto">
			<div class="text-center mb-12">
				<h2 class="text-3xl font-bold mb-4">Popular Resources</h2>
				<p class="text-lg text-muted-foreground">
					Helpful guides and tutorials to get the most out of Digital Card Studio
				</p>
			</div>
			
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<a 
					href="/guides/getting-started" 
					class="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
				>
					<div class="text-3xl mb-3">📖</div>
					<h3 class="font-bold mb-2">Getting Started Guide</h3>
					<p class="text-sm text-muted-foreground">
						Complete walkthrough for creating your first card
					</p>
				</a>
				
				<a 
					href="/guides/qr-codes" 
					class="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
				>
					<div class="text-3xl mb-3">📱</div>
					<h3 class="font-bold mb-2">QR Code Best Practices</h3>
					<p class="text-sm text-muted-foreground">
						How to effectively use QR codes for networking
					</p>
				</a>
				
				<a 
					href="/guides/analytics" 
					class="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
				>
					<div class="text-3xl mb-3">📊</div>
					<h3 class="font-bold mb-2">Understanding Analytics</h3>
					<p class="text-sm text-muted-foreground">
						Make sense of your card performance data
					</p>
				</a>
			</div>
		</div>
	</div>
</section>

<!-- Footer -->
<footer class="py-12 border-t border-border bg-muted/30">
	<div class="container mx-auto px-4">
		<div class="text-center text-sm text-muted-foreground">
			<p>&copy; {new Date().getFullYear()} Digital Card Studio. All rights reserved.</p>
			<div class="mt-4 space-x-4">
				<a href="/privacy" class="hover:text-foreground transition-colors">Privacy Policy</a>
				<a href="/terms" class="hover:text-foreground transition-colors">Terms of Service</a>
				<a href="/about" class="hover:text-foreground transition-colors">About</a>
				<a href="/contact" class="hover:text-foreground transition-colors">Contact</a>
			</div>
		</div>
	</div>
</footer>

<style>
	/* Hide scrollbar for category filter */
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
