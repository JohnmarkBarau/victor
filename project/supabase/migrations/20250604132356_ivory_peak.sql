/*
  # Add test comments

  1. Changes
    - Insert test comments with proper user ID handling
    - Use a DO block to ensure user ID is available
    - Add sample comments for testing the comment management interface

  2. Security
    - Maintains RLS policies
    - Respects user ID constraints
*/

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the first user ID from the users table
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  -- Insert test comments using the retrieved user ID
  INSERT INTO comments (post_id, platform, content, author, created_at, user_id)
  VALUES 
    ('11111111-1111-1111-1111-111111111111', 'instagram', 'Love the new product design! When will it be available in stores? 🛍️', 'sarah_designs', NOW() - INTERVAL '2 days', v_user_id),
    ('22222222-2222-2222-2222-222222222222', 'twitter', 'Great initiative! Would love to learn more about the sustainability aspects of this project. #Innovation', 'eco_mike', NOW() - INTERVAL '1 day', v_user_id),
    ('33333333-3333-3333-3333-333333333333', 'facebook', 'This is exactly what I''ve been looking for! Do you ship internationally?', 'john.smith', NOW() - INTERVAL '12 hours', v_user_id),
    ('44444444-4444-4444-4444-444444444444', 'instagram', 'The color options are amazing! Will there be more coming? 🌈', 'design_enthusiast', NOW() - INTERVAL '6 hours', v_user_id),
    ('55555555-5555-5555-5555-555555555555', 'twitter', 'Having some issues with the latest update. Can someone from support help?', 'tech_user', NOW() - INTERVAL '3 hours', v_user_id);
END $$;