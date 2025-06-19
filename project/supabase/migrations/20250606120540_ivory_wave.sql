/*
  # Team Collaboration Sample Data

  1. Sample Data
    - Create sample teams for demonstration
    - Add team memberships with proper roles
    - Link existing posts to teams
    - Create sample assignments and approvals
    - Add team activity entries

  2. Security
    - Respects existing RLS policies
    - Only creates data if no teams exist
    - Uses proper UUID casting for all references
*/

-- Insert sample teams (only if no teams exist)
DO $$
DECLARE
  sample_user_id uuid;
  sample_post_id uuid;
BEGIN
  -- Get a sample user ID
  SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
  
  -- Only proceed if we have a user and no teams exist
  IF sample_user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM teams LIMIT 1) THEN
    
    -- Sample teams
    INSERT INTO teams (id, name, description, created_by) VALUES
    ('11111111-1111-1111-1111-111111111111'::uuid, 'Marketing Team', 'Main marketing team for social media campaigns', sample_user_id),
    ('22222222-2222-2222-2222-222222222222'::uuid, 'Content Creators', 'Creative team focused on content production', sample_user_id),
    ('33333333-3333-3333-3333-333333333333'::uuid, 'Brand Management', 'Team responsible for brand consistency and messaging', sample_user_id);

    -- Add current user as owner of first team
    INSERT INTO team_members (team_id, user_id, role) VALUES
    ('11111111-1111-1111-1111-111111111111'::uuid, sample_user_id, 'owner');

    -- Sample team posts (link existing posts to teams if any exist)
    INSERT INTO team_posts (team_id, post_id)
    SELECT '11111111-1111-1111-1111-111111111111'::uuid, id
    FROM posts 
    WHERE user_id = sample_user_id
    LIMIT 3;

    -- Get a sample post ID for assignments and approvals
    SELECT id INTO sample_post_id FROM posts WHERE user_id = sample_user_id LIMIT 1;

    -- Sample assignments (only if we have posts)
    IF sample_post_id IS NOT NULL THEN
      INSERT INTO post_assignments (post_id, assigned_to, assigned_by, status, notes)
      SELECT 
        p.id,
        sample_user_id,
        sample_user_id,
        'pending',
        'Please review and optimize for Instagram engagement'
      FROM posts p
      WHERE p.user_id = sample_user_id
      LIMIT 2;

      -- Sample approvals
      INSERT INTO post_approvals (post_id, team_id, requested_by, status)
      SELECT 
        p.id,
        '11111111-1111-1111-1111-111111111111'::uuid,
        sample_user_id,
        'pending'
      FROM posts p
      WHERE p.user_id = sample_user_id
      LIMIT 1;

      -- Sample team activity with proper UUID casting
      INSERT INTO team_activity (team_id, user_id, action, entity_type, entity_id, metadata) VALUES
      ('11111111-1111-1111-1111-111111111111'::uuid, sample_user_id, 'team_created', 'team', '11111111-1111-1111-1111-111111111111'::uuid, '{"team_name": "Marketing Team"}'::jsonb),
      ('11111111-1111-1111-1111-111111111111'::uuid, sample_user_id, 'member_joined', 'member', sample_user_id, '{"role": "owner"}'::jsonb),
      ('11111111-1111-1111-1111-111111111111'::uuid, sample_user_id, 'post_created', 'post', sample_post_id, '{"platforms": ["instagram", "twitter"]}'::jsonb);
    ELSE
      -- If no posts exist, just add team creation activities
      INSERT INTO team_activity (team_id, user_id, action, entity_type, entity_id, metadata) VALUES
      ('11111111-1111-1111-1111-111111111111'::uuid, sample_user_id, 'team_created', 'team', '11111111-1111-1111-1111-111111111111'::uuid, '{"team_name": "Marketing Team"}'::jsonb),
      ('11111111-1111-1111-1111-111111111111'::uuid, sample_user_id, 'member_joined', 'member', sample_user_id, '{"role": "owner"}'::jsonb);
    END IF;

    -- Sample team comments (only if we have posts)
    IF sample_post_id IS NOT NULL THEN
      INSERT INTO team_comments (post_id, team_id, user_id, content)
      SELECT 
        sample_post_id,
        '11111111-1111-1111-1111-111111111111'::uuid,
        sample_user_id,
        'This looks great! Let''s schedule it for tomorrow morning.'
      WHERE EXISTS (SELECT 1 FROM posts WHERE id = sample_post_id);
    END IF;

  END IF;
END $$;