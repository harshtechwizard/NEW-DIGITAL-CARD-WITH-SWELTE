import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		seoData: {
			title: 'About Us - Digital Card Studio',
			description: 'Learn about Digital Card Studio, our mission to revolutionize professional networking with digital business cards, and the team behind the platform.',
			url: 'https://digitalcardstudio.com/about',
			type: 'website'
		}
	};
};
