import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { optimizeImage, validateImage } from '$lib/server/image-processor';

// Use Node.js runtime for Sharp image processing
export const config = {
	runtime: 'nodejs20.x'
};

// Allowed MIME types for upload
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Size limits per bucket (in bytes)
const MAX_FILE_SIZE = {
	'profile-photos': 5 * 1024 * 1024, // 5MB
	'company-logos': 10 * 1024 * 1024, // 10MB
	'product-photos': 2 * 1024 * 1024, // 2MB
	'gallery-photos': 5 * 1024 * 1024 // 5MB
} as const;

type BucketName = keyof typeof MAX_FILE_SIZE;

// Validate bucket name
function isValidBucket(bucket: string): bucket is BucketName {
	return bucket in MAX_FILE_SIZE;
}

/**
 * POST /api/upload
 * Handles file uploads with validation, processing, and storage
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	// Check authentication
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		// Parse multipart form data
		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		const bucket = formData.get('bucket') as string | null;

		// Validate required fields
		if (!file) {
			throw error(400, 'No file provided');
		}

		if (!bucket || !isValidBucket(bucket)) {
			throw error(400, 'Invalid or missing bucket parameter');
		}

		// Validate file type
		if (!ALLOWED_MIME_TYPES.includes(file.type)) {
			throw error(
				400,
				'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
			);
		}

		// Validate file size
		const maxSize = MAX_FILE_SIZE[bucket];
		if (file.size > maxSize) {
			const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0);
			throw error(400, `File too large. Maximum size is ${maxSizeMB}MB for ${bucket}.`);
		}

		// Convert file to buffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Validate that it's a real image
		const isValid = await validateImage(buffer);
		if (!isValid) {
			throw error(400, 'Invalid image file');
		}

		// Process image with Sharp
		// Resize and optimize based on bucket type
		let processedImage: Buffer;
		switch (bucket) {
			case 'profile-photos':
				processedImage = await optimizeImage(buffer, {
					width: 800,
					height: 800,
					quality: 85,
					format: 'webp'
				});
				break;
			case 'company-logos':
				processedImage = await optimizeImage(buffer, {
					width: 1200,
					height: 1200,
					quality: 90,
					format: 'webp'
				});
				break;
			case 'product-photos':
				processedImage = await optimizeImage(buffer, {
					width: 600,
					height: 600,
					quality: 80,
					format: 'webp'
				});
				break;
			case 'gallery-photos':
				processedImage = await optimizeImage(buffer, {
					width: 1200,
					height: 1200,
					quality: 85,
					format: 'webp'
				});
				break;
		}

		// Generate unique filename with user ID prefix
		const timestamp = Date.now();
		const randomId = crypto.randomUUID();
		const filename = `${locals.user.id}/${timestamp}-${randomId}.webp`;

		// Upload to Supabase Storage
		const { data, error: uploadError } = await locals.supabase.storage
			.from(bucket)
			.upload(filename, processedImage, {
				contentType: 'image/webp',
				cacheControl: '31536000', // 1 year
				upsert: false
			});

		if (uploadError) {
			console.error('Upload error:', uploadError);
			throw error(500, 'Failed to upload file to storage');
		}

		// Get public URL
		const {
			data: { publicUrl }
		} = locals.supabase.storage.from(bucket).getPublicUrl(filename);

		// Return success response with URL
		return json({
			success: true,
			url: publicUrl,
			filename: data.path
		});
	} catch (err) {
		// Handle known errors
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		// Handle unexpected errors
		console.error('Unexpected upload error:', err);
		throw error(500, 'An unexpected error occurred during upload');
	}
};
