/**
 * Slug generation utility for business cards
 * Generates URL-friendly slugs with uniqueness checks
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';

/**
 * Generate a URL-friendly slug from a string
 */
export function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '') // Remove non-word chars
		.replace(/[\s_-]+/g, '-') // Replace spaces, underscores with hyphens
		.replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validate if a slug is valid (alphanumeric and hyphens only)
 */
export function isValidSlug(slug: string): boolean {
	return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Generate a random suffix for uniqueness
 */
function generateRandomSuffix(): string {
	return Math.random().toString(36).substring(2, 8);
}

/**
 * Check if a slug exists in the database
 */
async function slugExists(
	supabase: SupabaseClient<Database>,
	slug: string
): Promise<boolean> {
	const { data, error } = await supabase
		.from('business_cards')
		.select('slug')
		.eq('slug', slug)
		.maybeSingle();

	if (error) {
		console.error('Error checking slug:', error);
		return false;
	}

	return data !== null;
}

/**
 * Generate a unique slug from a card name
 * Implements retry logic with random suffixes if slug exists
 * 
 * @param supabase - Supabase client instance
 * @param cardName - The card name to generate slug from
 * @param maxRetries - Maximum number of retry attempts (default: 10)
 * @returns A unique slug
 * @throws Error if unable to generate unique slug after max retries
 */
export async function generateUniqueSlug(
	supabase: SupabaseClient<Database>,
	cardName: string,
	maxRetries: number = 10
): Promise<string> {
	const baseSlug = slugify(cardName);

	// Validate base slug
	if (!baseSlug) {
		throw new Error('Invalid card name: cannot generate slug');
	}

	if (!isValidSlug(baseSlug)) {
		throw new Error('Invalid slug format: must contain only lowercase letters, numbers, and hyphens');
	}

	// Try base slug first
	const exists = await slugExists(supabase, baseSlug);
	if (!exists) {
		return baseSlug;
	}

	// If base slug exists, try with random suffixes
	for (let attempt = 0; attempt < maxRetries; attempt++) {
		const suffix = generateRandomSuffix();
		const candidateSlug = `${baseSlug}-${suffix}`;

		const exists = await slugExists(supabase, candidateSlug);
		if (!exists) {
			return candidateSlug;
		}
	}

	// If all retries failed, throw error
	throw new Error(`Unable to generate unique slug after ${maxRetries} attempts`);
}

/**
 * Generate a unique slug with atomic operation
 * This version uses a database function to ensure true atomicity
 * 
 * @param supabase - Supabase client instance
 * @param cardName - The card name to generate slug from
 * @returns A unique slug
 */
export async function generateUniqueSlugAtomic(
	supabase: SupabaseClient<Database>,
	cardName: string
): Promise<string> {
	const baseSlug = slugify(cardName);

	// Validate base slug
	if (!baseSlug) {
		throw new Error('Invalid card name: cannot generate slug');
	}

	if (!isValidSlug(baseSlug)) {
		throw new Error('Invalid slug format: must contain only lowercase letters, numbers, and hyphens');
	}

	// Call database function for atomic slug generation
	const { data, error } = await supabase.rpc('generate_unique_slug', {
		base_slug: baseSlug,
		max_attempts: 10
	});

	if (error) {
		console.error('Error generating unique slug:', error);
		throw new Error(`Failed to generate unique slug: ${error.message}`);
	}

	if (!data) {
		throw new Error('Slug generation returned no result');
	}

	return data as string;
}
