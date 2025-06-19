/*
  # Add missing foreign key constraints

  1. Foreign Key Constraints
    - Add foreign key constraint for `team_members.user_id` to `auth.users.id`
    - Add foreign key constraint for `post_approvals.requested_by` to `auth.users.id`
    - Add foreign key constraint for `post_approvals.approved_by` to `auth.users.id`
    - Add foreign key constraint for `post_assignments.assigned_to` to `auth.users.id`
    - Add foreign key constraint for `post_assignments.assigned_by` to `auth.users.id`
    - Add foreign key constraint for `team_comments.user_id` to `auth.users.id`
    - Add foreign key constraint for `team_activity.user_id` to `auth.users.id`

  2. Safety
    - Use IF NOT EXISTS pattern to prevent errors if constraints already exist
    - Use appropriate CASCADE and SET NULL behaviors
*/

-- Add foreign key constraint for team_members.user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_team_members_user_id' 
    AND table_name = 'team_members'
  ) THEN
    ALTER TABLE public.team_members
    ADD CONSTRAINT fk_team_members_user_id
    FOREIGN KEY (user_id)
    REFERENCES auth.users (id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key constraint for post_approvals.requested_by
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_post_approvals_requested_by' 
    AND table_name = 'post_approvals'
  ) THEN
    ALTER TABLE public.post_approvals
    ADD CONSTRAINT fk_post_approvals_requested_by
    FOREIGN KEY (requested_by)
    REFERENCES auth.users (id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key constraint for post_approvals.approved_by
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_post_approvals_approved_by' 
    AND table_name = 'post_approvals'
  ) THEN
    ALTER TABLE public.post_approvals
    ADD CONSTRAINT fk_post_approvals_approved_by
    FOREIGN KEY (approved_by)
    REFERENCES auth.users (id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Add foreign key constraint for post_assignments.assigned_to
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_post_assignments_assigned_to' 
    AND table_name = 'post_assignments'
  ) THEN
    ALTER TABLE public.post_assignments
    ADD CONSTRAINT fk_post_assignments_assigned_to
    FOREIGN KEY (assigned_to)
    REFERENCES auth.users (id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key constraint for post_assignments.assigned_by
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_post_assignments_assigned_by' 
    AND table_name = 'post_assignments'
  ) THEN
    ALTER TABLE public.post_assignments
    ADD CONSTRAINT fk_post_assignments_assigned_by
    FOREIGN KEY (assigned_by)
    REFERENCES auth.users (id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key constraint for team_comments.user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_team_comments_user_id' 
    AND table_name = 'team_comments'
  ) THEN
    ALTER TABLE public.team_comments
    ADD CONSTRAINT fk_team_comments_user_id
    FOREIGN KEY (user_id)
    REFERENCES auth.users (id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key constraint for team_activity.user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_team_activity_user_id' 
    AND table_name = 'team_activity'
  ) THEN
    ALTER TABLE public.team_activity
    ADD CONSTRAINT fk_team_activity_user_id
    FOREIGN KEY (user_id)
    REFERENCES auth.users (id)
    ON DELETE CASCADE;
  END IF;
END $$;