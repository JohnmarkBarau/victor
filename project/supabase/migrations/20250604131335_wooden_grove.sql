/*
  # Create analytics tables for social media metrics

  1. New Tables
    - `post_analytics`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts)
      - `platform` (text)
      - `views` (integer)
      - `likes` (integer)
      - `comments` (integer)
      - `shares` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
  2. Security
    - Enable RLS on `post_analytics` table
    - Add policies for authenticated users to read their own analytics data
*/

CREATE TABLE IF NOT EXISTS post_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  platform text NOT NULL,
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id)
);

ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own analytics"
  ON post_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON post_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics"
  ON post_analytics
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);