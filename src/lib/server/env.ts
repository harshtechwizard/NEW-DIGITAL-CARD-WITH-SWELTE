/**
 * Environment variable validation
 * Validates required environment variables on server startup
 */

import { dev } from '$app/environment';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

interface EnvConfig {
	// Supabase
	PUBLIC_SUPABASE_URL: string;
	PUBLIC_SUPABASE_ANON_KEY: string;
	SUPABASE_SERVICE_ROLE_KEY?: string; // Optional in development

	// Redis (optional in development)
	UPSTASH_REDIS_URL?: string;
	UPSTASH_REDIS_TOKEN?: string;

	// Sentry (optional in development)
	SENTRY_DSN?: string;

	// OAuth (optional)
	GOOGLE_CLIENT_ID?: string;
	GOOGLE_CLIENT_SECRET?: string;
	GITHUB_CLIENT_ID?: string;
	GITHUB_CLIENT_SECRET?: string;
}

/**
 * Validates that all required environment variables are set
 * Throws an error if any required variables are missing
 */
export function validateEnv(): EnvConfig {
	// Merge public and private env
	const allEnv = { ...publicEnv, ...privateEnv };
	
	const requiredVars = [
		'PUBLIC_SUPABASE_URL',
		'PUBLIC_SUPABASE_ANON_KEY'
	];

	// In production, also require service role key (Redis and Sentry are optional)
	const productionRequiredVars = dev 
		? [] 
		: ['SUPABASE_SERVICE_ROLE_KEY'];

	const allRequiredVars = [...requiredVars, ...productionRequiredVars];

	const missing: string[] = [];

	for (const varName of allRequiredVars) {
		if (!allEnv[varName]) {
			missing.push(varName);
		}
	}

	if (missing.length > 0) {
		throw new Error(
			`Missing required environment variables:\n${missing.map((v) => `  - ${v}`).join('\n')}\n\n` +
				`Please check your .env file and ensure all required variables are set.\n` +
				`See .env.example for reference.`
		);
	}

	// Validate URL formats
	try {
		new URL(allEnv.PUBLIC_SUPABASE_URL!);
	} catch {
		throw new Error('PUBLIC_SUPABASE_URL must be a valid URL');
	}

	// Validate Redis URL if provided
	if (allEnv.UPSTASH_REDIS_URL) {
		try {
			new URL(allEnv.UPSTASH_REDIS_URL);
		} catch {
			throw new Error('UPSTASH_REDIS_URL must be a valid URL');
		}
	}

	// Validate key formats (basic check)
	if (allEnv.PUBLIC_SUPABASE_ANON_KEY!.length < 20) {
		throw new Error('PUBLIC_SUPABASE_ANON_KEY appears to be invalid (too short)');
	}

	if (allEnv.SUPABASE_SERVICE_ROLE_KEY && allEnv.SUPABASE_SERVICE_ROLE_KEY.length < 20) {
		throw new Error('SUPABASE_SERVICE_ROLE_KEY appears to be invalid (too short)');
	}

	// Log validation success
	console.log('✓ Environment variables validated successfully');

	if (dev) {
		console.log('  Running in development mode');
	} else {
		console.log('  Running in production mode');
	}
	
	// Log optional features status
	if (!allEnv.SUPABASE_SERVICE_ROLE_KEY) {
		console.log('  ⚠ Service role key not configured (some admin features disabled)');
	}
	if (!allEnv.UPSTASH_REDIS_URL) {
		console.log('  ⚠ Redis not configured (rate limiting disabled)');
	}
	if (!allEnv.SENTRY_DSN) {
		console.log('  ⚠ Sentry not configured (error tracking disabled)');
	}

	return {
		PUBLIC_SUPABASE_URL: allEnv.PUBLIC_SUPABASE_URL!,
		PUBLIC_SUPABASE_ANON_KEY: allEnv.PUBLIC_SUPABASE_ANON_KEY!,
		SUPABASE_SERVICE_ROLE_KEY: allEnv.SUPABASE_SERVICE_ROLE_KEY,
		UPSTASH_REDIS_URL: allEnv.UPSTASH_REDIS_URL,
		UPSTASH_REDIS_TOKEN: allEnv.UPSTASH_REDIS_TOKEN,
		SENTRY_DSN: allEnv.SENTRY_DSN,
		GOOGLE_CLIENT_ID: allEnv.GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET: allEnv.GOOGLE_CLIENT_SECRET,
		GITHUB_CLIENT_ID: allEnv.GITHUB_CLIENT_ID,
		GITHUB_CLIENT_SECRET: allEnv.GITHUB_CLIENT_SECRET
	};
}

/**
 * Get validated environment configuration
 * Call this once at server startup
 */
let envConfig: EnvConfig | null = null;

export function getEnv(): EnvConfig {
	if (!envConfig) {
		envConfig = validateEnv();
	}
	return envConfig;
}
