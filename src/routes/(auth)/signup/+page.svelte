<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	
	let { form }: { form: ActionData } = $props();
	
	let isSubmitting = $state(false);
	let email = $state(form?.email || '');
	let password = $state('');
	let confirmPassword = $state('');
	let acceptTerms = $state(false);
	let clientErrors = $state<{ 
		email?: string; 
		password?: string; 
		confirmPassword?: string;
		acceptTerms?: string;
	}>({});
	
	// Password strength indicator
	let passwordStrength = $derived.by(() => {
		if (!password) return { score: 0, label: '', color: '' };
		
		let score = 0;
		if (password.length >= 8) score++;
		if (password.length >= 12) score++;
		if (/[a-z]/.test(password)) score++;
		if (/[A-Z]/.test(password)) score++;
		if (/\d/.test(password)) score++;
		if (/[^a-zA-Z0-9]/.test(password)) score++;
		
		if (score <= 2) return { score, label: 'Weak', color: 'bg-destructive' };
		if (score <= 4) return { score, label: 'Medium', color: 'bg-yellow-500' };
		return { score, label: 'Strong', color: 'bg-green-500' };
	});
	
	function validateEmail(value: string): string | undefined {
		if (!value) return 'Email is required';
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address';
		return undefined;
	}
	
	function validatePassword(value: string): string | undefined {
		if (!value) return 'Password is required';
		if (value.length < 8) return 'Password must be at least 8 characters';
		if (!/(?=.*[a-z])/.test(value)) return 'Password must contain a lowercase letter';
		if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain an uppercase letter';
		if (!/(?=.*\d)/.test(value)) return 'Password must contain a number';
		return undefined;
	}
	
	function validateConfirmPassword(value: string): string | undefined {
		if (!value) return 'Please confirm your password';
		if (value !== password) return 'Passwords do not match';
		return undefined;
	}
	
	function validateTerms(value: boolean): string | undefined {
		if (!value) return 'You must accept the terms of service';
		return undefined;
	}
	
	function handleClientValidation() {
		clientErrors = {
			email: validateEmail(email),
			password: validatePassword(password),
			confirmPassword: validateConfirmPassword(confirmPassword),
			acceptTerms: validateTerms(acceptTerms)
		};
		return !clientErrors.email && !clientErrors.password && 
		       !clientErrors.confirmPassword && !clientErrors.acceptTerms;
	}
</script>

<div class="bg-card rounded-lg shadow-lg p-8 border border-border">
	<h2 class="text-2xl font-semibold text-center mb-6">Create Account</h2>
	
	{#if form?.error}
		<div class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4" role="alert">
			<p class="text-sm">{form.error}</p>
		</div>
	{/if}
	
	{#if form?.success}
		<div class="bg-green-50 border border-green-500 text-green-700 px-4 py-3 rounded mb-4" role="alert">
			<p class="text-sm font-medium">Account created successfully!</p>
			<p class="text-sm mt-1">{form.message}</p>
		</div>
	{:else}
		<form 
			method="POST" 
			use:enhance={() => {
				if (!handleClientValidation()) {
					return ({ update }) => update({ reset: false });
				}
				
				isSubmitting = true;
				return async ({ update }) => {
					await update();
					isSubmitting = false;
				};
			}}
		>
			<div class="space-y-4">
				<div>
					<label for="email" class="block text-sm font-medium text-foreground mb-1">
						Email
					</label>
					<input
						type="email"
						id="email"
						name="email"
						bind:value={email}
						onblur={() => {
							if (email) clientErrors.email = validateEmail(email);
						}}
						oninput={() => {
							if (clientErrors.email) clientErrors.email = validateEmail(email);
						}}
						class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
						placeholder="you@example.com"
						required
						disabled={isSubmitting}
					/>
					{#if clientErrors.email}
						<p class="text-destructive text-sm mt-1">{clientErrors.email}</p>
					{/if}
				</div>
				
				<div>
					<label for="password" class="block text-sm font-medium text-foreground mb-1">
						Password
					</label>
					<input
						type="password"
						id="password"
						name="password"
						bind:value={password}
						onblur={() => {
							if (password) clientErrors.password = validatePassword(password);
						}}
						oninput={() => {
							if (clientErrors.password) clientErrors.password = validatePassword(password);
						}}
						class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
						placeholder="••••••••"
						required
						disabled={isSubmitting}
					/>
					{#if clientErrors.password}
						<p class="text-destructive text-sm mt-1">{clientErrors.password}</p>
					{/if}
					
					{#if password}
						<div class="mt-2">
							<div class="flex items-center gap-2 mb-1">
								<div class="flex-1 h-2 bg-muted rounded-full overflow-hidden">
									<div 
										class="{passwordStrength.color} h-full transition-all duration-300"
										style="width: {(passwordStrength.score / 6) * 100}%"
									></div>
								</div>
								<span class="text-xs text-muted-foreground">{passwordStrength.label}</span>
							</div>
							<p class="text-xs text-muted-foreground">
								Use 8+ characters with uppercase, lowercase, and numbers
							</p>
						</div>
					{/if}
				</div>
				
				<div>
					<label for="confirmPassword" class="block text-sm font-medium text-foreground mb-1">
						Confirm Password
					</label>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						bind:value={confirmPassword}
						onblur={() => {
							if (confirmPassword) clientErrors.confirmPassword = validateConfirmPassword(confirmPassword);
						}}
						oninput={() => {
							if (clientErrors.confirmPassword) clientErrors.confirmPassword = validateConfirmPassword(confirmPassword);
						}}
						class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
						placeholder="••••••••"
						required
						disabled={isSubmitting}
					/>
					{#if clientErrors.confirmPassword}
						<p class="text-destructive text-sm mt-1">{clientErrors.confirmPassword}</p>
					{/if}
				</div>
				
				<div class="flex items-start">
					<input
						type="checkbox"
						id="acceptTerms"
						name="acceptTerms"
						bind:checked={acceptTerms}
						onchange={() => {
							if (clientErrors.acceptTerms) clientErrors.acceptTerms = validateTerms(acceptTerms);
						}}
						class="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
						required
						disabled={isSubmitting}
					/>
					<label for="acceptTerms" class="ml-2 text-sm text-foreground">
						I agree to the <a href="/terms" class="text-primary hover:underline" target="_blank">Terms of Service</a> 
						and <a href="/privacy" class="text-primary hover:underline" target="_blank">Privacy Policy</a>
					</label>
				</div>
				{#if clientErrors.acceptTerms}
					<p class="text-destructive text-sm -mt-2">{clientErrors.acceptTerms}</p>
				{/if}
				
				<button
					type="submit"
					disabled={isSubmitting}
					class="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{isSubmitting ? 'Creating account...' : 'Create Account'}
				</button>
			</div>
		</form>
	{/if}
	
	<div class="relative my-6">
		<div class="absolute inset-0 flex items-center">
			<div class="w-full border-t border-border"></div>
		</div>
		<div class="relative flex justify-center text-xs uppercase">
			<span class="bg-card px-2 text-muted-foreground">Or continue with</span>
		</div>
	</div>
	
	<div class="grid grid-cols-2 gap-3">
		<form method="POST" action="?/oauth">
			<input type="hidden" name="provider" value="google" />
			<button
				type="submit"
				class="w-full flex items-center justify-center gap-2 px-4 py-2 border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
			>
				<svg class="w-5 h-5" viewBox="0 0 24 24">
					<path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
					<path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
					<path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
					<path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
				</svg>
				Google
			</button>
		</form>
		
		<form method="POST" action="?/oauth">
			<input type="hidden" name="provider" value="github" />
			<button
				type="submit"
				class="w-full flex items-center justify-center gap-2 px-4 py-2 border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
			>
				<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
				</svg>
				GitHub
			</button>
		</form>
	</div>
	
	<div class="mt-6 text-center text-sm text-muted-foreground">
		Already have an account?
		<a href="/login" class="text-primary hover:underline font-medium">
			Sign in
		</a>
	</div>
</div>
