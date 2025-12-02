<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	
	let { form }: { form: ActionData } = $props();
	
	let isSubmitting = $state(false);
	let password = $state('');
	let confirmPassword = $state('');
	let clientErrors = $state<{ 
		password?: string; 
		confirmPassword?: string;
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
	
	function handleClientValidation() {
		clientErrors = {
			password: validatePassword(password),
			confirmPassword: validateConfirmPassword(confirmPassword)
		};
		return !clientErrors.password && !clientErrors.confirmPassword;
	}
</script>

<div class="bg-card rounded-lg shadow-lg p-8 border border-border">
	<h2 class="text-2xl font-semibold text-center mb-2">Set New Password</h2>
	<p class="text-center text-muted-foreground mb-6">
		Enter your new password below.
	</p>
	
	{#if form?.error}
		<div class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4" role="alert">
			<p class="text-sm">{form.error}</p>
		</div>
	{/if}
	
	{#if form?.success}
		<div class="bg-green-50 border border-green-500 text-green-700 px-4 py-3 rounded mb-4" role="alert">
			<p class="text-sm font-medium">Password reset successful!</p>
			<p class="text-sm mt-1">You can now sign in with your new password.</p>
		</div>
		
		<div class="mt-6 text-center">
			<a 
				href="/login" 
				class="inline-block w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors text-center"
			>
				Go to Sign In
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
					<label for="password" class="block text-sm font-medium text-foreground mb-1">
						New Password
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
						Confirm New Password
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
				
				<button
					type="submit"
					disabled={isSubmitting}
					class="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{isSubmitting ? 'Resetting password...' : 'Reset Password'}
				</button>
			</div>
		</form>
	{/if}
</div>
