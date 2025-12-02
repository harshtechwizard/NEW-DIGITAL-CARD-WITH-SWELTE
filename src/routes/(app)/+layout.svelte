<script lang="ts">
	import type { LayoutData } from './$types';
	import { page } from '$app/stores';
	
	let { data, children }: { data: LayoutData; children: any } = $props();
	
	// Mobile menu state
	let mobileMenuOpen = $state(false);
	
	// Toggle mobile menu
	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
	
	// Close mobile menu when clicking outside
	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
	
	// Navigation links
	const navLinks = [
		{ href: '/dashboard', label: 'Dashboard' },
		{ href: '/profile', label: 'Profile' },
		{ href: '/cards', label: 'My Cards' },
		{ href: '/analytics', label: 'Analytics' }
	];
	
	// Check if link is active
	function isActive(href: string) {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
	}
</script>

<div class="min-h-screen bg-background">
	<!-- Navigation Bar -->
	<nav class="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
		<div class="container mx-auto px-4 py-3">
			<div class="flex items-center justify-between">
				<!-- Logo and Desktop Navigation -->
				<div class="flex items-center gap-8">
					<a href="/dashboard" class="text-xl font-bold text-foreground hover:text-primary transition-colors">
						Digital Card Studio
					</a>
					
					<!-- Desktop Navigation Links -->
					<div class="hidden md:flex items-center gap-1">
						{#each navLinks as link}
							<a
								href={link.href}
								class="px-3 py-2 text-sm rounded-md transition-colors {isActive(link.href)
									? 'bg-accent text-accent-foreground font-medium'
									: 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}"
							>
								{link.label}
							</a>
						{/each}
					</div>
				</div>
				
				<!-- User Info and Actions -->
				<div class="flex items-center gap-3">
					<!-- User Info (Desktop) -->
					<div class="hidden sm:flex items-center gap-3">
						{#if data.personalInfo?.profile_photo_url}
							<img
								src={data.personalInfo.profile_photo_url}
								alt="Profile"
								class="w-8 h-8 rounded-full object-cover border border-border"
							/>
						{/if}
						<div class="flex flex-col items-end">
							{#if data.personalInfo?.full_name}
								<span class="text-sm font-medium text-foreground">
									{data.personalInfo.full_name}
								</span>
							{/if}
							<span class="text-xs text-muted-foreground">
								{data.user?.email}
							</span>
						</div>
					</div>
					
					<!-- Sign Out Button (Desktop) -->
					<form method="POST" action="/logout" class="hidden md:block">
						<button
							type="submit"
							class="text-sm px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
						>
							Sign Out
						</button>
					</form>
					
					<!-- Mobile Menu Button -->
					<button
						type="button"
						onclick={toggleMobileMenu}
						class="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
						aria-label="Toggle menu"
						aria-expanded={mobileMenuOpen}
					>
						{#if mobileMenuOpen}
							<!-- Close Icon -->
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						{:else}
							<!-- Menu Icon -->
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
							</svg>
						{/if}
					</button>
				</div>
			</div>
			
			<!-- Mobile Menu -->
			{#if mobileMenuOpen}
				<div class="md:hidden mt-4 pb-4 border-t border-border pt-4">
					<!-- User Info (Mobile) -->
					<div class="flex items-center gap-3 px-2 py-3 mb-4 bg-accent/50 rounded-md">
						{#if data.personalInfo?.profile_photo_url}
							<img
								src={data.personalInfo.profile_photo_url}
								alt="Profile"
								class="w-10 h-10 rounded-full object-cover border border-border"
							/>
						{/if}
						<div class="flex flex-col">
							{#if data.personalInfo?.full_name}
								<span class="text-sm font-medium text-foreground">
									{data.personalInfo.full_name}
								</span>
							{/if}
							<span class="text-xs text-muted-foreground">
								{data.user?.email}
							</span>
						</div>
					</div>
					
					<!-- Mobile Navigation Links -->
					<div class="flex flex-col gap-1">
						{#each navLinks as link}
							<a
								href={link.href}
								onclick={closeMobileMenu}
								class="px-3 py-2 text-sm rounded-md transition-colors {isActive(link.href)
									? 'bg-accent text-accent-foreground font-medium'
									: 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}"
							>
								{link.label}
							</a>
						{/each}
					</div>
					
					<!-- Sign Out Button (Mobile) -->
					<form method="POST" action="/logout" class="mt-4">
						<button
							type="submit"
							class="w-full text-sm px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
						>
							Sign Out
						</button>
					</form>
				</div>
			{/if}
		</div>
	</nav>
	
	<!-- Main Content -->
	<main class="container mx-auto px-4 py-8">
		{@render children()}
	</main>
</div>
