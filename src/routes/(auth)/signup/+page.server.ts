import { fail, redirect } from '@sveltejs/kit';
import { signupSchema } from '$lib/server/validation';
import { rateLimit } from '$lib/server/rate-limiter';
import type { Actions, PageServerLoad } from './$types';

/**
 * Load function - redirect if already authenticated
 */
export const load: PageServerLoad = async ({ locals }) => {
	// Check if user is already logged in
	if (locals.session) {
		throw redirect(303, '/dashboard');
	}
	
	return {};
};

/**
 * Signup form actions
 * 
 * Security features:
 * - Rate limiting (3 attempts per 15 minutes)
 * - Server-side validation with Zod
 * - Email verification required before access
 * - Password strength requirements enforced
 */
export const actions: Actions = {
	/**
	 * Signup action - email/password signup
	 */
	signup: async ({ request, locals, getClientAddress }) => {
		const ip = getClientAddress();
		
		// Rate limiting: 3 attempts per 15 minutes (900 seconds)
		const rateLimitResult = await rateLimit(ip, 'signup', 3, 900);
		
		if (!rateLimitResult.allowed) {
			const minutes = Math.ceil(rateLimitResult.retryAfter / 60);
			return fail(429, {
				error: `Too many signup attempts. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`,
				email: ''
			});
		}
		
		// Parse form data
		const formData = await request.formData();
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();
		const confirmPassword = formData.get('confirmPassword')?.toString();
		const acceptTerms = formData.get('acceptTerms') === 'on';
		
		// Validate input with Zod
		const validation = signupSchema.safeParse({ 
			email, 
			password, 
			confirmPassword,
			acceptTerms 
		});
		
		if (!validation.success) {
			const firstError = validation.error.errors[0];
			return fail(400, {
				error: firstError?.message || 'Validation failed',
				email: email || ''
			});
		}
		
		// Get Supabase client from locals
		const supabase = locals.supabase;
		
		// Attempt signup with email verification
		const { error: authError } = await supabase.auth.signUp({
			email: validation.data.email,
			password: validation.data.password,
			options: {
				emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
				data: {
					email_verified: false
				}
			}
		});
		
		if (authError) {
			// Handle specific error cases
			if (authError.message.includes('already registered')) {
				return fail(400, {
					error: 'An account with this email already exists. Please sign in instead.',
					email: validation.data.email
				});
			}
			
			// Generic error message
			return fail(400, {
				error: 'Failed to create account. Please try again.',
				email: validation.data.email
			});
		}
		
		// Return success message
		return {
			success: true,
			message: 'Account created! Please check your email to verify your account before signing in.',
			email: validation.data.email
		};
	},
	
	/**
	 * OAuth action - handle Google and GitHub OAuth
	 */
	oauth: async ({ request, locals, url }) => {
		const formData = await request.formData();
		const provider = formData.get('provider')?.toString() as 'google' | 'github';
		
		if (!provider || !['google', 'github'].includes(provider)) {
			return fail(400, {
				error: 'Invalid OAuth provider'
			});
		}
		
		const supabase = locals.supabase;
		
		// Initiate OAuth flow
		const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${url.origin}/auth/callback`
			}
		});
		
		if (oauthError || !data.url) {
			return fail(400, {
				error: 'Failed to initiate OAuth signup. Please try again.'
			});
		}
		
		// Redirect to OAuth provider
		throw redirect(303, data.url);
	}
};
