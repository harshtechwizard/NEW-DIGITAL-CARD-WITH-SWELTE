/**
 * Database types generated from Supabase schema
 * 
 * These types are auto-generated to match the PostgreSQL database schema.
 * They provide type safety for all database operations.
 * 
 * To regenerate these types:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Link to your project: supabase link --project-ref your-project-ref
 * 3. Generate types: supabase gen types typescript --local > src/lib/types/database.ts
 * 
 * Or if using remote database:
 * supabase gen types typescript --project-id your-project-id --schema public > src/lib/types/database.ts
 */

export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export interface Database {
	public: {
		Tables: {
			personal_info: {
				Row: {
					id: string;
					user_id: string;
					full_name: string;
					date_of_birth: string | null;
					primary_email: string | null;
					secondary_email: string | null;
					mobile_number: string | null;
					phone_number: string | null;
					whatsapp_number: string | null;
					home_address: Json | null;
					bio: string | null;
					instagram_url: string | null;
					facebook_url: string | null;
					linkedin_url: string | null;
					profile_photo_url: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					full_name: string;
					date_of_birth?: string | null;
					primary_email?: string | null;
					secondary_email?: string | null;
					mobile_number?: string | null;
					phone_number?: string | null;
					whatsapp_number?: string | null;
					home_address?: Json | null;
					bio?: string | null;
					instagram_url?: string | null;
					facebook_url?: string | null;
					linkedin_url?: string | null;
					profile_photo_url?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					full_name?: string;
					date_of_birth?: string | null;
					primary_email?: string | null;
					secondary_email?: string | null;
					mobile_number?: string | null;
					phone_number?: string | null;
					whatsapp_number?: string | null;
					home_address?: Json | null;
					bio?: string | null;
					instagram_url?: string | null;
					facebook_url?: string | null;
					linkedin_url?: string | null;
					profile_photo_url?: string | null;
					created_at?: string;
					updated_at?: string;
				};
			};
			professional_info: {
				Row: {
					id: string;
					user_id: string;
					designation: string | null;
					company_name: string | null;
					company_website: string | null;
					company_logo_url: string | null;
					office_address: Json | null;
					office_email: string | null;
					office_phone: string | null;
					whatsapp_number: string | null;
					department: string | null;
					office_opening_time: string | null;
					office_closing_time: string | null;
					office_days: string | null;
					instagram_url: string | null;
					facebook_url: string | null;
					linkedin_url: string | null;
					is_primary: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					designation?: string | null;
					company_name?: string | null;
					company_website?: string | null;
					company_logo_url?: string | null;
					office_address?: Json | null;
					office_email?: string | null;
					office_phone?: string | null;
					whatsapp_number?: string | null;
					department?: string | null;
					office_opening_time?: string | null;
					office_closing_time?: string | null;
					office_days?: string | null;
					instagram_url?: string | null;
					facebook_url?: string | null;
					linkedin_url?: string | null;
					is_primary?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					designation?: string | null;
					company_name?: string | null;
					company_website?: string | null;
					company_logo_url?: string | null;
					office_address?: Json | null;
					office_email?: string | null;
					office_phone?: string | null;
					whatsapp_number?: string | null;
					department?: string | null;
					office_opening_time?: string | null;
					office_closing_time?: string | null;
					office_days?: string | null;
					instagram_url?: string | null;
					facebook_url?: string | null;
					linkedin_url?: string | null;
					is_primary?: boolean;
					created_at?: string;
					updated_at?: string;
				};
			};
			education: {
				Row: {
					id: string;
					user_id: string;
					degree_name: string;
					institution: string;
					year_completed: number | null;
					description: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					degree_name: string;
					institution: string;
					year_completed?: number | null;
					description?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					degree_name?: string;
					institution?: string;
					year_completed?: number | null;
					description?: string | null;
					created_at?: string;
				};
			};
			awards: {
				Row: {
					id: string;
					user_id: string;
					title: string;
					issuing_org: string;
					date_received: string | null;
					expiry_date: string | null;
					certificate_url: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					title: string;
					issuing_org: string;
					date_received?: string | null;
					expiry_date?: string | null;
					certificate_url?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					title?: string;
					issuing_org?: string;
					date_received?: string | null;
					expiry_date?: string | null;
					certificate_url?: string | null;
					created_at?: string;
				};
			};
			products_services: {
				Row: {
					id: string;
					user_id: string;
					name: string;
					description: string | null;
					category: string | null;
					photo_url: string | null;
					website_link: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					name: string;
					description?: string | null;
					category?: string | null;
					photo_url?: string | null;
					website_link?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					name?: string;
					description?: string | null;
					category?: string | null;
					photo_url?: string | null;
					website_link?: string | null;
					created_at?: string;
				};
			};
			photo_gallery: {
				Row: {
					id: string;
					user_id: string;
					photo_url: string;
					caption: string | null;
					display_order: number | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					photo_url: string;
					caption?: string | null;
					display_order?: number | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					photo_url?: string;
					caption?: string | null;
					display_order?: number | null;
					created_at?: string;
				};
			};
			business_cards: {
				Row: {
					id: string;
					user_id: string;
					name: string;
					slug: string;
					template_type: string | null;
					fields_config: Json | null;
					design_config: Json | null;
					is_default: boolean;
					is_active: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					name: string;
					slug: string;
					template_type?: string | null;
					fields_config?: Json | null;
					design_config?: Json | null;
					is_default?: boolean;
					is_active?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					name?: string;
					slug?: string;
					template_type?: string | null;
					fields_config?: Json | null;
					design_config?: Json | null;
					is_default?: boolean;
					is_active?: boolean;
					created_at?: string;
					updated_at?: string;
				};
			};
			card_analytics: {
				Row: {
					id: string;
					card_id: string;
					viewed_at: string;
					ip_address: string | null;
					user_agent: string | null;
					referrer: string | null;
				};
				Insert: {
					id?: string;
					card_id: string;
					viewed_at?: string;
					ip_address?: string | null;
					user_agent?: string | null;
					referrer?: string | null;
				};
				Update: {
					id?: string;
					card_id?: string;
					viewed_at?: string;
					ip_address?: string | null;
					user_agent?: string | null;
					referrer?: string | null;
				};
			};
		};
	};
}

// ============================================
// Helper Types for Common Query Patterns
// ============================================

/**
 * Type helper to extract Row type from a table
 */
export type Tables<T extends keyof Database['public']['Tables']> =
	Database['public']['Tables'][T]['Row'];

/**
 * Type helper to extract Insert type from a table
 */
export type TablesInsert<T extends keyof Database['public']['Tables']> =
	Database['public']['Tables'][T]['Insert'];

/**
 * Type helper to extract Update type from a table
 */
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
	Database['public']['Tables'][T]['Update'];

// ============================================
// Convenience Type Aliases
// ============================================

export type PersonalInfo = Tables<'personal_info'>;
export type ProfessionalInfo = Tables<'professional_info'>;
export type Education = Tables<'education'>;
export type Award = Tables<'awards'>;
export type ProductService = Tables<'products_services'>;
export type PhotoGallery = Tables<'photo_gallery'>;
export type BusinessCard = Tables<'business_cards'>;
export type CardAnalytics = Tables<'card_analytics'>;

// ============================================
// Complex Query Result Types
// ============================================

/**
 * Business card with related user information
 * Used for public card display
 */
export interface BusinessCardWithUserInfo extends BusinessCard {
	personal_info: PersonalInfo | null;
	professional_info: ProfessionalInfo[] | null;
	education: Education[] | null;
	awards: Award[] | null;
	products_services: ProductService[] | null;
	photo_gallery: PhotoGallery[] | null;
}

/**
 * Card analytics aggregated by date
 */
export interface CardAnalyticsSummary {
	card_id: string;
	card_name: string;
	total_views: number;
	unique_visitors: number;
	views_by_date: Record<string, number>;
	top_referrers: Array<{ referrer: string; count: number }>;
}

/**
 * User profile with all related information
 */
export interface UserProfile {
	personal_info: PersonalInfo | null;
	professional_info: ProfessionalInfo[];
	education: Education[];
	awards: Award[];
	products_services: ProductService[];
	photo_gallery: PhotoGallery[];
}

/**
 * Template types for business cards
 */
export type TemplateType =
	| 'personal-small'
	| 'personal-detailed'
	| 'professional-small'
	| 'professional-detailed'
	| 'custom';

/**
 * Fields configuration for business cards
 */
export interface FieldsConfig {
	showEmail?: boolean;
	showPhone?: boolean;
	showAddress?: boolean;
	showSocialMedia?: boolean;
	showBio?: boolean;
	showEducation?: boolean;
	showAwards?: boolean;
	showProducts?: boolean;
	showGallery?: boolean;
	[key: string]: boolean | undefined;
}

/**
 * Design configuration for business cards
 */
export interface DesignConfig {
	primaryColor?: string;
	secondaryColor?: string;
	fontFamily?: string;
	fontSize?: 'small' | 'medium' | 'large';
	layout?: 'vertical' | 'horizontal';
	theme?: 'light' | 'dark';
	[key: string]: string | undefined;
}
