/**
 * Business Cards API Routes
 * Handles CRUD operations for business cards with race condition protection
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { businessCardSchema } from '$lib/server/validation';
import { slugify } from '$lib/server/slug';
import { retryDatabaseOperation } from '$lib/server/retry';

// Use edge runtime for optimal performance (no Node.js APIs needed)
export const config = {
	runtime: 'edge'
};

/**
 * POST /api/cards
 * Create a new business card with atomic slug generation
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	// Check authentication
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		// Parse request body
		const body = await request.json();

		// Validate input
		const validation = businessCardSchema.safeParse(body);
		if (!validation.success) {
			console.error('❌ Card validation failed:', {
				body,
				errors: validation.error.issues
			});
			return json(
				{
					error: 'Validation failed',
					details: validation.error.issues,
					message: validation.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
				},
				{ status: 400 }
			);
		}

		const { name, template_type, fields_config, design_config } = validation.data;

		// Generate base slug
		const baseSlug = slugify(name);
		if (!baseSlug) {
			return json(
				{
					error: 'Invalid card name',
					details: 'Cannot generate URL from card name'
				},
				{ status: 400 }
			);
		}

		// Use database function for atomic card creation with slug generation
		// This ensures slug uniqueness is checked and card is created in a single transaction
		const result = await retryDatabaseOperation(async () => {
			const { data, error: rpcError } = await locals.supabase.rpc(
				'create_business_card_atomic',
				{
					p_user_id: locals.user!.id,
					p_name: name,
					p_base_slug: baseSlug,
					p_template_type: template_type,
					p_fields_config: fields_config || {},
					p_design_config: design_config || {}
				}
			);

			if (rpcError) {
				console.error('Card creation error:', rpcError);
				throw rpcError;
			}

			return data;
		}, 'create business card');

		if (!result || result.length === 0) {
			return json(
				{
					error: 'Failed to create card',
					details: 'No data returned from database'
				},
				{ status: 500 }
			);
		}

		const createdCard = result[0];

		// Fetch full card data
		const { data: card, error: fetchError } = await locals.supabase
			.from('business_cards')
			.select('*')
			.eq('id', createdCard.id)
			.single();

		if (fetchError || !card) {
			console.error('Failed to fetch created card:', fetchError);
			// Card was created but we couldn't fetch it - still return success
			return json(
				{
					success: true,
					card: createdCard
				},
				{ status: 201 }
			);
		}

		// Return created card
		return json(
			{
				success: true,
				card
			},
			{ status: 201 }
		);
	} catch (err: any) {
		console.error('Unexpected error in card creation:', err);
		
		// Handle specific error cases
		if (err.message?.includes('Unable to generate unique slug')) {
			return json(
				{
					error: 'Unable to generate unique URL',
					details: 'Please try a different card name'
				},
				{ status: 409 }
			);
		}

		return json(
			{
				error: 'Internal server error',
				details: err instanceof Error ? err.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};

/**
 * PATCH /api/cards
 * Update an existing business card with optimistic locking
 */
export const PATCH: RequestHandler = async ({ request, locals }) => {
	// Check authentication
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		// Parse request body
		const body = await request.json();
		const { id, version, name, template_type, fields_config, design_config, is_active } = body;

		// Validate card ID and version
		if (!id) {
			return json(
				{
					error: 'Card ID is required'
				},
				{ status: 400 }
			);
		}

		if (version === undefined || version === null) {
			return json(
				{
					error: 'Version is required for optimistic locking',
					details: 'Include the current version number to prevent conflicts'
				},
				{ status: 400 }
			);
		}

		// Validate update data (partial validation)
		const updateSchema = z.object({
			name: z.string().min(1).max(100).optional(),
			template_type: z.enum([
				'personal-small',
				'personal-detailed',
				'professional-small',
				'professional-detailed',
				'custom'
			]).optional(),
			fields_config: z.record(z.string(), z.any()).optional(),
			design_config: z.object({
				primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
				fontFamily: z.string().optional(),
				layout: z.enum(['vertical', 'horizontal']).optional()
			}).optional(),
			is_active: z.boolean().optional()
		});

		const validation = updateSchema.safeParse({
			name,
			template_type,
			fields_config,
			design_config,
			is_active
		});

		if (!validation.success) {
			return json(
				{
					error: 'Validation failed',
					details: validation.error.issues
				},
				{ status: 400 }
			);
		}

		// Use database function for optimistic locking update
		const result = await retryDatabaseOperation(async () => {
			const { data, error: rpcError } = await locals.supabase.rpc(
				'update_business_card_optimistic',
				{
					p_card_id: id,
					p_user_id: locals.user!.id,
					p_expected_version: version,
					p_name: name || null,
					p_template_type: template_type || null,
					p_fields_config: fields_config || null,
					p_design_config: design_config || null,
					p_is_active: is_active !== undefined ? is_active : null
				}
			);

			if (rpcError) {
				console.error('Card update error:', rpcError);
				throw rpcError;
			}

			return data;
		}, 'update business card');

		if (!result || result.length === 0) {
			return json(
				{
					error: 'Update failed',
					details: 'No result returned from database'
				},
				{ status: 500 }
			);
		}

		const updateResult = result[0];

		// Check if update was successful
		if (!updateResult.success) {
			// Version conflict
			if (updateResult.message.includes('Version conflict')) {
				return json(
					{
						error: 'Version conflict',
						message: updateResult.message,
						currentVersion: updateResult.new_version,
						details: 'The card was modified by another session. Please refresh and try again.'
					},
					{ status: 409 }
				);
			}

			// Card not found or access denied
			return json(
				{
					error: updateResult.message
				},
				{ status: 404 }
			);
		}

		// Fetch updated card
		const { data: updatedCard, error: fetchError } = await locals.supabase
			.from('business_cards')
			.select('*')
			.eq('id', id)
			.single();

		if (fetchError || !updatedCard) {
			console.error('Failed to fetch updated card:', fetchError);
			return json(
				{
					success: true,
					message: 'Card updated successfully',
					version: updateResult.new_version
				},
				{ status: 200 }
			);
		}

		// Return updated card
		return json(
			{
				success: true,
				card: updatedCard,
				message: updateResult.message
			},
			{ status: 200 }
		);
	} catch (err: any) {
		console.error('Unexpected error in card update:', err);

		// Handle version conflict errors
		if (err.message?.includes('version conflict') || err.message?.includes('Version conflict')) {
			return json(
				{
					error: 'Version conflict',
					details: 'The card was modified by another session. Please refresh and try again.'
				},
				{ status: 409 }
			);
		}

		return json(
			{
				error: 'Internal server error',
				details: err instanceof Error ? err.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};

/**
 * DELETE /api/cards
 * Delete a business card
 */
export const DELETE: RequestHandler = async ({ request, locals }) => {
	// Check authentication
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		// Parse request body
		const body = await request.json();
		const { id } = body;

		// Validate card ID
		if (!id) {
			return json(
				{
					error: 'Card ID is required'
				},
				{ status: 400 }
			);
		}

		// Fetch existing card to verify ownership
		const { data: existingCard, error: fetchError } = await locals.supabase
			.from('business_cards')
			.select('user_id, slug')
			.eq('id', id)
			.single();

		if (fetchError || !existingCard) {
			return json(
				{
					error: 'Card not found'
				},
				{ status: 404 }
			);
		}

		// Verify ownership
		if (existingCard.user_id !== locals.user.id) {
			return json(
				{
					error: 'You do not have permission to delete this card'
				},
				{ status: 403 }
			);
		}

		// Delete card from database
		// Note: Analytics will be cascade deleted due to foreign key constraint
		const { error: deleteError } = await locals.supabase
			.from('business_cards')
			.delete()
			.eq('id', id);

		if (deleteError) {
			console.error('Card deletion error:', deleteError);
			return json(
				{
					error: 'Failed to delete card',
					details: deleteError.message
				},
				{ status: 500 }
			);
		}

		// Return success response
		return json(
			{
				success: true,
				message: 'Card deleted successfully'
			},
			{ status: 200 }
		);
	} catch (err) {
		console.error('Unexpected error in card deletion:', err);
		return json(
			{
				error: 'Internal server error',
				details: err instanceof Error ? err.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
