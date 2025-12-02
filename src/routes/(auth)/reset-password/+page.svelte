<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	
	let { form }: { form: ActionData } = $props();
	
	let isSubmitting = $state(false);
	let email = $state(form?.email || '');
	let clientErrors = $state<{ email?: string }>({});
	
	function validateEmail(value: string): string | undefined {
		if (!value) return 'Email is required';
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address';
		return undefined;
	}
	
	function handleClientValidation() {
		clientErrors = {
			email: validateEmail(email)
		};
		return !clientErrors.email;
	}
</script>

<div class="bg-card rounded-lg shadow-lg p-8 border border-border">
	<h2 class="text-2xl font-semibold text-center mb-2">Reset Password</h2>
	<p class="text-center text-muted-foreground mb-6">
		Enter your email address and we'll send you a link to reset your password.
	</p>
	
	{#if form?.error}
		<div class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4" role="alert">
			<p class="text-sm">{form.error}</p>
		</div>
	{/if}
	
	{#if form?.success}
		<div class="bg-green-50 border border-green-500 text-green-700 px-4 py-3 rounded mb-4" role="alert">
			<p class="text-sm font-medium">Reset link sent!</p>
			<p class="text-sm mt-1">{form.message}</p>
		</div>
		
		<div class="mt-6 text-center">
			<a href="/login" class="text-primary hover:underline text-sm">
				Back to sign in
			</a>
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
				
				<button
					type="submit"
					disabled={isSubmitting}
					class="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{isSubmitting ? 'Sending...' : 'Send Reset Link'}
				</button>
			</div>
		</form>
		
		<div class="mt-6 text-center text-sm text-muted-foreground">
			Remember your password?
			<a href="/login" class="text-primary hover:underline font-medium">
				Sign in
			</a>
		</div>
	{/if}
</div>
