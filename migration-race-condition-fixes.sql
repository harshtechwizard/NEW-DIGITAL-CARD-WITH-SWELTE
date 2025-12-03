-- ============================================
-- RACE CONDITION FIXES - Database Level
-- Run this in Supabase SQL Editor
-- ============================================

-- Add version column for optimistic locking
ALTER TABLE business_cards 
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

ALTER TABLE personal_info 
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

ALTER TABLE professional_info 
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Create function to increment version on update
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for version increment
DROP TRIGGER IF EXISTS increment_business_cards_version ON business_cards;
CREATE TRIGGER increment_business_cards_version
  BEFORE UPDATE ON business_cards
  FOR EACH ROW
  EXECUTE FUNCTION increment_version();

DROP TRIGGER IF EXISTS increment_personal_info_version ON personal_info;
CREATE TRIGGER increment_personal_info_version
  BEFORE UPDATE ON personal_info
  FOR EACH ROW
  EXECUTE FUNCTION increment_version();

DROP TRIGGER IF EXISTS increment_professional_info_version ON professional_info;
CREATE TRIGGER increment_professional_info_version
  BEFORE UPDATE ON professional_info
  FOR EACH ROW
  EXECUTE FUNCTION increment_version();

-- ============================================
-- ATOMIC SLUG GENERATION FUNCTION
-- Generates unique slug with retry logic at database level
-- ============================================

CREATE OR REPLACE FUNCTION generate_unique_slug(
  base_slug TEXT,
  max_attempts INTEGER DEFAULT 10
)
RETURNS TEXT AS $$
DECLARE
  candidate_slug TEXT;
  attempt INTEGER := 0;
  random_suffix TEXT;
  slug_exists BOOLEAN;
BEGIN
  -- Try base slug first
  candidate_slug := base_slug;
  
  LOOP
    -- Check if slug exists
    SELECT EXISTS(
      SELECT 1 FROM business_cards WHERE slug = candidate_slug
    ) INTO slug_exists;
    
    -- If slug doesn't exist, return it
    IF NOT slug_exists THEN
      RETURN candidate_slug;
    END IF;
    
    -- Increment attempt counter
    attempt := attempt + 1;
    
    -- If max attempts reached, raise exception
    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Unable to generate unique slug after % attempts', max_attempts;
    END IF;
    
    -- Generate random suffix (6 characters)
    random_suffix := substr(md5(random()::text || clock_timestamp()::text), 1, 6);
    candidate_slug := base_slug || '-' || random_suffix;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ATOMIC CARD CREATION FUNCTION
-- Creates card with automatic slug generation in single transaction
-- ============================================

CREATE OR REPLACE FUNCTION create_business_card_atomic(
  p_user_id UUID,
  p_name TEXT,
  p_base_slug TEXT,
  p_template_type TEXT,
  p_fields_config JSONB DEFAULT '{}'::jsonb,
  p_design_config JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(
  id UUID,
  slug TEXT,
  name TEXT,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  v_slug TEXT;
  v_card_id UUID;
BEGIN
  -- Generate unique slug atomically
  v_slug := generate_unique_slug(p_base_slug);
  
  -- Insert card with generated slug
  INSERT INTO business_cards (
    user_id,
    name,
    slug,
    template_type,
    fields_config,
    design_config,
    is_active,
    is_default,
    version
  ) VALUES (
    p_user_id,
    p_name,
    v_slug,
    p_template_type,
    p_fields_config,
    p_design_config,
    true,
    false,
    1
  )
  RETURNING business_cards.id INTO v_card_id;
  
  -- Return the created card info
  RETURN QUERY
  SELECT 
    business_cards.id,
    business_cards.slug,
    business_cards.name,
    business_cards.created_at
  FROM business_cards
  WHERE business_cards.id = v_card_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_business_card_atomic TO authenticated;

-- ============================================
-- OPTIMISTIC LOCKING UPDATE FUNCTION
-- Updates card only if version matches (prevents lost updates)
-- ============================================

CREATE OR REPLACE FUNCTION update_business_card_optimistic(
  p_card_id UUID,
  p_user_id UUID,
  p_expected_version INTEGER,
  p_name TEXT DEFAULT NULL,
  p_template_type TEXT DEFAULT NULL,
  p_fields_config JSONB DEFAULT NULL,
  p_design_config JSONB DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  new_version INTEGER,
  message TEXT
) AS $$
DECLARE
  v_current_version INTEGER;
  v_rows_affected INTEGER;
BEGIN
  -- Get current version
  SELECT version INTO v_current_version
  FROM business_cards
  WHERE id = p_card_id AND user_id = p_user_id;
  
  -- Check if card exists
  IF v_current_version IS NULL THEN
    RETURN QUERY SELECT false, 0, 'Card not found or access denied'::TEXT;
    RETURN;
  END IF;
  
  -- Check version match
  IF v_current_version != p_expected_version THEN
    RETURN QUERY SELECT false, v_current_version, 'Version conflict: card was modified by another session'::TEXT;
    RETURN;
  END IF;
  
  -- Perform update with version check
  UPDATE business_cards
  SET
    name = COALESCE(p_name, name),
    template_type = COALESCE(p_template_type, template_type),
    fields_config = COALESCE(p_fields_config, fields_config),
    design_config = COALESCE(p_design_config, design_config),
    is_active = COALESCE(p_is_active, is_active),
    updated_at = NOW()
  WHERE id = p_card_id 
    AND user_id = p_user_id 
    AND version = p_expected_version;
  
  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  
  IF v_rows_affected = 0 THEN
    -- Version changed between SELECT and UPDATE
    SELECT version INTO v_current_version
    FROM business_cards
    WHERE id = p_card_id;
    
    RETURN QUERY SELECT false, v_current_version, 'Version conflict: card was modified during update'::TEXT;
    RETURN;
  END IF;
  
  -- Success - return new version
  RETURN QUERY SELECT true, p_expected_version + 1, 'Card updated successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION update_business_card_optimistic TO authenticated;

-- ============================================
-- OPTIMISTIC LOCKING FOR PERSONAL INFO
-- ============================================

CREATE OR REPLACE FUNCTION upsert_personal_info_optimistic(
  p_user_id UUID,
  p_expected_version INTEGER,
  p_full_name TEXT,
  p_date_of_birth DATE DEFAULT NULL,
  p_primary_email TEXT DEFAULT NULL,
  p_secondary_email TEXT DEFAULT NULL,
  p_mobile_number TEXT DEFAULT NULL,
  p_phone_number TEXT DEFAULT NULL,
  p_whatsapp_number TEXT DEFAULT NULL,
  p_home_address JSONB DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_profile_photo_url TEXT DEFAULT NULL,
  p_instagram_url TEXT DEFAULT NULL,
  p_facebook_url TEXT DEFAULT NULL,
  p_linkedin_url TEXT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  new_version INTEGER,
  message TEXT,
  is_new BOOLEAN
) AS $$
DECLARE
  v_current_version INTEGER;
  v_exists BOOLEAN;
BEGIN
  -- Check if record exists
  SELECT version, true INTO v_current_version, v_exists
  FROM personal_info
  WHERE user_id = p_user_id;
  
  -- If doesn't exist, insert new
  IF NOT v_exists THEN
    INSERT INTO personal_info (
      user_id, full_name, date_of_birth, primary_email, secondary_email,
      mobile_number, phone_number, whatsapp_number, home_address, bio,
      profile_photo_url, instagram_url, facebook_url, linkedin_url, version
    ) VALUES (
      p_user_id, p_full_name, p_date_of_birth, p_primary_email, p_secondary_email,
      p_mobile_number, p_phone_number, p_whatsapp_number, p_home_address, p_bio,
      p_profile_photo_url, p_instagram_url, p_facebook_url, p_linkedin_url, 1
    );
    
    RETURN QUERY SELECT true, 1, 'Personal info created successfully'::TEXT, true;
    RETURN;
  END IF;
  
  -- Check version match for update
  IF v_current_version != p_expected_version THEN
    RETURN QUERY SELECT false, v_current_version, 'Version conflict: personal info was modified by another session'::TEXT, false;
    RETURN;
  END IF;
  
  -- Perform update
  UPDATE personal_info
  SET
    full_name = p_full_name,
    date_of_birth = p_date_of_birth,
    primary_email = p_primary_email,
    secondary_email = p_secondary_email,
    mobile_number = p_mobile_number,
    phone_number = p_phone_number,
    whatsapp_number = p_whatsapp_number,
    home_address = p_home_address,
    bio = p_bio,
    profile_photo_url = p_profile_photo_url,
    instagram_url = p_instagram_url,
    facebook_url = p_facebook_url,
    linkedin_url = p_linkedin_url,
    updated_at = NOW()
  WHERE user_id = p_user_id AND version = p_expected_version;
  
  RETURN QUERY SELECT true, p_expected_version + 1, 'Personal info updated successfully'::TEXT, false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION upsert_personal_info_optimistic TO authenticated;

-- ============================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_business_cards_version ON business_cards(id, version);
CREATE INDEX IF NOT EXISTS idx_personal_info_version ON personal_info(user_id, version);
CREATE INDEX IF NOT EXISTS idx_professional_info_version ON professional_info(id, version);

-- ============================================
-- COMPLETED
-- ============================================
-- This migration adds:
-- 1. Version columns for optimistic locking
-- 2. Atomic slug generation function
-- 3. Atomic card creation function
-- 4. Optimistic locking update functions
-- 5. Proper indexes for performance
