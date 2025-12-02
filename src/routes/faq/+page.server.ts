import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		seoData: {
			title: 'FAQ - Frequently Asked Questions | Digital Card Studio',
			description: 'Find answers to common questions about Digital Card Studio, including how to create cards, share them, track analytics, and more.',
			url: 'https://digitalcardstudio.com/faq',
			type: 'website'
		}
	};
};
