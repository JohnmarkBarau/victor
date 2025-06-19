/*
  # Create comments table and related functions

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, required)
      - `platform` (text, required)
      - `content` (text, required)
      - `author` (text, required)
      - `reply` (text, nullable)
      - `replied_at` (timestamp, nullable)
      - `created_at` (timestamp)
      - `user_id` (uuid, required, references auth.users)

  2. Security
    - Enable RLS on comments table
    - Add policies for authenticated users to manage their comments
*/

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  platform text NOT NULL,
  content text NOT NULL,
  author text NOT NULL,
  reply text,
  replied_at timestamptz,
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id)
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own comments"
  ON comments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);