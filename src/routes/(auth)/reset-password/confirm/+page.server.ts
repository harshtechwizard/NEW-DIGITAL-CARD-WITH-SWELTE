import { fail, redirect } from '@sveltejs/kit';
import { passwordResetConfirmSchema } from '$lib/server/validation';
import type { Actions, PageServerLoad } from './$types';

/**
 * Load function - verify access token is present
 */
export const load: PageServerLoad = async ({ url }) => {
	// Check if we have the required tokens in the URL
	const accessToken = url.searchParams.get('access_token');
	const refreshToken = url.searchParams.get('refresh_token');
	
	if (!accessToken || !refreshToken) {
		throw redirect(303, '/reset-password?error=invalid_link');
	}
	
	return {};
};

/**
 * Password reset confirmation form action
 * 
 * Updates the user's password using the token from the email link
 */
export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		// Parse form data
		const formData = await request.formData();
		const password = formData.get('password')?.toString();
		const confirmPassword = formData.get('confirmPassword')?.toString();
		
		// Validate input
		const validation = passwordResetConfirmSchema.safeParse({ 
			password, 
			confirmPassword 
		});
		
		if (!validation.success) {
			const firstError = validation.error.errors[0];
			return fail(400, {
				error: firstError?.message || 'Validation failed'
			});
		}
		
		// Get tokens from URL (they should be present from the email link)
		const accessToken = url.searchParams.get('access_token');
		const refreshToken = url.searchParams.get('refresh_token');
		
		if (!accessToken || !refreshToken) {
			return fail(400, {
				error: 'Invalid or expired reset link. Please request a new password reset.'
			});
		}
		
		// Get Supabase client from locals
		const supabase = locals.supabase;
		
		// Set the session using the tokens from the URL
		const { error: sessionError } = await supabase.auth.setSession({
			access_token: accessToken,
			refresh_token: refreshToken
		});
		
		if (sessionError) {
			return fail(400, {
				error: 'Invalid or expired reset link. Please request a new password reset.'
			});
		}
		
		// Update the password
		const { error: updateError } = await supabase.auth.updateUser({
			password: validation.data.password
		});
		
		if (updateError) {
			return fail(400, {
				error: 'Failed to reset password. Please try again.'
			});
		}
		
		// Sign out the user (they'll need to sign in with new password)
		await supabase.auth.signOut();
		
		// Return success
		return {
			success: true
		};
	}
};
