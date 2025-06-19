/*
  # Tavus Video Integration Tables

  1. New Tables
    - `tavus_videos` - Store Tavus video generation data
    - `tavus_templates` - Available Tavus templates
    - `tavus_avatars` - Available Tavus avatars
    - `tavus_voices` - Available Tavus voices

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their own videos
*/

-- Tavus videos table
CREATE TABLE IF NOT EXISTS tavus_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tavus_video_id text UNIQUE,
  title text NOT NULL,
  script text NOT NULL,
  avatar_id text NOT NULL,
  voice_id text NOT NULL,
  background text NOT NULL,
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  video_url text,
  thumbnail_url text,
  duration integer,
  speed numeric DEFAULT 1.0,
  tone text DEFAULT 'professional',
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tavus templates table (for reference)
CREATE TABLE IF NOT EXISTS tavus_templates (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  thumbnail text,
  features text[],
  created_at timestamptz DEFAULT now()
);

-- Tavus avatars table (for reference)
CREATE TABLE IF NOT EXISTS tavus_avatars (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  gender text CHECK (gender IN ('male', 'female')),
  style text CHECK (style IN ('professional', 'casual', 'creative')),
  thumbnail text,
  created_at timestamptz DEFAULT now()
);

-- Tavus voices table (for reference)
CREATE TABLE IF NOT EXISTS tavus_voices (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  language text NOT NULL,
  accent text,
  gender text CHECK (gender IN ('male', 'female')),
  sample_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tavus_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tavus_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tavus_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE tavus_voices ENABLE ROW LEVEL SECURITY;

-- Tavus videos policies
CREATE POLICY "Users can read own tavus videos"
  ON tavus_videos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tavus videos"
  ON tavus_videos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tavus videos"
  ON tavus_videos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tavus videos"
  ON tavus_videos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Templates, avatars, and voices are read-only for all authenticated users
CREATE POLICY "Authenticated users can read templates"
  ON tavus_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read avatars"
  ON tavus_avatars FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read voices"
  ON tavus_voices FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample templates
INSERT INTO tavus_templates (id, name, description, category, features) VALUES
('business-intro', 'Business Introduction', 'Professional introduction video for business use', 'business', ARRAY['Professional avatar', 'Clean background', 'Corporate tone']),
('product-demo', 'Product Demo', 'Showcase your product with engaging presentation', 'marketing', ARRAY['Product showcase', 'Call-to-action', 'Engaging visuals']),
('social-announcement', 'Social Media Announcement', 'Perfect for social media announcements and updates', 'social', ARRAY['Social-friendly format', 'Casual tone', 'Eye-catching']),
('educational-content', 'Educational Content', 'Create informative and educational videos', 'educational', ARRAY['Clear explanation', 'Visual aids', 'Structured content'])
ON CONFLICT (id) DO NOTHING;

-- Insert sample avatars
INSERT INTO tavus_avatars (id, name, description, gender, style) VALUES
('avatar-1', 'Professional Male', 'Business professional appearance', 'male', 'professional'),
('avatar-2', 'Casual Female', 'Friendly and approachable', 'female', 'casual'),
('avatar-3', 'Creative Male', 'Modern and artistic style', 'male', 'creative'),
('avatar-4', 'Executive Female', 'Corporate leadership style', 'female', 'professional')
ON CONFLICT (id) DO NOTHING;

-- Insert sample voices
INSERT INTO tavus_voices (id, name, description, language, accent, gender) VALUES
('voice-1', 'Professional Voice', 'Clear and authoritative', 'English', 'American', 'male'),
('voice-2', 'Friendly Voice', 'Warm and approachable', 'English', 'American', 'female'),
('voice-3', 'Energetic Voice', 'Dynamic and engaging', 'English', 'British', 'male'),
('voice-4', 'Calm Voice', 'Soothing and trustworthy', 'English', 'American', 'female')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tavus_videos_user_id ON tavus_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_tavus_videos_status ON tavus_videos(status);
CREATE INDEX IF NOT EXISTS idx_tavus_videos_created_at ON tavus_videos(created_at);