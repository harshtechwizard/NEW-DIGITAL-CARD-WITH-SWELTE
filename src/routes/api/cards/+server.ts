/**
 * Business Cards API Routes
 * Handles CRUD operations for business cards
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { businessCardSchema } from '$lib/server/validation';
import { generateUniqueSlugAtomic } from '$lib/server/slug';

// Use edge runtime for optimal performance (no Node.js APIs needed)
export const config = {
	runtime: 'edge'
};

/**
 * POST /api/cards
 * Create a new business card
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
			return json(
				{
					error: 'Validation failed',
					details: validation.error.issues
				},
				{ status: 400 }
			);
		}

		const { name, template_type, fields_config, design_config } = validation.data;

		// Generate unique slug server-side
		let slug: string;
		try {
			slug = await generateUniqueSlugAtomic(locals.supabase, name);
		} catch (err) {
			console.error('Slug generation error:', err);
			return json(
				{
					error: 'Failed to generate unique URL for card',
					details: err instanceof Error ? err.message : 'Unknown error'
				},
				{ status: 500 }
			);
		}

		// Insert card into database with atomic operation
		const { data: card, error: insertError } = await locals.supabase
			.from('business_cards')
			.insert({
				user_id: locals.user.id,
				name,
				slug,
				template_type,
				fields_config: fields_config || {},
				design_config: design_config || {},
				is_active: true,
				is_default: false
			})
			.select()
			.single();

		if (insertError) {
			console.error('Card creation error:', insertError);

			// Check for unique constraint violation
			if (insertError.code === '23505') {
				// Slug conflict - retry with new slug
				return json(
					{
						error: 'URL conflict detected. Please try again.',
						details: 'The generated URL is already in use'
					},
					{ status: 409 }
				);
			}

			return json(
				{
					error: 'Failed to create card',
					details: insertError.message
				},
				{ status: 500 }
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
	} catch (err) {
		console.error('Unexpected error in card creation:', err);
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
 * Update an existing business card
 */
export const PATCH: RequestHandler = async ({ request, locals }) => {
	// Check authentication
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		// Parse request body
		const body = await request.json();
		const { id, name, template_type, fields_config, design_config, is_active } = body;

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
			.select('user_id')
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
					error: 'You do not have permission to update this card'
				},
				{ status: 403 }
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

		// Build update object (only include provided fields)
		const updateData: any = {};
		if (name !== undefined) updateData.name = name;
		if (template_type !== undefined) updateData.template_type = template_type;
		if (fields_config !== undefined) updateData.fields_config = fields_config;
		if (design_config !== undefined) updateData.design_config = design_config;
		if (is_active !== undefined) updateData.is_active = is_active;

		// Update card in database
		const { data: updatedCard, error: updateError } = await locals.supabase
			.from('business_cards')
			.update(updateData)
			.eq('id', id)
			.select()
			.single();

		if (updateError) {
			console.error('Card update error:', updateError);
			return json(
				{
					error: 'Failed to update card',
					details: updateError.message
				},
				{ status: 500 }
			);
		}

		// Return updated card
		return json(
			{
				success: true,
				card: updatedCard
			},
			{ status: 200 }
		);
	} catch (err) {
		console.error('Unexpected error in card update:', err);
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
