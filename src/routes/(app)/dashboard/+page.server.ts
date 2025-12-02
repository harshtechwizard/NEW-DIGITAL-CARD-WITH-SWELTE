import type { PageServerLoad } from './$types';

/**
 * Dashboard page load function
 */
export const load: PageServerLoad = async ({ locals }) => {
	return {
		user: locals.user
	};
};
