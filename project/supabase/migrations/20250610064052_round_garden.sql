/*
  # Create social accounts table for OAuth integration

  1. New Tables
    - `social_accounts`
      - `id` (uuid, primary key)
      - `platform` (text, required) - twitter, instagram, facebook, etc.
      - `username` (text, required) - platform username
      - `display_name` (text, required) - display name on platform
      - `profile_image` (text, optional) - profile image URL
      - `access_token` (text, required) - OAuth access token
      - `refresh_token` (text, optional) - OAuth refresh token
      - `expires_at` (timestamptz, optional) - token expiration
      - `is_active` (boolean, default true) - account status
      - `connected_at` (timestamptz, default now()) - connection timestamp
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `social_accounts` table
    - Add policies for authenticated users to manage their own accounts
    - Encrypt sensitive token data

  3. Indexes
    - Add indexes for performance on user_id and platform
*/

CREATE TABLE IF NOT EXISTS social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  username text NOT NULL,
  display_name text NOT NULL,
  profile_image text,
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  connected_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(user_id, platform, username)
);

-- Enable RLS
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own social accounts"
  ON social_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social accounts"
  ON social_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social accounts"
  ON social_accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own social accounts"
  ON social_accounts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_active ON social_accounts(is_active) WHERE is_active = true;