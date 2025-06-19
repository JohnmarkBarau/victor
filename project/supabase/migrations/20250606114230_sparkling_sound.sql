/*
  # Insert sample video analytics data

  1. Changes
    - Insert sample video analytics for existing posts
    - Create realistic video performance metrics
    - Ensure data variety across platforms and timeframes

  2. Security
    - Maintains RLS policies
    - Respects user ID constraints
*/

DO $$
DECLARE
  v_user_id UUID;
  v_post_record RECORD;
  v_platform TEXT;
  v_duration INTEGER;
  v_views INTEGER;
  v_watch_time INTEGER;
  v_completion_rate NUMERIC;
  v_engagement_rate NUMERIC;
BEGIN
  -- Get the first user ID from the users table
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  -- Only proceed if we have a user
  IF v_user_id IS NOT NULL THEN
    -- Loop through existing posts and create video analytics for video-capable platforms
    FOR v_post_record IN 
      SELECT id, platforms FROM posts WHERE user_id = v_user_id
    LOOP
      -- Create video analytics for video platforms
      FOREACH v_platform IN ARRAY v_post_record.platforms
      LOOP
        -- Only create video analytics for platforms that support video
        IF v_platform IN ('youtube', 'tiktok', 'instagram', 'facebook', 'twitter') THEN
          -- Generate realistic video metrics
          v_duration := FLOOR(RANDOM() * 180) + 30; -- 30-210 seconds
          v_views := FLOOR(RANDOM() * 5000) + 500; -- 500-5500 views
          v_completion_rate := FLOOR(RANDOM() * 60) + 30; -- 30-90%
          v_watch_time := FLOOR(v_views * v_duration * (v_completion_rate / 100.0)); -- Calculate based on completion rate
          v_engagement_rate := FLOOR(RANDOM() * 6) + 2; -- 2-8%
          
          INSERT INTO video_analytics (
            post_id,
            platform,
            video_url,
            duration,
            views,
            watch_time,
            completion_rate,
            likes,
            comments,
            shares,
            saves,
            click_through_rate,
            engagement_rate,
            retention_points,
            peak_concurrent_viewers,
            average_view_duration,
            replay_count,
            thumbnail_click_rate,
            user_id,
            created_at
          )
          VALUES (
            v_post_record.id,
            v_platform,
            'https://example.com/video/' || v_post_record.id || '/' || v_platform,
            v_duration,
            v_views,
            v_watch_time,
            v_completion_rate,
            FLOOR(RANDOM() * 200) + 20, -- 20-220 likes
            FLOOR(RANDOM() * 50) + 5,   -- 5-55 comments
            FLOOR(RANDOM() * 30) + 3,   -- 3-33 shares
            FLOOR(RANDOM() * 40) + 5,   -- 5-45 saves
            FLOOR(RANDOM() * 8) + 2,    -- 2-10% CTR
            v_engagement_rate,
            ARRAY[
              100,
              FLOOR(RANDOM() * 20) + 75, -- 75-95% at 25%
              FLOOR(RANDOM() * 25) + 60, -- 60-85% at 50%
              FLOOR(RANDOM() * 30) + 45, -- 45-75% at 75%
              FLOOR(RANDOM() * 35) + 30  -- 30-65% at 100%
            ],
            FLOOR(RANDOM() * 100) + 10, -- 10-110 peak viewers
            FLOOR(v_duration * (v_completion_rate / 100.0)), -- Average view duration
            FLOOR(RANDOM() * 50) + 5,   -- 5-55 replays
            FLOOR(RANDOM() * 15) + 5,   -- 5-20% thumbnail CTR
            v_user_id,
            NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30) -- Random date within last 30 days
          )
          ON CONFLICT DO NOTHING; -- Avoid duplicates if run multiple times
        END IF;
      END LOOP;
    END LOOP;
  END IF;
END $$;