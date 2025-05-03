-- Add new fields to users table for 2FA and security
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255),
  ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS two_factor_backup_codes JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS security_questions JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS security_answers JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP,
  ADD COLUMN IF NOT EXISTS account_locked BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP,
  ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;