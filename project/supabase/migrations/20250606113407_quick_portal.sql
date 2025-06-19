/*
  # Add sample comments for testing

  1. Changes
    - Insert sample comments with proper user ID handling
    - Use a DO block to ensure user ID is available
    - Add realistic comments for testing the comment management interface

  2. Security
    - Maintains RLS policies
    - Respects user ID constraints
*/

DO $$
DECLARE
  v_user_id UUID;
  v_post_ids UUID[];
BEGIN
  -- Get the first user ID from the users table
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  -- Get some post IDs for the user
  SELECT ARRAY(SELECT id FROM posts WHERE user_id = v_user_id LIMIT 5) INTO v_post_ids;

  -- Only proceed if we have a user and posts
  IF v_user_id IS NOT NULL AND array_length(v_post_ids, 1) > 0 THEN
    -- Insert sample comments
    INSERT INTO comments (post_id, platform, content, author, created_at, user_id)
    VALUES 
      (v_post_ids[1], 'instagram', 'Love this new feature! When will it be available for everyone? 🚀', 'sarah_designs', NOW() - INTERVAL '2 hours', v_user_id),
      (v_post_ids[1], 'twitter', 'Great insights! Would love to see more content like this. #Innovation', 'tech_enthusiast', NOW() - INTERVAL '4 hours', v_user_id),
      (v_post_ids[2], 'facebook', 'This is exactly what I was looking for! Do you have any tutorials?', 'john.smith', NOW() - INTERVAL '6 hours', v_user_id),
      (v_post_ids[2], 'linkedin', 'Excellent analysis. How do you see this trend evolving in the next year?', 'business_pro', NOW() - INTERVAL '8 hours', v_user_id),
      (v_post_ids[3], 'instagram', 'Having some issues with the latest update. Can someone help? 🤔', 'user_help', NOW() - INTERVAL '12 hours', v_user_id),
      (v_post_ids[3], 'twitter', 'Amazing work! Keep it up! 👏', 'fan_account', NOW() - INTERVAL '1 day', v_user_id),
      (v_post_ids[4], 'facebook', 'Could you share more details about the implementation?', 'developer_mike', NOW() - INTERVAL '1 day', v_user_id),
      (v_post_ids[4], 'linkedin', 'This aligns perfectly with our company goals. Thanks for sharing!', 'corporate_user', NOW() - INTERVAL '2 days', v_user_id),
      (v_post_ids[5], 'instagram', 'The design looks fantastic! What tools did you use?', 'design_lover', NOW() - INTERVAL '2 days', v_user_id),
      (v_post_ids[5], 'twitter', 'Bookmarked for later reference. Very helpful! 📚', 'content_curator', NOW() - INTERVAL '3 days', v_user_id)
    ON CONFLICT DO NOTHING; -- Avoid duplicates if run multiple times
  END IF;
END $$;