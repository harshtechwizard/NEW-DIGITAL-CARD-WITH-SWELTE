import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { BusinessCardWithUserInfo } from '$lib/types/database';
import { trackCardView } from '$lib/server/analytics';

/**
 * Server load function for public card page
 * 
 * This function:
 * - Fetches card by slug (no auth required)
 * - Verifies card is active
 * - Fetches all related user information
 * - Returns 404 if card not found or inactive
 * - Generates Open Graph metadata
 * - Tracks view asynchronously (doesn't block page load)
 * - Sets cache headers (5 minutes)
 * 
 * Requirements: 1.1, 1.2, 1.5, 7.2, 7.3, 15.3
 */

// Use edge runtime for optimal performance on public pages
export const config = {
	runtime: 'edge'
};

export const load: PageServerLoad = async ({ params, locals, request, getClientAddress, setHeaders, url }) => {
	const { slug } = params;

	// Set cache headers for public cards (5 minutes)
	setHeaders({
		'cache-control': 'public, max-age=300, s-maxage=300'
	});

	try {
		// Fetch card by slug first
		const { data: card, error: cardError } = await locals.supabase
			.from('business_cards')
			.select('*')
			.eq('slug', slug)
			.eq('is_active', true)
			.single();

		if (cardError || !card) {
			console.error('Card fetch error:', cardError);
			throw error(404, 'Card not found');
		}

		// Fetch related user information separately
		const userId = card.user_id;

		// Fetch personal info
		const { data: personalInfo } = await locals.supabase
			.from('personal_info')
			.select('*')
			.eq('user_id', userId)
			.maybeSingle();

		// Fetch professional info
		const { data: professionalInfo } = await locals.supabase
			.from('professional_info')
			.select('*')
			.eq('user_id', userId)
			.order('is_primary', { ascending: false });

		// Fetch education
		const { data: education } = await locals.supabase
			.from('education')
			.select('*')
			.eq('user_id', userId)
			.order('year_completed', { ascending: false });

		// Fetch awards
		const { data: awards } = await locals.supabase
			.from('awards')
			.select('*')
			.eq('user_id', userId)
			.order('date_received', { ascending: false });

		// Fetch products/services
		const { data: productsServices } = await locals.supabase
			.from('products_services')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false });

		// Fetch photo gallery
		const { data: photoGallery } = await locals.supabase
			.from('photo_gallery')
			.select('*')
			.eq('user_id', userId)
			.order('display_order', { ascending: true });

		// Generate Open Graph metadata for social media sharing
		// Extract professional info for richer descriptions
		const primaryProfessionalInfo = professionalInfo && professionalInfo.length > 0
			? professionalInfo[0]
			: null;

		// Create a rich description
		let description = personalInfo?.bio || 'View my digital business card and connect with me.';
		if (primaryProfessionalInfo?.designation && primaryProfessionalInfo?.company_name) {
			description = `${primaryProfessionalInfo.designation} at ${primaryProfessionalInfo.company_name}. ${description}`;
		}

		const ogData = {
			title: personalInfo?.full_name || 'Digital Business Card',
			description: description.slice(0, 200), // Limit to 200 chars for optimal display
			image: personalInfo?.profile_photo_url || primaryProfessionalInfo?.company_logo_url || `${url.origin}/default-og-image.png`,
			url: `${url.origin}/card/${slug}`,
			type: 'profile'
		};

		// Generate structured data (JSON-LD) for SEO
		const structuredData = generateStructuredData(
			{ ...card, professional_info: professionalInfo }, 
			personalInfo, 
			url.origin
		);

		// Track view asynchronously (don't block page load)
		// Using buffered analytics ingestion for better performance
		// Requirements: 13.1, 13.6
		trackCardView({
			cardId: card.id,
			ipAddress: getClientAddress(),
			userAgent: request.headers.get('user-agent'),
			referrer: request.headers.get('referer')
		}).catch(err => {
			// Log error but don't fail the page load
			console.error('Analytics tracking failed:', err);
		});

		return {
			card: {
				...card,
				personal_info: personalInfo,
				professional_info: professionalInfo || [],
				education: education || [],
				awards: awards || [],
				products_services: productsServices || [],
				photo_gallery: photoGallery || []
			} as BusinessCardWithUserInfo,
			ogData,
			structuredData
		};
	} catch (err) {
		// If it's already a SvelteKit error, rethrow it
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		// Otherwise, log and return 500
		console.error('Unexpected error loading card:', err);
		throw error(500, 'Failed to load card');
	}
};

/**
 * Generate JSON-LD structured data for SEO
 * Helps search engines understand the content and display rich snippets
 * Supports both Person and Organization schemas based on card type
 * 
 * Requirements: 1.2
 */
function generateStructuredData(card: any, personalInfo: any, origin: string) {
	const professionalInfo = Array.isArray(card.professional_info) && card.professional_info.length > 0
		? card.professional_info[0]
		: null;

	// Determine if this is a person or organization card
	const isProfessional = professionalInfo && professionalInfo.company_name;

	if (isProfessional) {
		// Organization schema for professional cards
		const organizationData: any = {
			'@context': 'https://schema.org',
			'@type': 'Organization',
			name: professionalInfo.company_name,
			url: professionalInfo.company_website || `${origin}/card/${card.slug}`,
			description: personalInfo?.bio || `${professionalInfo.company_name} - ${professionalInfo.designation || 'Professional Services'}`,
			logo: professionalInfo.company_logo_url,
			contactPoint: {
				'@type': 'ContactPoint',
				telephone: professionalInfo.office_phone || personalInfo?.mobile_number,
				email: professionalInfo.office_email || personalInfo?.primary_email,
				contactType: 'customer service',
				availableLanguage: 'en'
			}
		};

		// Add address if available
		if (professionalInfo.office_address) {
			organizationData.address = {
				'@type': 'PostalAddress',
				streetAddress: professionalInfo.office_address.street,
				addressLocality: professionalInfo.office_address.city,
				addressRegion: professionalInfo.office_address.state,
				postalCode: professionalInfo.office_address.zip,
				addressCountry: professionalInfo.office_address.country
			};
		}

		// Add employee information if available
		if (personalInfo) {
			const employeeData: any = {
				'@type': 'Person',
				name: personalInfo.full_name,
				jobTitle: professionalInfo.designation,
				email: personalInfo.primary_email,
				telephone: personalInfo.mobile_number,
				image: personalInfo.profile_photo_url,
				worksFor: {
					'@type': 'Organization',
					name: professionalInfo.company_name
				}
			};

			// Add social media profiles
			const socialProfiles = [
				personalInfo.linkedin_url,
				personalInfo.facebook_url,
				personalInfo.instagram_url
			].filter(Boolean);

			if (socialProfiles.length > 0) {
				employeeData.sameAs = socialProfiles;
			}

			organizationData.employee = employeeData;
		}

		// Add social media profiles for organization
		const orgSocialProfiles = [
			professionalInfo.linkedin_url,
			professionalInfo.facebook_url,
			professionalInfo.instagram_url
		].filter(Boolean);

		if (orgSocialProfiles.length > 0) {
			organizationData.sameAs = orgSocialProfiles;
		}

		// Add opening hours if available
		if (professionalInfo.office_opening_time && professionalInfo.office_closing_time && professionalInfo.office_days) {
			organizationData.openingHoursSpecification = {
				'@type': 'OpeningHoursSpecification',
				dayOfWeek: professionalInfo.office_days,
				opens: professionalInfo.office_opening_time,
				closes: professionalInfo.office_closing_time
			};
		}

		return organizationData;
	} else {
		// Person schema for personal cards
		const personData: any = {
			'@context': 'https://schema.org',
			'@type': 'Person',
			name: personalInfo?.full_name,
			email: personalInfo?.primary_email,
			telephone: personalInfo?.mobile_number,
			image: personalInfo?.profile_photo_url,
			url: `${origin}/card/${card.slug}`,
			description: personalInfo?.bio
		};

		// Add social media profiles
		const socialProfiles = [
			personalInfo?.linkedin_url,
			personalInfo?.facebook_url,
			personalInfo?.instagram_url
		].filter(Boolean);

		if (socialProfiles.length > 0) {
			personData.sameAs = socialProfiles;
		}

		// Add address if available
		if (personalInfo?.home_address) {
			personData.address = {
				'@type': 'PostalAddress',
				streetAddress: personalInfo.home_address.street,
				addressLocality: personalInfo.home_address.city,
				addressRegion: personalInfo.home_address.state,
				postalCode: personalInfo.home_address.zip,
				addressCountry: personalInfo.home_address.country
			};
		}

		// Add additional contact methods
		if (personalInfo?.whatsapp_number) {
			personData.contactPoint = {
				'@type': 'ContactPoint',
				telephone: personalInfo.whatsapp_number,
				contactType: 'personal',
				availableLanguage: 'en'
			};
		}

		return personData;
	}
}


