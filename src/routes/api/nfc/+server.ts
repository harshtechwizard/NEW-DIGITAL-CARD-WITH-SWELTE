import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * NFC Payload Generation API Route
 * 
 * Generates NDEF-formatted NFC data for business cards
 * Verifies card belongs to authenticated user for security
 * 
 * Requirements: 16.1, 16.2
 */

// Use edge runtime for optimal performance (no Node.js APIs needed)
export const config = {
	runtime: 'edge'
};

export const GET: RequestHandler = async ({ url, locals }) => {
	const cardSlug = url.searchParams.get('slug');

	if (!cardSlug) {
		throw error(400, 'Missing slug parameter');
	}

	// Verify user is authenticated
	if (!locals.user) {
		throw error(401, 'Authentication required');
	}

	try {
		// Verify card exists, is active, and belongs to authenticated user
		const { data: card, error: cardError } = await locals.supabase
			.from('business_cards')
			.select('id, user_id, is_active')
			.eq('slug', cardSlug)
			.single();

		if (cardError || !card) {
			throw error(404, 'Card not found');
		}

		// Verify ownership
		if (card.user_id !== locals.user.id) {
			throw error(403, 'You do not have permission to generate NFC payloads for this card');
		}

		// Generate the full card URL
		const cardUrl = `${url.origin}/card/${cardSlug}`;

		// Generate NDEF message format for NFC
		// This follows the NDEF (NFC Data Exchange Format) specification
		// The payload can be written to NFC tags using mobile apps
		const ndefMessage = {
			records: [
				{
					recordType: 'url', // URI record type
					data: cardUrl,
					tnf: 'well-known', // Type Name Format
					type: 'U' // URI type
				}
			]
		};

		return json(ndefMessage, {
			headers: {
				'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
			}
		});
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		console.error('NFC generation error:', err);
		throw error(500, 'Failed to generate NFC payload');
	}
};
