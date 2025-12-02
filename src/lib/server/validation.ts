/**
 * Zod validation schemas for server-side validation
 * 
 * These schemas ensure data integrity and security by validating
 * all user inputs before processing.
 */

import { z } from 'zod';

/**
 * Login validation schema
 */
export const loginSchema = z.object({
	email: z
		.string({ message: 'Email is required' })
		.email('Invalid email address')
		.max(255, 'Email is too long'),
	password: z
		.string({ message: 'Password is required' })
		.min(8, 'Password must be at least 8 characters')
		.max(255, 'Password is too long')
});

/**
 * Signup validation schema
 */
export const signupSchema = z.object({
	email: z
		.string({ message: 'Email is required' })
		.email('Invalid email address')
		.max(255, 'Email is too long'),
	password: z
		.string({ message: 'Password is required' })
		.min(8, 'Password must be at least 8 characters')
		.max(255, 'Password is too long')
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			'Password must contain at least one uppercase letter, one lowercase letter, and one number'
		),
	confirmPassword: z.string({ message: 'Please confirm your password' }),
	acceptTerms: z
		.boolean()
		.refine((val) => val === true, 'You must accept the terms of service')
}).refine((data) => data.password === data.confirmPassword, {
	message: 'Passwords do not match',
	path: ['confirmPassword']
});

/**
 * Password reset request schema
 */
export const passwordResetRequestSchema = z.object({
	email: z
		.string({ message: 'Email is required' })
		.email('Invalid email address')
		.max(255, 'Email is too long')
});

/**
 * Password reset confirmation schema
 */
export const passwordResetConfirmSchema = z.object({
	password: z
		.string({ message: 'Password is required' })
		.min(8, 'Password must be at least 8 characters')
		.max(255, 'Password is too long')
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			'Password must contain at least one uppercase letter, one lowercase letter, and one number'
		),
	confirmPassword: z.string({ message: 'Please confirm your password' })
}).refine((data) => data.password === data.confirmPassword, {
	message: 'Passwords do not match',
	path: ['confirmPassword']
});

/**
 * Personal info validation schema
 */
export const personalInfoSchema = z.object({
	full_name: z
		.string()
		.min(2, 'Name must be at least 2 characters')
		.max(100, 'Name is too long'),
	date_of_birth: z.string().optional().or(z.literal('')),
	primary_email: z
		.string()
		.max(255)
		.optional()
		.or(z.literal(''))
		.refine((val) => !val || val === '' || val.includes('@'), 'Invalid email address'),
	secondary_email: z
		.string()
		.max(255)
		.optional()
		.or(z.literal(''))
		.refine((val) => !val || val === '' || val.includes('@'), 'Invalid email address'),
	mobile_number: z
		.string()
		.max(20, 'Phone number is too long')
		.optional()
		.or(z.literal('')),
	phone_number: z
		.string()
		.max(20, 'Phone number is too long')
		.optional()
		.or(z.literal('')),
	whatsapp_number: z
		.string()
		.max(20, 'Phone number is too long')
		.optional()
		.or(z.literal('')),
	bio: z
		.string()
		.max(500, 'Bio must be less than 500 characters')
		.optional()
		.or(z.literal('')),
	instagram_url: z
		.string()
		.optional()
		.or(z.literal(''))
		.refine((val) => !val || val === '' || val.startsWith('http'), 'Invalid URL'),
	facebook_url: z
		.string()
		.optional()
		.or(z.literal(''))
		.refine((val) => !val || val === '' || val.startsWith('http'), 'Invalid URL'),
	linkedin_url: z
		.string()
		.optional()
		.or(z.literal(''))
		.refine((val) => !val || val === '' || val.startsWith('http'), 'Invalid URL'),
	profile_photo_url: z
		.string()
		.optional()
		.or(z.literal(''))
		.refine((val) => !val || val === '' || val.startsWith('http'), 'Invalid URL')
});

/**
 * Professional info validation schema
 */
export const professionalInfoSchema = z.object({
	designation: z.string().max(100).optional().or(z.literal('')),
	company_name: z.string().max(100).optional().or(z.literal('')),
	company_website: z
		.string()
		.optional()
		.or(z.literal(''))
		.refine((val) => !val || val === '' || val.startsWith('http'), 'Invalid URL'),
	company_logo_url: z
		.string()
		.optional()
		.or(z.literal(''))
		.refine((val) => !val || val === '' || val.startsWith('http'), 'Invalid URL'),
	office_email: z
		.string()
		.max(255)
		.optional()
		.or(z.literal(''))
		.refine((val) => !val || val === '' || val.includes('@'), 'Invalid email address'),
	office_phone: z
		.string()
		.max(20, 'Phone number is too long')
		.optional()
		.or(z.literal('')),
	whatsapp_number: z
		.string()
		.max(20, 'Phone number is too long')
		.optional()
		.or(z.literal('')),
	department: z.string().max(100).optional().or(z.literal('')),
	office_opening_time: z.string().optional().or(z.literal('')),
	office_closing_time: z.string().optional().or(z.literal('')),
	office_days: z.string().optional().or(z.literal('')),
	instagram_url: z
		.string()
		.optional()
		.or(z.literal(''))
		.refine((val) => !val || val === '' || val.startsWith('http'), 'Invalid URL'),
	facebook_url: z
		.string()
		.optional()
		.or(z.literal(''))
		.refine((val) => !val || val === '' || val.startsWith('http'), 'Invalid URL'),
	linkedin_url: z
		.string()
		.optional()
		.or(z.literal(''))
		.refine((val) => !val || val === '' || val.startsWith('http'), 'Invalid URL')
});

/**
 * Education validation schema
 */
export const educationSchema = z.object({
	degree_name: z.string().min(1, 'Degree name is required').max(200),
	institution: z.string().min(1, 'Institution is required').max(200),
	year_completed: z.number().int().min(1900).max(2100).optional().nullable(),
	description: z.string().max(500).optional().or(z.literal(''))
});

/**
 * Award validation schema
 */
export const awardSchema = z.object({
	title: z.string().min(1, 'Award title is required').max(200),
	issuing_org: z.string().min(1, 'Issuing organization is required').max(200),
	date_received: z.string().optional().or(z.literal('')),
	expiry_date: z.string().optional().or(z.literal('')),
	certificate_url: z.string().url('Invalid URL').optional().or(z.literal(''))
});

/**
 * Product/Service validation schema
 */
export const productServiceSchema = z.object({
	name: z.string().min(1, 'Product/Service name is required').max(200),
	description: z.string().max(500).optional().or(z.literal('')),
	category: z.string().max(100).optional().or(z.literal('')),
	photo_url: z.string().url('Invalid URL').optional().or(z.literal('')),
	website_link: z.string().url('Invalid URL').optional().or(z.literal(''))
});

/**
 * Photo gallery validation schema
 */
export const photoGallerySchema = z.object({
	photo_url: z.string().url('Invalid URL'),
	caption: z.string().max(200).optional().or(z.literal('')),
	display_order: z.number().int().optional().nullable()
});

/**
 * Business card validation schema
 * Note: slug is optional for creation (generated server-side), but required for updates
 */
export const businessCardSchema = z.object({
	name: z
		.string({ message: 'Card name is required' })
		.min(1, 'Card name is required')
		.max(100, 'Card name is too long'),
	slug: z
		.string()
		.regex(
			/^[a-z0-9-]+$/,
			'Slug must contain only lowercase letters, numbers, and hyphens'
		)
		.min(3, 'Slug must be at least 3 characters')
		.max(100, 'Slug is too long')
		.optional()
		.or(z.literal('')), // Allow empty string for server-side generation
	template_type: z.enum([
		'personal-small',
		'personal-detailed',
		'professional-small',
		'professional-detailed',
		'custom'
	]),
	fields_config: z.record(z.string(), z.any()).optional(), // Changed from z.boolean() to z.any() for flexibility
	design_config: z
		.object({
			primaryColor: z
				.string()
				.regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')
				.optional(),
			fontFamily: z.string().optional(),
			layout: z.enum(['vertical', 'horizontal']).optional()
		})
		.optional()
});

/**
 * File upload validation schema
 */
export const fileUploadSchema = z.object({
	bucket: z.enum(['profile-photos', 'company-logos', 'product-photos', 'gallery-photos']),
	maxSize: z.number().positive()
});

/**
 * Custom section validation schema
 */
export const customSectionSchema = z.object({
	title: z.string().min(1, 'Section title is required').max(100, 'Title is too long'),
	content: z.string().min(1, 'Section content is required').max(51200, 'Content is too large (max 50KB)'), // 50KB limit
	display_order: z.number().int().min(0).optional().nullable(),
	is_active: z.boolean().optional()
});
