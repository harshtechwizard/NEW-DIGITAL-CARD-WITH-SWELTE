/**
 * Rate limiting utility for preventing abuse
 * 
 * This module provides simple in-memory rate limiting.
 * For production with multiple instances, consider using Redis (Upstash).
 */

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

// In-memory store for rate limiting
// In production, use Redis for distributed rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
	const now = Date.now();
	for (const [key, entry] of rateLimitStore.entries()) {
		if (entry.resetAt < now) {
			rateLimitStore.delete(key);
		}
	}
}, 5 * 60 * 1000);

export interface RateLimitResult {
	allowed: boolean;
	retryAfter: number; // seconds until retry is allowed
	remaining: number; // remaining attempts
}

/**
 * Check if a request should be rate limited
 * 
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param action - Action being rate limited (e.g., 'login', 'signup')
 * @param maxAttempts - Maximum number of attempts allowed
 * @param windowSeconds - Time window in seconds
 * @returns Rate limit result
 */
export async function rateLimit(
	identifier: string,
	action: string,
	maxAttempts: number,
	windowSeconds: number
): Promise<RateLimitResult> {
	const key = `${action}:${identifier}`;
	const now = Date.now();
	const windowMs = windowSeconds * 1000;
	
	let entry = rateLimitStore.get(key);
	
	// Create new entry if doesn't exist or expired
	if (!entry || entry.resetAt < now) {
		entry = {
			count: 1,
			resetAt: now + windowMs
		};
		rateLimitStore.set(key, entry);
		
		return {
			allowed: true,
			retryAfter: 0,
			remaining: maxAttempts - 1
		};
	}
	
	// Increment count
	entry.count++;
	
	// Check if limit exceeded
	if (entry.count > maxAttempts) {
		const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
		return {
			allowed: false,
			retryAfter,
			remaining: 0
		};
	}
	
	return {
		allowed: true,
		retryAfter: 0,
		remaining: maxAttempts - entry.count
	};
}

/**
 * Reset rate limit for a specific identifier and action
 * Useful for clearing limits after successful authentication
 * 
 * @param identifier - Unique identifier
 * @param action - Action being rate limited
 */
export function resetRateLimit(identifier: string, action: string): void {
	const key = `${action}:${identifier}`;
	rateLimitStore.delete(key);
}
