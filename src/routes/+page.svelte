<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import BusinessCardPreview from '$lib/components/BusinessCardPreview.svelte';
	import FeatureCard from '$lib/components/FeatureCard.svelte';
	import TestimonialCard from '$lib/components/TestimonialCard.svelte';
	import CTAButton from '$lib/components/CTAButton.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	
	const features = [
		{
			icon: '🎨',
			title: 'Beautiful Templates',
			description: 'Choose from professionally designed templates or create your own custom design.'
		},
		{
			icon: '📱',
			title: 'Share Instantly',
			description: 'Share via QR code, NFC tag, or direct link. Works on any device, no app required.'
		},
		{
			icon: '📊',
			title: 'Track Engagement',
			description: 'See who views your card, when, and from where. Understand your networking impact.'
		},
		{
			icon: '🔒',
			title: 'Secure & Private',
			description: 'Your data is encrypted and secure. Control who sees what with privacy settings.'
		}
	];
	
	const testimonials = [
		{
			quote: 'Digital Card Studio transformed how I network. I never worry about running out of cards anymore!',
			author: 'Sarah Chen',
			role: 'Sales Director'
		},
		{
			quote: 'The analytics feature is incredible. I can see exactly who\'s interested in my services.',
			author: 'Michael Rodriguez',
			role: 'Freelance Designer'
		},
		{
			quote: 'Setup took 5 minutes. The QR code feature is a game-changer at conferences.',
			author: 'Emily Watson',
			role: 'Marketing Manager'
		}
	];
	
	const faqs = [
		{
			question: 'How does it work?',
			answer: 'Create your digital business card, customize it with your information and branding, then share it via QR code, NFC tag, or direct link. Recipients can view your card instantly without downloading an app.'
		},
		{
			question: 'Can I have multiple cards?',
			answer: 'Yes! Create different cards for different contexts - one for work, one for personal projects, or customize cards for specific events.'
		},
		{
			question: 'Is it really free?',
			answer: 'Yes, our basic plan is completely free and includes all core features. Premium plans offer advanced analytics and customization options.'
		},
		{
			question: 'What about privacy?',
			answer: 'You control what information is visible on each card. All data is encrypted and stored securely. You can deactivate or delete cards anytime.'
		}
	];
</script>

<svelte:head>
	<title>{data.seoData.title}</title>
	<meta name="description" content={data.seoData.description} />
	
	<!-- Open Graph -->
	<meta property="og:title" content={data.seoData.title} />
	<meta property="og:description" content={data.seoData.description} />
	<meta property="og:type" content={data.seoData.type} />
	<meta property="og:url" content={data.seoData.url} />
	<meta property="og:image" content={data.seoData.image} />
	
	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.seoData.title} />
	<meta name="twitter:description" content={data.seoData.description} />
	<meta name="twitter:image" content={data.seoData.image} />
	
	<!-- Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify(data.structuredData)}</script>`}
</svelte:head>

<!-- Navigation -->
<nav class="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
	<div class="container mx-auto px-4 py-4">
		<div class="flex justify-between items-center">
			<div class="flex items-center gap-2">
				<span class="text-2xl">💳</span>
				<span class="text-xl font-bold">Digital Card Studio</span>
			</div>
			
			<div class="flex items-center gap-4">
				<ThemeToggle />
				{#if data.user}
					<Button href="/dashboard" variant="ghost">Dashboard</Button>
				{:else}
					<Button href="/login" variant="ghost">Login</Button>
					<Button href="/signup">Get Started</Button>
				{/if}
			</div>
		</div>
	</div>
</nav>

<!-- Hero Section -->
<section class="py-20 md:py-32 bg-gradient-to-b from-background to-muted/20">
	<div class="container mx-auto px-4">
		<div class="max-w-4xl mx-auto text-center">
			<h1 class="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
				Your Business Card, Reimagined
			</h1>
			<p class="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
				Create stunning digital business cards in minutes. Share instantly via QR code, NFC, or link. Never run out of cards again.
			</p>
			
			<div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
				<CTAButton href="/signup" size="lg" class="text-lg px-8">
					Create Your Card Free
				</CTAButton>
				<CTAButton href="#demo" variant="outline" size="lg" class="text-lg px-8">
					See Demo
				</CTAButton>
			</div>
			
			<p class="text-sm text-muted-foreground">
				✨ No credit card required • 🚀 Setup in 5 minutes • 🔒 Secure & private
			</p>
		</div>
	</div>
</section>

<!-- Demo Card Preview Section -->
<section id="demo" class="py-20 bg-muted/30">
	<div class="container mx-auto px-4">
		<div class="max-w-5xl mx-auto">
			<div class="text-center mb-12">
				<h2 class="text-3xl md:text-4xl font-bold mb-4">See It In Action</h2>
				<p class="text-lg text-muted-foreground">
					Here's what your digital business card could look like
				</p>
			</div>
			
			<div class="max-w-2xl mx-auto">
				<BusinessCardPreview card={data.demoCard} />
			</div>
		</div>
	</div>
</section>

<!-- Features Section -->
<section class="py-20">
	<div class="container mx-auto px-4">
		<div class="text-center mb-12">
			<h2 class="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
			<p class="text-lg text-muted-foreground max-w-2xl mx-auto">
				Powerful features to help you network smarter and make lasting connections
			</p>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
			{#each features as feature}
				<FeatureCard {...feature} />
			{/each}
		</div>
	</div>
</section>

<!-- Testimonials Section -->
<section class="py-20 bg-muted/30">
	<div class="container mx-auto px-4">
		<div class="text-center mb-12">
			<h2 class="text-3xl md:text-4xl font-bold mb-4">Loved by Professionals</h2>
			<p class="text-lg text-muted-foreground">
				Join thousands who've upgraded their networking game
			</p>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
			{#each testimonials as testimonial}
				<TestimonialCard {...testimonial} />
			{/each}
		</div>
	</div>
</section>

<!-- FAQ Section -->
<section class="py-20">
	<div class="container mx-auto px-4">
		<div class="max-w-3xl mx-auto">
			<div class="text-center mb-12">
				<h2 class="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
				<p class="text-lg text-muted-foreground">
					Everything you need to know about Digital Card Studio
				</p>
			</div>
			
			<div class="space-y-6">
				{#each faqs as faq}
					<details class="group bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
						<summary class="font-semibold text-lg cursor-pointer list-none flex justify-between items-center">
							{faq.question}
							<svg class="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
							</svg>
						</summary>
						<p class="mt-4 text-muted-foreground">
							{faq.answer}
						</p>
					</details>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- Final CTA Section -->
<section class="py-20 bg-primary text-primary-foreground">
	<div class="container mx-auto px-4">
		<div class="max-w-3xl mx-auto text-center">
			<h2 class="text-3xl md:text-4xl font-bold mb-4">
				Ready to Go Digital?
			</h2>
			<p class="text-xl mb-8 opacity-90">
				Join thousands of professionals who've made the switch to digital business cards
			</p>
			
			<CTAButton 
				href="/signup" 
				variant="secondary" 
				size="lg" 
				class="text-lg px-8"
			>
				Create Your Free Card Now
			</CTAButton>
			
			<p class="mt-6 text-sm opacity-75">
				No credit card required • Free forever plan available
			</p>
		</div>
	</div>
</section>

<!-- Footer -->
<footer class="py-12 border-t border-border bg-muted/30">
	<div class="container mx-auto px-4">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
			<div>
				<div class="flex items-center gap-2 mb-4">
					<span class="text-2xl">💳</span>
					<span class="font-bold">Digital Card Studio</span>
				</div>
				<p class="text-sm text-muted-foreground">
					Create and share professional digital business cards instantly.
				</p>
			</div>
			
			<div>
				<h3 class="font-semibold mb-4">Product</h3>
				<ul class="space-y-2 text-sm">
					<li><a href="/features" class="text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
					<li><a href="/pricing" class="text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
					<li><a href="/templates" class="text-muted-foreground hover:text-foreground transition-colors">Templates</a></li>
				</ul>
			</div>
			
			<div>
				<h3 class="font-semibold mb-4">Company</h3>
				<ul class="space-y-2 text-sm">
					<li><a href="/about" class="text-muted-foreground hover:text-foreground transition-colors">About</a></li>
					<li><a href="/contact" class="text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
					<li><a href="/faq" class="text-muted-foreground hover:text-foreground transition-colors">FAQ</a></li>
				</ul>
			</div>
			
			<div>
				<h3 class="font-semibold mb-4">Legal</h3>
				<ul class="space-y-2 text-sm">
					<li><a href="/privacy" class="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
					<li><a href="/terms" class="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a></li>
				</ul>
			</div>
		</div>
		
		<div class="pt-8 border-t border-border text-center text-sm text-muted-foreground">
			<p>&copy; {new Date().getFullYear()} Digital Card Studio. All rights reserved.</p>
		</div>
	</div>
</footer>
