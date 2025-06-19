/*
  # Add sample analytics data

  1. Changes
    - Insert sample analytics data for testing
    - Create analytics entries for existing posts
    - Ensure proper user association

  2. Security
    - Maintains RLS policies
    - Respects user ID constraints
*/

-- Insert sample analytics data for existing posts
DO $$
DECLARE
  v_user_id UUID;
  v_post_record RECORD;
  v_platform TEXT;
BEGIN
  -- Get the first user ID from the users table
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  -- Only proceed if we have a user
  IF v_user_id IS NOT NULL THEN
    -- Loop through existing posts and create analytics for each platform
    FOR v_post_record IN 
      SELECT id, platforms FROM posts WHERE user_id = v_user_id
    LOOP
      -- Create analytics for each platform the post was published to
      FOREACH v_platform IN ARRAY v_post_record.platforms
      LOOP
        INSERT INTO post_analytics (
          post_id, 
          platform, 
          views, 
          likes, 
          comments, 
          shares, 
          user_id,
          created_at
        )
        VALUES (
          v_post_record.id,
          v_platform,
          FLOOR(RANDOM() * 1000) + 100,  -- Random views between 100-1100
          FLOOR(RANDOM() * 100) + 10,    -- Random likes between 10-110
          FLOOR(RANDOM() * 50) + 5,      -- Random comments between 5-55
          FLOOR(RANDOM() * 25) + 2,      -- Random shares between 2-27
          v_user_id,
          NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30) -- Random date within last 30 days
        )
        ON CONFLICT DO NOTHING; -- Avoid duplicates if run multiple times
      END LOOP;
    END LOOP;
  END IF;
END $$;