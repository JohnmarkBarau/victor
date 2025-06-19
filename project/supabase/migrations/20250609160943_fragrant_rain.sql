/*
  # Fix missing foreign key constraints for team collaboration

  1. Missing Foreign Keys
    - Add foreign key constraint for `team_activity.user_id` → `auth.users(id)`
    - Add foreign key constraint for `post_approvals.requested_by` → `auth.users(id)` 
    - Add foreign key constraint for `post_approvals.approved_by` → `auth.users(id)`
    - Add foreign key constraint for `post_assignments.assigned_to` → `auth.users(id)`
    - Add foreign key constraint for `post_assignments.assigned_by` → `auth.users(id)`
    - Add foreign key constraint for `team_comments.user_id` → `auth.users(id)`

  2. Security
    - All tables already have RLS enabled
    - Existing policies remain unchanged

  3. Notes
    - These constraints are required for Supabase's automatic join functionality
    - Missing constraints prevent the application from fetching related user data
*/

-- Add foreign key constraint for team_activity.user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'team_activity_user_id_fkey' 
    AND table_name = 'team_activity'
  ) THEN
    ALTER TABLE team_activity 
    ADD CONSTRAINT team_activity_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key constraints for post_approvals
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'post_approvals_requested_by_fkey' 
    AND table_name = 'post_approvals'
  ) THEN
    ALTER TABLE post_approvals 
    ADD CONSTRAINT post_approvals_requested_by_fkey 
    FOREIGN KEY (requested_by) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'post_approvals_approved_by_fkey' 
    AND table_name = 'post_approvals'
  ) THEN
    ALTER TABLE post_approvals 
    ADD CONSTRAINT post_approvals_approved_by_fkey 
    FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add foreign key constraints for post_assignments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'post_assignments_assigned_to_fkey' 
    AND table_name = 'post_assignments'
  ) THEN
    ALTER TABLE post_assignments 
    ADD CONSTRAINT post_assignments_assigned_to_fkey 
    FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'post_assignments_assigned_by_fkey' 
    AND table_name = 'post_assignments'
  ) THEN
    ALTER TABLE post_assignments 
    ADD CONSTRAINT post_assignments_assigned_by_fkey 
    FOREIGN KEY (assigned_by) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key constraint for team_comments.user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'team_comments_user_id_fkey' 
    AND table_name = 'team_comments'
  ) THEN
    ALTER TABLE team_comments 
    ADD CONSTRAINT team_comments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;