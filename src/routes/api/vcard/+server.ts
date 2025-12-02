import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { trackCardView } from '$lib/server/analytics';

/**
 * vCard Export API Route
 * 
 * Generates a vCard 3.0 file for contact import
 * Accessible without authentication for public cards
 * Tracks downloads in analytics for engagement metrics
 * 
 * Requirements: 16.3, 16.5
 */

// Note: Cannot use edge runtime because analytics tracking requires Node.js APIs
// The trackCardView function uses process events and timers that are not available in edge runtime
export const config = {
	runtime: 'nodejs20.x'
};

export const GET: RequestHandler = async ({ url, locals, request, getClientAddress }) => {
	const cardSlug = url.searchParams.get('slug');

	if (!cardSlug) {
		throw error(400, 'Missing slug parameter');
	}

	try {
		// Fetch card with user info
		const { data: card, error: cardError } = await locals.supabase
			.from('business_cards')
			.select(`
				*,
				personal_info:user_id (
					full_name,
					primary_email,
					secondary_email,
					mobile_number,
					phone_number,
					whatsapp_number,
					home_address,
					bio,
					profile_photo_url
				),
				professional_info:professional_info!professional_info_user_id_fkey (
					designation,
					company_name,
					company_website,
					office_email,
					office_phone,
					office_address
				)
			`)
			.eq('slug', cardSlug)
			.eq('is_active', true)
			.single();

		if (cardError || !card) {
			throw error(404, 'Card not found');
		}

		const personal = Array.isArray(card.personal_info) 
			? card.personal_info[0] 
			: card.personal_info;
		const professional = Array.isArray(card.professional_info) && card.professional_info.length > 0
			? card.professional_info[0]
			: null;

		// Format address for vCard
		const formatAddress = (addr: any): string => {
			if (!addr) return '';
			if (typeof addr === 'string') return addr;
			// vCard ADR format: ;;street;city;state;zip;country
			return `;;${addr.street || ''};${addr.city || ''};${addr.state || ''};${addr.zip || ''};${addr.country || ''}`;
		};

		// Generate vCard 3.0 format
		const vcardLines = [
			'BEGIN:VCARD',
			'VERSION:3.0',
			`FN:${personal?.full_name || ''}`,
			personal?.full_name ? `N:${personal.full_name.split(' ').reverse().join(';')}` : '',
			personal?.primary_email ? `EMAIL;TYPE=INTERNET,HOME:${personal.primary_email}` : '',
			personal?.secondary_email ? `EMAIL;TYPE=INTERNET:${personal.secondary_email}` : '',
			professional?.office_email ? `EMAIL;TYPE=INTERNET,WORK:${professional.office_email}` : '',
			personal?.mobile_number ? `TEL;TYPE=CELL:${personal.mobile_number}` : '',
			personal?.phone_number ? `TEL;TYPE=HOME:${personal.phone_number}` : '',
			professional?.office_phone ? `TEL;TYPE=WORK:${professional.office_phone}` : '',
			personal?.whatsapp_number ? `TEL;TYPE=CELL:${personal.whatsapp_number}` : '',
			professional?.company_name ? `ORG:${professional.company_name}` : '',
			professional?.designation ? `TITLE:${professional.designation}` : '',
			personal?.home_address ? `ADR;TYPE=HOME:${formatAddress(personal.home_address)}` : '',
			professional?.office_address ? `ADR;TYPE=WORK:${formatAddress(professional.office_address)}` : '',
			professional?.company_website ? `URL:${professional.company_website}` : '',
			personal?.bio ? `NOTE:${personal.bio.replace(/\n/g, '\\n')}` : '',
			personal?.profile_photo_url ? `PHOTO;VALUE=URL:${personal.profile_photo_url}` : '',
			`URL:${url.origin}/card/${cardSlug}`,
			'END:VCARD'
		];

		// Filter out empty lines
		const vcard = vcardLines.filter(line => line && !line.endsWith(':')).join('\r\n');

		// Track vCard download in analytics (non-blocking)
		// Use special referrer to indicate this is a download event
		trackCardView({
			cardId: card.id,
			ipAddress: getClientAddress(),
			userAgent: request.headers.get('user-agent'),
			referrer: 'vcard-download' // Special marker to identify download events
		}).catch(err => {
			// Log error but don't block the download
			console.error('Failed to track vCard download:', err);
		});

		return new Response(vcard, {
			headers: {
				'Content-Type': 'text/vcard; charset=utf-8',
				'Content-Disposition': `attachment; filename="${cardSlug}.vcf"`,
				'Cache-Control': 'public, max-age=3600'
			}
		});
	} catch (err) {
		console.error('vCard generation error:', err);
		throw error(500, 'Failed to generate vCard');
	}
};
