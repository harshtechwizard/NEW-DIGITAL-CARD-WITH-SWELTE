/**
 * Retry utility with exponential backoff
 * Handles transient failures and race conditions
 */

export interface RetryOptions {
	maxAttempts?: number;
	initialDelayMs?: number;
	maxDelayMs?: number;
	backoffMultiplier?: number;
	retryableErrors?: string[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
	maxAttempts: 3,
	initialDelayMs: 100,
	maxDelayMs: 5000,
	backoffMultiplier: 2,
	retryableErrors: ['23505', 'PGRST116', '40001', '40P01'] // Unique violation, version conflict, serialization failure, deadlock
};

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any, retryableErrors: string[]): boolean {
	if (!error) return false;
	
	// Check PostgreSQL error codes
	if (error.code && retryableErrors.includes(error.code)) {
		return true;
	}
	
	// Check for specific error messages
	if (error.message) {
		const message = error.message.toLowerCase();
		if (
			message.includes('version conflict') ||
			message.includes('unique constraint') ||
			message.includes('deadlock') ||
			message.includes('serialization failure') ||
			message.includes('could not serialize')
		) {
			return true;
		}
	}
	
	return false;
}

/**
 * Execute function with retry logic and exponential backoff
 */
export async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	options: RetryOptions = {}
): Promise<T> {
	const opts = { ...DEFAULT_OPTIONS, ...options };
	let lastError: any;
	let delay = opts.initialDelayMs;
	
	for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (error: any) {
			lastError = error;
			
			// If this is the last attempt, throw the error
			if (attempt === opts.maxAttempts) {
				throw error;
			}
			
			// Check if error is retryable
			if (!isRetryableError(error, opts.retryableErrors)) {
				throw error;
			}
			
			// Log retry attempt
			console.warn(`Retry attempt ${attempt}/${opts.maxAttempts} after error:`, {
				code: error?.code,
				message: error?.message,
				delayMs: delay
			});
			
			// Wait before retrying
			await sleep(delay);
			
			// Increase delay for next attempt (exponential backoff)
			delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelayMs);
		}
	}
	
	// This should never be reached, but TypeScript needs it
	throw lastError;
}

/**
 * Retry specifically for database operations
 */
export async function retryDatabaseOperation<T>(
	fn: () => Promise<T>,
	_operationName: string = 'database operation'
): Promise<T> {
	return retryWithBackoff(fn, {
		maxAttempts: 3,
		initialDelayMs: 100,
		maxDelayMs: 2000,
		backoffMultiplier: 2
	});
}

/**
 * Retry for optimistic locking conflicts
 */
export async function retryOptimisticLock<T>(
	fn: () => Promise<T>,
	maxAttempts: number = 5
): Promise<T> {
	return retryWithBackoff(fn, {
		maxAttempts,
		initialDelayMs: 50,
		maxDelayMs: 1000,
		backoffMultiplier: 1.5,
		retryableErrors: ['PGRST116', 'version conflict']
	});
}

/**
 * Error types for better error handling
 */
export class VersionConflictError extends Error {
	constructor(
		message: string = 'Data was modified by another session',
		public currentVersion?: number
	) {
		super(message);
		this.name = 'VersionConflictError';
	}
}

export class UniqueConstraintError extends Error {
	constructor(
		message: string = 'Unique constraint violation',
		public field?: string
	) {
		super(message);
		this.name = 'UniqueConstraintError';
	}
}

export class DatabaseError extends Error {
	constructor(
		message: string,
		public code?: string,
		public details?: any
	) {
		super(message);
		this.name = 'DatabaseError';
	}
}
