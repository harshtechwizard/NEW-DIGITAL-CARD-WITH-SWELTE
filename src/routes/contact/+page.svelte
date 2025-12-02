<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Label from '$lib/components/ui/Label.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import FormError from '$lib/components/ui/FormError.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import CardContent from '$lib/components/ui/CardContent.svelte';
	import CardHeader from '$lib/components/ui/CardHeader.svelte';
	import CardTitle from '$lib/components/ui/CardTitle.svelte';
	import CardDescription from '$lib/components/ui/CardDescription.svelte';
	import type { PageData, ActionData } from './$types';
	
	let { data, form }: { data: PageData; form: ActionData } = $props();
	
	let isSubmitting = $state(false);
	
	const contactMethods = [
		{
			icon: '📧',
			title: 'Email',
			value: 'support@digitalcardstudio.com',
			description: 'Send us an email anytime'
		},
		{
			icon: '💬',
			title: 'Live Chat',
			value: 'Available 9am-5pm EST',
			description: 'Chat with our support team'
		},
		{
			icon: '📱',
			title: 'Social Media',
			value: '@digitalcardstudio',
			description: 'Follow us on Twitter & LinkedIn'
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
				<Button href="/about" variant="ghost">About</Button>
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
				Get in Touch
			</h1>
			<p class="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
				Have a question or feedback? We'd love to hear from you. Our team typically responds within 24 hours.
			</p>
		</div>
	</div>
</section>

<!-- Contact Methods Section -->
<section class="py-12 bg-muted/30">
	<div class="container mx-auto px-4">
		<div class="max-w-5xl mx-auto">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				{#each contactMethods as method}
					<Card>
						<CardContent class="p-6 text-center">
							<div class="text-4xl mb-3">{method.icon}</div>
							<h3 class="font-bold mb-1">{method.title}</h3>
							<p class="text-sm text-primary font-medium mb-2">{method.value}</p>
							<p class="text-xs text-muted-foreground">{method.description}</p>
						</CardContent>
					</Card>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- Contact Form Section -->
<section class="py-20">
	<div class="container mx-auto px-4">
		<div class="max-w-2xl mx-auto">
			<Card>
				<CardHeader>
					<CardTitle>Send us a Message</CardTitle>
					<CardDescription>
						Fill out the form below and we'll get back to you as soon as possible.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{#if form?.success}
						<div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
							<div class="flex items-start gap-3">
								<span class="text-2xl">✅</span>
								<div>
									<p class="font-medium text-green-900 dark:text-green-100">Message Sent!</p>
									<p class="text-sm text-green-700 dark:text-green-300 mt-1">
										{form.message}
									</p>
								</div>
							</div>
						</div>
					{/if}
					
					<form 
						method="POST" 
						use:enhance={() => {
							isSubmitting = true;
							return async ({ update }) => {
								await update();
								isSubmitting = false;
							};
						}}
						class="space-y-6"
					>
						<div>
							<Label for="name">Name *</Label>
							<Input
								id="name"
								name="name"
								type="text"
								placeholder="Your full name"
								value={form?.name || ''}
								required
								disabled={isSubmitting}
							/>
						</div>
						
						<div>
							<Label for="email">Email *</Label>
							<Input
								id="email"
								name="email"
								type="email"
								placeholder="your.email@example.com"
								value={form?.email || ''}
								required
								disabled={isSubmitting}
							/>
						</div>
						
						<div>
							<Label for="subject">Subject *</Label>
							<Input
								id="subject"
								name="subject"
								type="text"
								placeholder="What is this regarding?"
								value={form?.subject || ''}
								required
								disabled={isSubmitting}
							/>
						</div>
						
						<div>
							<Label for="message">Message *</Label>
							<Textarea
								id="message"
								name="message"
								placeholder="Tell us more about your question or feedback..."
								rows={6}
								value={form?.message || ''}
								required
								disabled={isSubmitting}
							/>
							<p class="text-xs text-muted-foreground mt-1">
								Minimum 10 characters
							</p>
						</div>
						
						{#if form?.error}
							<FormError message={form.error} />
						{/if}
						
						<Button 
							type="submit" 
							class="w-full" 
							size="lg"
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Sending...' : 'Send Message'}
						</Button>
						
						<p class="text-xs text-center text-muted-foreground">
							By submitting this form, you agree to our Privacy Policy
						</p>
					</form>
				</CardContent>
			</Card>
		</div>
	</div>
</section>

<!-- FAQ Quick Links -->
<section class="py-20 bg-muted/30">
	<div class="container mx-auto px-4">
		<div class="max-w-4xl mx-auto text-center">
			<h2 class="text-3xl font-bold mb-4">Looking for Quick Answers?</h2>
			<p class="text-lg text-muted-foreground mb-8">
				Check out our FAQ page for answers to common questions
			</p>
			<Button href="/faq" variant="outline" size="lg">
				View FAQ
			</Button>
		</div>
	</div>
</section>

<!-- Social Media Links -->
<section class="py-20">
	<div class="container mx-auto px-4">
		<div class="max-w-4xl mx-auto text-center">
			<h2 class="text-3xl font-bold mb-4">Connect With Us</h2>
			<p class="text-lg text-muted-foreground mb-8">
				Follow us on social media for updates, tips, and community highlights
			</p>
			
			<div class="flex justify-center gap-6">
				<a 
					href="https://twitter.com/digitalcardstudio" 
					target="_blank" 
					rel="noopener noreferrer"
					class="flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
				>
					<span class="text-2xl">🐦</span>
					<span class="font-medium">Twitter</span>
				</a>
				
				<a 
					href="https://linkedin.com/company/digitalcardstudio" 
					target="_blank" 
					rel="noopener noreferrer"
					class="flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
				>
					<span class="text-2xl">💼</span>
					<span class="font-medium">LinkedIn</span>
				</a>
				
				<a 
					href="https://github.com/digitalcardstudio" 
					target="_blank" 
					rel="noopener noreferrer"
					class="flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
				>
					<span class="text-2xl">💻</span>
					<span class="font-medium">GitHub</span>
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
			</div>
		</div>
	</div>
</footer>
