<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import CardContent from '$lib/components/ui/CardContent.svelte';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	
	const team = [
		{
			name: 'Alex Johnson',
			role: 'Founder & CEO',
			bio: 'Former tech executive with 15 years in digital innovation. Passionate about making networking accessible to everyone.',
			emoji: '👨‍💼'
		},
		{
			name: 'Sarah Chen',
			role: 'Head of Product',
			bio: 'Product designer with a focus on user experience. Believes great design should be invisible.',
			emoji: '👩‍💻'
		},
		{
			name: 'Michael Rodriguez',
			role: 'Lead Engineer',
			bio: 'Full-stack developer who loves building scalable, secure applications that users love.',
			emoji: '👨‍🔧'
		}
	];
	
	const values = [
		{
			icon: '🎯',
			title: 'User-First',
			description: 'Every decision we make starts with asking: "How does this help our users?"'
		},
		{
			icon: '🔒',
			title: 'Privacy & Security',
			description: 'Your data is yours. We build with security and privacy as core principles, not afterthoughts.'
		},
		{
			icon: '🌱',
			title: 'Sustainability',
			description: 'Digital cards mean fewer paper cards in landfills. Small change, big impact.'
		},
		{
			icon: '🚀',
			title: 'Innovation',
			description: 'We\'re constantly exploring new ways to make professional networking better.'
		}
	];

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
				About Digital Card Studio
			</h1>
			<p class="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
				We're on a mission to make professional networking effortless, sustainable, and accessible to everyone.
			</p>
		</div>
	</div>
</section>

<!-- Mission & Vision Section -->
<section class="py-20">
	<div class="container mx-auto px-4">
		<div class="max-w-4xl mx-auto">
			<div class="grid md:grid-cols-2 gap-12 mb-16">
				<div>
					<div class="text-4xl mb-4">🎯</div>
					<h2 class="text-3xl font-bold mb-4">Our Mission</h2>
					<p class="text-lg text-muted-foreground leading-relaxed">
						To revolutionize professional networking by replacing outdated paper business cards with beautiful, 
						eco-friendly digital alternatives that work seamlessly across all devices and platforms.
					</p>
				</div>
				
				<div>
					<div class="text-4xl mb-4">🔮</div>
					<h2 class="text-3xl font-bold mb-4">Our Vision</h2>
					<p class="text-lg text-muted-foreground leading-relaxed">
						A world where every professional connection is instant, meaningful, and sustainable. 
						Where networking is about building relationships, not managing stacks of paper cards.
					</p>
				</div>
			</div>
			
			<div class="bg-muted/30 rounded-lg p-8 md:p-12">
				<h3 class="text-2xl font-bold mb-4">The Story Behind Digital Card Studio</h3>
				<div class="space-y-4 text-muted-foreground leading-relaxed">
					<p>
						Digital Card Studio was born from a simple frustration: running out of business cards at a crucial networking event. 
						Our founder, Alex, realized that in 2024, we shouldn't still be relying on paper cards that get lost, damaged, or thrown away.
					</p>
					<p>
						We built Digital Card Studio to solve this problem not just for ourselves, but for millions of professionals worldwide. 
						What started as a weekend project has grown into a platform trusted by thousands of users across 50+ countries.
					</p>
					<p>
						Today, we're proud to be helping professionals make better connections while reducing paper waste. 
						Every digital card shared is one less paper card in a landfill, and one more meaningful connection made.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Values Section -->
<section class="py-20 bg-muted/30">
	<div class="container mx-auto px-4">
		<div class="max-w-5xl mx-auto">
			<div class="text-center mb-12">
				<h2 class="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
				<p class="text-lg text-muted-foreground">
					The principles that guide everything we do
				</p>
			</div>
			
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				{#each values as value}
					<Card>
						<CardContent class="p-6">
							<div class="text-4xl mb-4">{value.icon}</div>
							<h3 class="text-xl font-bold mb-2">{value.title}</h3>
							<p class="text-muted-foreground">{value.description}</p>
						</CardContent>
					</Card>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- Team Section -->
<section class="py-20">
	<div class="container mx-auto px-4">
		<div class="max-w-5xl mx-auto">
			<div class="text-center mb-12">
				<h2 class="text-3xl md:text-4xl font-bold mb-4">Meet the Team</h2>
				<p class="text-lg text-muted-foreground">
					The people building the future of professional networking
				</p>
			</div>
			
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				{#each team as member}
					<Card>
						<CardContent class="p-6 text-center">
							<div class="text-6xl mb-4">{member.emoji}</div>
							<h3 class="text-xl font-bold mb-1">{member.name}</h3>
							<p class="text-sm text-primary font-medium mb-3">{member.role}</p>
							<p class="text-sm text-muted-foreground">{member.bio}</p>
						</CardContent>
					</Card>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- Stats Section -->
<section class="py-20 bg-muted/30">
	<div class="container mx-auto px-4">
		<div class="max-w-5xl mx-auto">
			<div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
				<div>
					<div class="text-4xl md:text-5xl font-bold text-primary mb-2">10K+</div>
					<div class="text-sm text-muted-foreground">Active Users</div>
				</div>
				<div>
					<div class="text-4xl md:text-5xl font-bold text-primary mb-2">50+</div>
					<div class="text-sm text-muted-foreground">Countries</div>
				</div>
				<div>
					<div class="text-4xl md:text-5xl font-bold text-primary mb-2">100K+</div>
					<div class="text-sm text-muted-foreground">Cards Shared</div>
				</div>
				<div>
					<div class="text-4xl md:text-5xl font-bold text-primary mb-2">99.9%</div>
					<div class="text-sm text-muted-foreground">Uptime</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="py-20">
	<div class="container mx-auto px-4">
		<div class="max-w-3xl mx-auto text-center">
			<h2 class="text-3xl md:text-4xl font-bold mb-4">
				Join Us on This Journey
			</h2>
			<p class="text-xl text-muted-foreground mb-8">
				Be part of the digital networking revolution. Create your first card today.
			</p>
			
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<Button href="/signup" size="lg" class="text-lg px-8">
					Get Started Free
				</Button>
				<Button href="/contact" variant="outline" size="lg" class="text-lg px-8">
					Contact Us
				</Button>
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
				<a href="/contact" class="hover:text-foreground transition-colors">Contact</a>
			</div>
		</div>
	</div>
</footer>
