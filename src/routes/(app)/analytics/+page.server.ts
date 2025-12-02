/**
 * Analytics Dashboard Server Load
 * 
 * This module fetches analytics data for the authenticated user's business cards.
 * 
 * Features:
 * - Fetch user's cards
 * - Fetch analytics for user's cards (configurable date range)
 * - Aggregate views by day
 * - Calculate total views and unique IPs
 * - Group by referrer for top sources
 * - Calculate views per card
 * 
 * Requirements: 7.1, 13.4, 15.4
 */

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * Aggregated analytics data structure
 */
interface DailyViewData {
	date: string;
	views: number;
}

interface CardViewData {
	cardId: string;
	cardName: string;
	slug: string;
	views: number;
	uniqueVisitors: number;
}

interface ReferrerData {
	referrer: string;
	views: number;
}

interface RecentView {
	id: string;
	viewedAt: string;
	referrer: string | null;
	userAgent: string | null;
	cardName: string;
}

/**
 * Load analytics data for the authenticated user
 */
export const load: PageServerLoad = async ({ locals, url }) => {
	// Ensure user is authenticated
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	// Get date range from query params (default: 30 days)
	const daysParam = url.searchParams.get('days');
	const days = daysParam ? parseInt(daysParam, 10) : 30;
	
	// Validate days parameter
	const validDays = [7, 30, 90, 365];
	const selectedDays = validDays.includes(days) ? days : 30;

	// Calculate date range
	const endDate = new Date();
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - selectedDays);

	try {
		// Fetch user's business cards
		const { data: cards, error: cardsError } = await locals.supabase
			.from('business_cards')
			.select('id, name, slug, is_active, created_at')
			.eq('user_id', locals.user.id)
			.order('created_at', { ascending: false });

		if (cardsError) {
			console.error('Failed to fetch cards:', cardsError);
			return {
				cards: [],
				analytics: [],
				dailyViews: [],
				cardViews: [],
				topReferrers: [],
				recentViews: [],
				totalViews: 0,
				uniqueVisitors: 0,
				selectedDays,
				error: 'Failed to load cards'
			};
		}

		// If user has no cards, return empty analytics
		if (!cards || cards.length === 0) {
			return {
				cards: [],
				analytics: [],
				dailyViews: [],
				cardViews: [],
				topReferrers: [],
				recentViews: [],
				totalViews: 0,
				uniqueVisitors: 0,
				selectedDays,
				error: null
			};
		}

		const cardIds = cards.map((c) => c.id);

		// Fetch analytics for user's cards within date range
		const { data: analytics, error: analyticsError } = await locals.supabase
			.from('card_analytics')
			.select('id, card_id, viewed_at, ip_address, user_agent, referrer')
			.in('card_id', cardIds)
			.gte('viewed_at', startDate.toISOString())
			.lte('viewed_at', endDate.toISOString())
			.order('viewed_at', { ascending: false });

		if (analyticsError) {
			console.error('Failed to fetch analytics:', analyticsError);
			return {
				cards,
				analytics: [],
				dailyViews: [],
				cardViews: [],
				topReferrers: [],
				recentViews: [],
				totalViews: 0,
				uniqueVisitors: 0,
				selectedDays,
				error: 'Failed to load analytics data'
			};
		}

		const analyticsData = analytics || [];

		// Calculate total views
		const totalViews = analyticsData.length;

		// Calculate unique visitors (based on anonymized IP addresses)
		const uniqueIps = new Set(
			analyticsData.map((a) => a.ip_address).filter((ip): ip is string => ip !== null)
		);
		const uniqueVisitors = uniqueIps.size;

		// Aggregate views by day
		const dailyViewsMap = new Map<string, number>();
		
		// Initialize all days in range with 0 views
		for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
			const dateKey = d.toISOString().split('T')[0];
			if (dateKey) {
				dailyViewsMap.set(dateKey, 0);
			}
		}
		
		// Count views per day
		for (const event of analyticsData) {
			const date = new Date(event.viewed_at).toISOString().split('T')[0];
			if (date) {
				dailyViewsMap.set(date, (dailyViewsMap.get(date) || 0) + 1);
			}
		}

		const dailyViews: DailyViewData[] = Array.from(dailyViewsMap.entries())
			.map(([date, views]) => ({ date, views }))
			.sort((a, b) => a.date.localeCompare(b.date));

		// Aggregate views by card
		const cardViewsMap = new Map<string, { views: number; uniqueIps: Set<string> }>();
		
		for (const event of analyticsData) {
			if (!cardViewsMap.has(event.card_id)) {
				cardViewsMap.set(event.card_id, { views: 0, uniqueIps: new Set() });
			}
			const cardData = cardViewsMap.get(event.card_id)!;
			cardData.views++;
			if (event.ip_address) {
				cardData.uniqueIps.add(event.ip_address);
			}
		}

		const cardViews: CardViewData[] = Array.from(cardViewsMap.entries())
			.map(([cardId, data]) => {
				const card = cards.find((c) => c.id === cardId);
				return {
					cardId,
					cardName: card?.name || 'Unknown Card',
					slug: card?.slug || '',
					views: data.views,
					uniqueVisitors: data.uniqueIps.size
				};
			})
			.sort((a, b) => b.views - a.views);

		// Aggregate views by referrer (top 10)
		const referrerMap = new Map<string, number>();
		
		for (const event of analyticsData) {
			const referrer = event.referrer || 'Direct';
			referrerMap.set(referrer, (referrerMap.get(referrer) || 0) + 1);
		}

		const topReferrers: ReferrerData[] = Array.from(referrerMap.entries())
			.map(([referrer, views]) => ({ referrer, views }))
			.sort((a, b) => b.views - a.views)
			.slice(0, 10);

		// Get recent views (last 20)
		const recentViews: RecentView[] = analyticsData.slice(0, 20).map((event) => {
			const card = cards.find((c) => c.id === event.card_id);
			return {
				id: event.id,
				viewedAt: event.viewed_at,
				referrer: event.referrer,
				userAgent: event.user_agent,
				cardName: card?.name || 'Unknown Card'
			};
		});

		return {
			cards,
			analytics: analyticsData,
			dailyViews,
			cardViews,
			topReferrers,
			recentViews,
			totalViews,
			uniqueVisitors,
			selectedDays,
			error: null
		};
	} catch (err) {
		console.error('Unexpected error loading analytics:', err);
		return {
			cards: [],
			analytics: [],
			dailyViews: [],
			cardViews: [],
			topReferrers: [],
			recentViews: [],
			totalViews: 0,
			uniqueVisitors: 0,
			selectedDays,
			error: 'An unexpected error occurred'
		};
	}
};
