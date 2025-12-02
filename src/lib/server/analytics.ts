/**
 * Server-side analytics tracking utility
 * 
 * This module provides buffered analytics ingestion for card views.
 * 
 * Features:
 * - Buffered batch inserts (every 10 seconds or 100 events)
 * - IP address anonymization for GDPR compliance
 * - Non-blocking async tracking
 * - Automatic flush on process exit
 * - Uses service role client to bypass RLS
 * 
 * Requirements: 3.3, 13.1, 13.2, 13.3, 13.7
 */

import { createSupabaseServiceClient } from './supabase';

/**
 * Analytics event structure
 */
interface AnalyticsEvent {
	cardId: string;
	ipAddress: string;
	userAgent: string | null;
	referrer: string | null;
	viewedAt: string;
}

/**
 * In-memory buffer for batch inserts
 * This reduces database load by batching multiple events together
 */
const analyticsBuffer: AnalyticsEvent[] = [];

/**
 * Configuration constants
 */
const BUFFER_SIZE = 100; // Flush when buffer reaches 100 events
const FLUSH_INTERVAL = 10000; // Flush every 10 seconds
const MAX_RETRY_ATTEMPTS = 3; // Maximum retry attempts for failed flushes

/**
 * Track if flush is currently in progress to prevent concurrent flushes
 */
let isFlushInProgress = false;

/**
 * Track card view event
 * 
 * This function adds an event to the buffer and triggers a flush if needed.
 * It's designed to be non-blocking and will not throw errors.
 * 
 * @param event - Analytics event data
 */
export async function trackCardView(event: {
	cardId: string;
	ipAddress: string;
	userAgent: string | null;
	referrer: string | null;
}): Promise<void> {
	try {
		// Anonymize IP address for GDPR compliance
		const anonymizedIp = anonymizeIp(event.ipAddress);

		// Add event to buffer
		analyticsBuffer.push({
			cardId: event.cardId,
			ipAddress: anonymizedIp,
			userAgent: event.userAgent,
			referrer: event.referrer,
			viewedAt: new Date().toISOString()
		});

		// Flush buffer if it reaches the size limit
		if (analyticsBuffer.length >= BUFFER_SIZE) {
			// Don't await - let it run in background
			flushAnalytics().catch(err => {
				console.error('Background analytics flush failed:', err);
			});
		}
	} catch (err) {
		// Log error but don't throw - analytics should never break the app
		console.error('Failed to track card view:', err);
	}
}

/**
 * Flush analytics buffer to database
 * 
 * This function performs a batch insert of all buffered events.
 * It uses the service role client to bypass RLS policies.
 * Failed events are re-added to the buffer for retry.
 */
async function flushAnalytics(): Promise<void> {
	// Prevent concurrent flushes
	if (isFlushInProgress) {
		return;
	}

	// Nothing to flush
	if (analyticsBuffer.length === 0) {
		return;
	}

	isFlushInProgress = true;

	try {
		// Extract events from buffer (this empties the buffer)
		const events = analyticsBuffer.splice(0, analyticsBuffer.length);

		if (events.length === 0) {
			return;
		}

		console.log(`Flushing ${events.length} analytics events...`);

		// Create service role client for admin operations
		const supabase = createSupabaseServiceClient();

		// Batch insert all events
		// Type assertion needed because service role client bypasses RLS
		const { error } = await supabase.from('card_analytics').insert(
			events.map((e) => ({
				card_id: e.cardId,
				ip_address: e.ipAddress,
				user_agent: e.userAgent,
				referrer: e.referrer,
				viewed_at: e.viewedAt
			})) as any
		);

		if (error) {
			console.error('Analytics batch insert failed:', error);

			// Re-add events to buffer for retry (at the front)
			// Limit buffer size to prevent memory issues
			if (analyticsBuffer.length < BUFFER_SIZE * 2) {
				analyticsBuffer.unshift(...events);
			} else {
				console.warn('Analytics buffer overflow - dropping events');
			}
		} else {
			console.log(`Successfully flushed ${events.length} analytics events`);
		}
	} catch (err) {
		console.error('Analytics flush exception:', err);
	} finally {
		isFlushInProgress = false;
	}
}

/**
 * Anonymize IP address for GDPR compliance
 * 
 * IPv4: Keep first 3 octets, zero out last (e.g., 192.168.1.100 -> 192.168.1.0)
 * IPv6: Keep first 4 groups, zero out rest (e.g., 2001:db8:85a3:8d3:1319:8a2e:370:7348 -> 2001:db8:85a3:8d3::)
 * 
 * @param ip - IP address to anonymize
 * @returns Anonymized IP address
 */
function anonymizeIp(ip: string): string {
	if (!ip) {
		return '0.0.0.0';
	}

	// IPv4: Keep first 3 octets, zero out last
	if (ip.includes('.') && !ip.includes(':')) {
		const parts = ip.split('.');
		if (parts.length === 4) {
			return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
		}
	}

	// IPv6: Keep first 4 groups, zero out rest
	if (ip.includes(':')) {
		const parts = ip.split(':');
		if (parts.length >= 4) {
			return `${parts.slice(0, 4).join(':')}::`;
		}
	}

	// Fallback: return as-is if format is unrecognized
	return ip;
}

/**
 * Force flush all buffered analytics
 * 
 * This should be called on process exit to ensure no data is lost.
 * It will retry up to MAX_RETRY_ATTEMPTS times.
 */
export async function forceFlushAnalytics(): Promise<void> {
	let attempts = 0;

	while (analyticsBuffer.length > 0 && attempts < MAX_RETRY_ATTEMPTS) {
		attempts++;
		console.log(`Force flush attempt ${attempts}/${MAX_RETRY_ATTEMPTS}...`);

		await flushAnalytics();

		// Wait a bit before retry if buffer still has events
		if (analyticsBuffer.length > 0 && attempts < MAX_RETRY_ATTEMPTS) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}

	if (analyticsBuffer.length > 0) {
		console.warn(`Failed to flush ${analyticsBuffer.length} analytics events after ${MAX_RETRY_ATTEMPTS} attempts`);
	} else {
		console.log('All analytics events flushed successfully');
	}
}

/**
 * Get current buffer status (for monitoring/debugging)
 */
export function getBufferStatus(): {
	bufferSize: number;
	isFlushInProgress: boolean;
} {
	return {
		bufferSize: analyticsBuffer.length,
		isFlushInProgress
	};
}

// Set up periodic flush interval
// This ensures events are flushed even if buffer doesn't reach BUFFER_SIZE
const flushIntervalId = setInterval(() => {
	if (analyticsBuffer.length > 0) {
		flushAnalytics().catch(err => {
			console.error('Periodic analytics flush failed:', err);
		});
	}
}, FLUSH_INTERVAL);

// Ensure interval doesn't prevent process from exiting
if (flushIntervalId.unref) {
	flushIntervalId.unref();
}

// Handle process exit - flush remaining events
// This works in Node.js environments (Vercel serverless functions)
if (typeof process !== 'undefined') {
	// Handle graceful shutdown
	process.on('beforeExit', () => {
		console.log('Process exiting - flushing analytics buffer...');
		forceFlushAnalytics().catch(err => {
			console.error('Failed to flush analytics on exit:', err);
		});
	});

	// Handle SIGTERM (e.g., from Vercel)
	process.on('SIGTERM', () => {
		console.log('SIGTERM received - flushing analytics buffer...');
		forceFlushAnalytics()
			.catch(err => {
				console.error('Failed to flush analytics on SIGTERM:', err);
			})
			.finally(() => {
				process.exit(0);
			});
	});

	// Handle SIGINT (Ctrl+C)
	process.on('SIGINT', () => {
		console.log('SIGINT received - flushing analytics buffer...');
		forceFlushAnalytics()
			.catch(err => {
				console.error('Failed to flush analytics on SIGINT:', err);
			})
			.finally(() => {
				process.exit(0);
			});
	});
}
