/*
  # Add media storage bucket and tables

  1. New Tables
    - `media`
      - `id` (uuid, primary key)
      - `file_name` (text)
      - `file_type` (text)
      - `file_size` (integer)
      - `url` (text)
      - `created_at` (timestamp)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on media table
    - Add policies for authenticated users to manage their media
*/

-- Create media table
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own media"
  ON media
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own media"
  ON media
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own media"
  ON media
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media"
  ON media
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);