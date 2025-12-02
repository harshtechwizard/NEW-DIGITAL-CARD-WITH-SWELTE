import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Load demo card data for preview
	// Using a public demo card or creating mock data
	const demoCard = {
		id: 'demo',
		slug: 'demo-card',
		name: 'Demo Business Card',
		template_type: 'professional-small',
		is_active: true,
		personal_info: {
			full_name: 'Alex Johnson',
			primary_email: 'alex@example.com',
			mobile_number: '+1 (555) 123-4567',
			bio: 'Digital marketing specialist helping businesses grow their online presence.',
			profile_photo_url: null,
			linkedin_url: 'https://linkedin.com/in/alexjohnson',
			instagram_url: null,
			facebook_url: null
		},
		professional_info: {
			designation: 'Senior Marketing Manager',
			company_name: 'TechCorp Solutions',
			company_website: 'https://techcorp.example.com',
			office_email: 'alex.johnson@techcorp.example.com',
			office_phone: '+1 (555) 987-6543'
		}
	};

	// SEO meta tags
	const seoData = {
		title: 'Digital Card Studio - Create Professional Digital Business Cards',
		description:
			'Create stunning digital business cards in minutes. Share via QR code, NFC, or link. Track engagement and never run out of cards.',
		url: 'https://digitalcardstudio.com',
		image: 'https://digitalcardstudio.com/og-image.png',
		type: 'website'
	};

	// Structured data (JSON-LD) for SEO
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: 'Digital Card Studio',
		description: seoData.description,
		url: seoData.url,
		applicationCategory: 'BusinessApplication',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		featureList: [
			'Create digital business cards',
			'QR code generation',
			'NFC support',
			'Analytics tracking',
			'Custom branding'
		]
	};

	return {
		demoCard,
		seoData,
		structuredData,
		user: locals.user // Pass user info if logged in
	};
};
