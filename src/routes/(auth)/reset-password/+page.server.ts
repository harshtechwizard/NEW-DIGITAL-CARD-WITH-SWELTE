import { fail } from '@sveltejs/kit';
import { passwordResetRequestSchema } from '$lib/server/validation';
import { rateLimit } from '$lib/server/rate-limiter';
import type { Actions, PageServerLoad } from './$types';

/**
 * Load function
 */
export const load: PageServerLoad = async () => {
	return {};
};

/**
 * Password reset request form action
 * 
 * Security features:
 * - Rate limiting (3 attempts per 15 minutes)
 * - Server-side validation
 * - Doesn't reveal if email exists (security best practice)
 */
export const actions: Actions = {
	default: async ({ request, locals, getClientAddress }) => {
		const ip = getClientAddress();
		
		// Rate limiting: 3 attempts per 15 minutes
		const rateLimitResult = await rateLimit(ip, 'password-reset', 3, 900);
		
		if (!rateLimitResult.allowed) {
			const minutes = Math.ceil(rateLimitResult.retryAfter / 60);
			return fail(429, {
				error: `Too many reset attempts. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`,
				email: ''
			});
		}
		
		// Parse form data
		const formData = await request.formData();
		const email = formData.get('email')?.toString();
		
		// Validate input
		const validation = passwordResetRequestSchema.safeParse({ email });
		
		if (!validation.success) {
			const firstError = validation.error.issues[0];
			return fail(400, {
				error: firstError?.message || 'Validation failed',
				email: email || ''
			});
		}
		
		// Get Supabase client from locals
		const supabase = locals.supabase;
		
		// Send password reset email
		await supabase.auth.resetPasswordForEmail(
			validation.data.email,
			{
				redirectTo: `${new URL(request.url).origin}/reset-password/confirm`
			}
		);
		
		// Always return success to prevent email enumeration
		// (Don't reveal if email exists or not)
		return {
			success: true,
			message: 'If an account exists with this email, you will receive a password reset link shortly.',
			email: validation.data.email
		};
	}
};
