import { fail, redirect } from '@sveltejs/kit';
import { loginSchema } from '$lib/server/validation';
import { rateLimit, resetRateLimit } from '$lib/server/rate-limiter';
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
 * Login form actions
 * 
 * Security features:
 * - Rate limiting (5 attempts per 15 minutes)
 * - Server-side validation with Zod
 * - Secure session creation with httpOnly cookies
 */
export const actions: Actions = {
	/**
	 * Login action - email/password login
	 */
	login: async ({ request, locals, getClientAddress }) => {
		const ip = getClientAddress();
		
		// Rate limiting: 5 attempts per 15 minutes (900 seconds)
		const rateLimitResult = await rateLimit(ip, 'login', 5, 900);
		
		if (!rateLimitResult.allowed) {
			const minutes = Math.ceil(rateLimitResult.retryAfter / 60);
			return fail(429, {
				error: `Too many login attempts. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`,
				email: ''
			});
		}
		
		// Parse form data
		const formData = await request.formData();
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();
		
		// Validate input with Zod
		const validation = loginSchema.safeParse({ email, password });
		
		if (!validation.success) {
			const firstError = validation.error.issues[0];
			return fail(400, {
				error: firstError?.message || 'Validation failed',
				email: email || ''
			});
		}
		
		// Get Supabase client from locals
		const supabase = locals.supabase;
		
		// Attempt login
		const { error: authError } = await supabase.auth.signInWithPassword({
			email: validation.data.email,
			password: validation.data.password
		});
		
		if (authError) {
			// Don't reveal whether email exists or password is wrong
			return fail(401, {
				error: 'Invalid email or password',
				email: validation.data.email
			});
		}
		
		// Clear rate limit on successful login
		resetRateLimit(ip, 'login');
		
		// Redirect to dashboard
		throw redirect(303, '/dashboard');
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
				error: 'Failed to initiate OAuth login. Please try again.'
			});
		}
		
		// Redirect to OAuth provider
		throw redirect(303, data.url);
	}
};
