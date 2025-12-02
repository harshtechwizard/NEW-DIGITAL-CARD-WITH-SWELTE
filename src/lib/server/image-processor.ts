import sharp from 'sharp';

/**
 * Options for image optimization
 */
export interface OptimizeImageOptions {
	width?: number;
	height?: number;
	quality?: number;
	format?: 'webp' | 'avif' | 'jpeg';
}

/**
 * Optimizes an image by resizing, compressing, and converting format
 * @param buffer - The input image buffer
 * @param options - Optimization options
 * @returns Optimized image buffer
 */
export async function optimizeImage(
	buffer: Buffer,
	options: OptimizeImageOptions = {}
): Promise<Buffer> {
	const { width = 1200, height = 1200, quality = 85, format = 'webp' } = options;

	try {
		let pipeline = sharp(buffer).resize(width, height, {
			fit: 'inside',
			withoutEnlargement: true
		});

		switch (format) {
			case 'webp':
				pipeline = pipeline.webp({ quality });
				break;
			case 'avif':
				pipeline = pipeline.avif({ quality });
				break;
			case 'jpeg':
				pipeline = pipeline.jpeg({ quality, progressive: true });
				break;
		}

		return await pipeline.toBuffer();
	} catch (error) {
		console.error('Image optimization failed:', error);
		throw new Error('Failed to optimize image');
	}
}

/**
 * Generates a thumbnail from an image
 * @param buffer - The input image buffer
 * @param size - The thumbnail size (square)
 * @returns Thumbnail image buffer
 */
export async function generateThumbnail(buffer: Buffer, size: number = 200): Promise<Buffer> {
	try {
		return await sharp(buffer)
			.resize(size, size, { fit: 'cover' })
			.webp({ quality: 80 })
			.toBuffer();
	} catch (error) {
		console.error('Thumbnail generation failed:', error);
		throw new Error('Failed to generate thumbnail');
	}
}

/**
 * Validates that a buffer contains a valid image
 * @param buffer - The buffer to validate
 * @returns True if valid image, false otherwise
 */
export async function validateImage(buffer: Buffer): Promise<boolean> {
	try {
		const metadata = await sharp(buffer).metadata();
		return !!(metadata.width && metadata.height);
	} catch {
		return false;
	}
}

/**
 * Gets image metadata
 * @param buffer - The image buffer
 * @returns Image metadata
 */
export async function getImageMetadata(buffer: Buffer) {
	try {
		return await sharp(buffer).metadata();
	} catch (error) {
		console.error('Failed to get image metadata:', error);
		throw new Error('Failed to read image metadata');
	}
}
