import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import QRCode from 'qrcode';

/**
 * QR Code Generation API Route
 * 
 * Generates QR codes for business cards in PNG or SVG format
 * Verifies card belongs to authenticated user for security
 * 
 * Requirements: 16.1, 16.2, 16.4
 */

// Use edge runtime for optimal performance (no Node.js APIs needed)
export const config = {
	runtime: 'edge'
};

export const GET: RequestHandler = async ({ url, locals }) => {
	const cardSlug = url.searchParams.get('slug');
	const format = url.searchParams.get('format') || 'png'; // png or svg

	if (!cardSlug) {
		throw error(400, 'Missing slug parameter');
	}

	if (!['png', 'svg'].includes(format)) {
		throw error(400, 'Invalid format. Use "png" or "svg"');
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
			throw error(403, 'You do not have permission to generate QR codes for this card');
		}

		// Generate the full card URL
		const cardUrl = `${url.origin}/card/${cardSlug}`;

		// Generate QR code based on format
		if (format === 'svg') {
			const svg = await QRCode.toString(cardUrl, {
				type: 'svg',
				width: 300,
				margin: 2,
				color: {
					dark: '#000000',
					light: '#FFFFFF'
				}
			});

			return new Response(svg, {
				headers: {
					'Content-Type': 'image/svg+xml',
					'Cache-Control': 'public, max-age=31536000, immutable' // 1 year
				}
			});
		} else {
			const png = await QRCode.toBuffer(cardUrl, {
				width: 300,
				margin: 2,
				color: {
					dark: '#000000',
					light: '#FFFFFF'
				}
			});

			return new Response(new Uint8Array(png), {
				headers: {
					'Content-Type': 'image/png',
					'Cache-Control': 'public, max-age=31536000, immutable' // 1 year
				}
			});
		}
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		console.error('QR generation error:', err);
		throw error(500, 'Failed to generate QR code');
	}
};
