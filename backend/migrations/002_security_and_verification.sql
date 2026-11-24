-- ============================================================
-- C-TECH v2 — MIGRATION 002: SECURITY, 2FA & BUSINESS VERIFICATION
-- ============================================================

-- 1. Extend ENUMs (if Postgres supports it in transaction, or use safe checks)
ALTER TYPE verification_status ADD VALUE IF NOT EXISTS 'NOT_SUBMITTED';
ALTER TYPE verification_status ADD VALUE IF NOT EXISTS 'UNDER_REVIEW';
ALTER TYPE verification_status ADD VALUE IF NOT EXISTS 'SUSPENDED';

ALTER TYPE seller_doc_type ADD VALUE IF NOT EXISTS 'PAN_CARD';
ALTER TYPE seller_doc_type ADD VALUE IF NOT EXISTS 'ADDRESS_PROOF';
ALTER TYPE seller_doc_type ADD VALUE IF NOT EXISTS 'FACTORY_LICENSE';

-- 2. Enhance users table for security, identity verification & 2FA
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_backup_codes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INT NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lockout_until TIMESTAMPTZ;

-- 3. Enhance sellers table for comprehensive business verification
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS contact_person TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS business_type TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS pan_number TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS cin_number TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS resubmitted_at TIMESTAMPTZ;

-- 4. Enhance buyers table for comprehensive buyer verification
ALTER TABLE buyers ADD COLUMN IF NOT EXISTS contact_person TEXT;
ALTER TABLE buyers ADD COLUMN IF NOT EXISTS business_type TEXT;
ALTER TABLE buyers ADD COLUMN IF NOT EXISTS pan_number TEXT;
-- Make gst_number nullable for buyers where GST is not mandatory
ALTER TABLE buyers ALTER COLUMN gst_number DROP NOT NULL;

-- 5. Enhance seller_documents table
ALTER TABLE seller_documents ADD COLUMN IF NOT EXISTS doc_name TEXT;
ALTER TABLE seller_documents ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE seller_documents ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- 6. OTP verifications table for email & phone verification, password reset, 2FA
CREATE TABLE IF NOT EXISTS otp_verifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier   TEXT NOT NULL,
  otp_hash     TEXT NOT NULL,
  purpose      TEXT NOT NULL,
  attempts     INT NOT NULL DEFAULT 0,
  expires_at   TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_identifier_purpose ON otp_verifications(identifier, purpose);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications(expires_at);

-- 7. Active user sessions table for device tracking and remote logout
CREATE TABLE IF NOT EXISTS user_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE,
  ip_address    TEXT,
  user_agent    TEXT,
  device_name   TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_active   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);

-- 8. Add ip_address column to audit_logs
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address TEXT;
