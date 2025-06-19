/*
  # Create video analytics table

  1. New Tables
    - `video_analytics`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts)
      - `platform` (text)
      - `video_url` (text)
      - `duration` (integer, video duration in seconds)
      - `views` (integer)
      - `watch_time` (integer, total watch time in seconds)
      - `completion_rate` (numeric, percentage of video watched)
      - `likes` (integer)
      - `comments` (integer)
      - `shares` (integer)
      - `saves` (integer)
      - `click_through_rate` (numeric)
      - `engagement_rate` (numeric)
      - `retention_points` (integer array, retention at different points)
      - `peak_concurrent_viewers` (integer)
      - `average_view_duration` (integer, in seconds)
      - `replay_count` (integer)
      - `thumbnail_click_rate` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `video_analytics` table
    - Add policies for authenticated users to manage their own video analytics
*/

CREATE TABLE IF NOT EXISTS video_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  platform text NOT NULL,
  video_url text NOT NULL,
  duration integer NOT NULL DEFAULT 0,
  views integer DEFAULT 0,
  watch_time integer DEFAULT 0,
  completion_rate numeric DEFAULT 0,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  saves integer DEFAULT 0,
  click_through_rate numeric DEFAULT 0,
  engagement_rate numeric DEFAULT 0,
  retention_points integer[] DEFAULT ARRAY[100, 85, 70, 55, 40],
  peak_concurrent_viewers integer DEFAULT 0,
  average_view_duration integer DEFAULT 0,
  replay_count integer DEFAULT 0,
  thumbnail_click_rate numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id)
);

ALTER TABLE video_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own video analytics"
  ON video_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own video analytics"
  ON video_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own video analytics"
  ON video_analytics
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own video analytics"
  ON video_analytics
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_analytics_user_id ON video_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_post_id ON video_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_platform ON video_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_video_analytics_created_at ON video_analytics(created_at);