-- Digital Business Card MVP - Database Setup
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Personal Information Table
CREATE TABLE personal_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  primary_email TEXT,
  secondary_email TEXT,
  mobile_number TEXT,
  phone_number TEXT,
  home_address JSONB,
  bio TEXT,
  profile_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Professional Information Table
CREATE TABLE professional_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  designation TEXT,
  company_name TEXT,
  company_website TEXT,
  office_address JSONB,
  office_email TEXT,
  office_phone TEXT,
  department TEXT,
  linkedin_url TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Education Table
CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  degree_name TEXT NOT NULL,
  institution TEXT NOT NULL,
  year_completed INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Awards Table
CREATE TABLE awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issuing_org TEXT NOT NULL,
  date_received DATE,
  expiry_date DATE,
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products & Services Table
CREATE TABLE products_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  photo_url TEXT,
  website_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photo Gallery Table
CREATE TABLE photo_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Cards Table (CORE MVP)
CREATE TABLE business_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  template_type TEXT,
  fields_config JSONB,
  design_config JSONB,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Card Analytics Table (CORE MVP)
CREATE TABLE card_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES business_cards(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT
);

-- Enable Row Level Security on all tables
ALTER TABLE personal_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Private Data (personal_info, professional_info, etc.)
CREATE POLICY "Users can manage their own personal info"
  ON personal_info FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own professional info"
  ON professional_info FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own education"
  ON education FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own awards"
  ON awards FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own products/services"
  ON products_services FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own photo gallery"
  ON photo_gallery FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Business Cards (Special: Public READ, Private CUD)
CREATE POLICY "Anyone can view active business cards"
  ON business_cards FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can manage their own cards"
  ON business_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards"
  ON business_cards FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards"
  ON business_cards FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policy for Card Analytics (Anyone can insert, only owner can read)
CREATE POLICY "Anyone can insert analytics"
  ON card_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Card owners can view their analytics"
  ON card_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_cards
      WHERE business_cards.id = card_analytics.card_id
      AND business_cards.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_business_cards_slug ON business_cards(slug);
CREATE INDEX idx_business_cards_user_id ON business_cards(user_id);
CREATE INDEX idx_card_analytics_card_id ON card_analytics(card_id);
CREATE INDEX idx_personal_info_user_id ON personal_info(user_id);
CREATE INDEX idx_professional_info_user_id ON professional_info(user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_personal_info_updated_at BEFORE UPDATE ON personal_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professional_info_updated_at BEFORE UPDATE ON professional_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_cards_updated_at BEFORE UPDATE ON business_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Personal info can be read if the user has an active business card
create policy "Public can read personal info for active cards"
  on personal_info
  for select
  using (
    exists (
      select 1
      from business_cards
      where business_cards.user_id = personal_info.user_id
        and business_cards.is_active = true
    )
  );

-- Professional info can be read if the user has an active business card
create policy "Public can read professional info for active cards"
  on professional_info
  for select
  using (
    exists (
      select 1
      from business_cards
      where business_cards.user_id = professional_info.user_id
        and business_cards.is_active = true
    )
  );

insert into storage.buckets (id, name, public) values ('profile-photos', 'profile-photos', true)
  on conflict (id) do nothing;

create policy "Owners can manage their photos"
on storage.objects
for all
using (
  bucket_id = 'profile-photos'
  and auth.role() = 'authenticated'
  and auth.uid() = owner
)
with check (
  bucket_id = 'profile-photos'
  and auth.role() = 'authenticated'
  and auth.uid() = owner
);

create policy "Users can upload to profile-photos"
on storage.objects
for insert
with check (
  bucket_id = 'profile-photos'
  and auth.role() = 'authenticated'
);

create policy "Public can read profile photos"
on storage.objects
for select
using (bucket_id = 'profile-photos');

  alter table personal_info add column if not exists instagram_url text;
  alter table personal_info add column if not exists facebook_url text;
  alter table personal_info add column if not exists linkedin_url text;

  alter table professional_info add column if not exists instagram_url text;
  alter table professional_info add column if not exists facebook_url text;

-- ============================================
-- FIXED MIGRATION SQL - Safe to Run Multiple Times
-- Run this in Supabase SQL Editor
-- ============================================

-- Add new columns to tables (idempotent - safe to run multiple times)
ALTER TABLE personal_info 
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

ALTER TABLE professional_info 
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS company_logo_url TEXT,
ADD COLUMN IF NOT EXISTS office_opening_time TIME,
ADD COLUMN IF NOT EXISTS office_closing_time TIME,
ADD COLUMN IF NOT EXISTS office_days TEXT;

-- Create storage buckets (idempotent - safe to run multiple times)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist (to avoid conflicts)
-- This makes the script idempotent - safe to run multiple times
DROP POLICY IF EXISTS "Users can upload their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own company logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own company logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own company logos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view company logos" ON storage.objects;

-- Storage policies for profile photos
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own profile photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own profile photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

CREATE POLICY "Public can view profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- Storage policies for company logos
CREATE POLICY "Users can upload their own company logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-logos' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own company logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company-logos' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own company logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'company-logos' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

CREATE POLICY "Public can view company logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company-logos');

-- Create Storage Buckets for Phase 1 Features
-- Run this in Supabase SQL Editor or Dashboard > Storage

-- Note: Storage buckets are typically created via the Supabase Dashboard UI
-- Go to Storage > Create a new bucket

-- Bucket 1: profile-photos (already exists from previous setup)
-- Public: true
-- File size limit: 2MB
-- Allowed MIME types: image/*

-- Bucket 2: company-logos (already exists from previous setup)
-- Public: true
-- File size limit: 2MB
-- Allowed MIME types: image/*

-- Bucket 3: product-photos (NEW)
-- Public: true
-- File size limit: 2MB
-- Allowed MIME types: image/*

-- Bucket 4: gallery-photos (NEW)
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/*

-- If you want to create them via SQL (advanced):
-- Note: This requires admin privileges

-- Create product-photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-photos',
  'product-photos',
  true,
  2097152, -- 2MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create gallery-photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery-photos',
  'gallery-photos',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for product-photos bucket
CREATE POLICY "Users can upload their own product photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own product photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own product photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Product photos are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-photos');

-- Set up RLS policies for gallery-photos bucket
CREATE POLICY "Users can upload their own gallery photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gallery-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own gallery photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'gallery-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own gallery photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'gallery-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Gallery photos are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gallery-photos');
-- Allow public to view education for users with active cards
CREATE POLICY "Public can view education for active cards"
  ON education FOR SELECT
  USING (
    user_id IN (
      SELECT DISTINCT user_id 
      FROM business_cards 
      WHERE is_active = true
    )
  );

-- Allow public to view awards for users with active cards
CREATE POLICY "Public can view awards for active cards"
  ON awards FOR SELECT
  USING (
    user_id IN (
      SELECT DISTINCT user_id 
      FROM business_cards 
      WHERE is_active = true
    )
  );

-- Allow public to view products for users with active cards
CREATE POLICY "Public can view products for active cards"
  ON products_services FOR SELECT
  USING (
    user_id IN (
      SELECT DISTINCT user_id 
      FROM business_cards 
      WHERE is_active = true
    )
  );

-- Allow public to view photos for users with active cards
CREATE POLICY "Public can view photos for active cards"
  ON photo_gallery FOR SELECT
  USING (
    user_id IN (
      SELECT DISTINCT user_id 
      FROM business_cards 
      WHERE is_active = true
    )
  );


-- ============================================
-- CUSTOM SECTIONS TABLE - Rich Content Support
-- Allows users to add custom rich text sections with embeds
-- ============================================

-- Custom Sections Table
CREATE TABLE IF NOT EXISTS custom_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE custom_sections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_sections
CREATE POLICY "Users can manage their own custom sections"
  ON custom_sections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow public to view custom sections for users with active cards
CREATE POLICY "Public can view custom sections for active cards"
  ON custom_sections FOR SELECT
  USING (
    is_active = true AND
    user_id IN (
      SELECT DISTINCT user_id 
      FROM business_cards 
      WHERE is_active = true
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_custom_sections_user_id ON custom_sections(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_sections_display_order ON custom_sections(user_id, display_order);

-- Trigger for updated_at
CREATE TRIGGER update_custom_sections_updated_at BEFORE UPDATE ON custom_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
