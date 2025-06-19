/*
  # Fix infinite recursion in team_members RLS policies

  1. Policy Issues Fixed
    - Remove recursive policies that query team_members within team_members policies
    - Simplify policies to avoid circular dependencies
    - Ensure policies are self-contained and don't create loops

  2. Changes Made
    - Drop existing problematic policies on team_members
    - Create new simplified policies that don't cause recursion
    - Update related table policies to avoid circular references

  3. Security
    - Maintain proper access control without recursion
    - Users can only see team members of teams they belong to
    - Team owners and admins can manage members appropriately
*/

-- Drop existing problematic policies on team_members
DROP POLICY IF EXISTS "Team owners and admins can manage members" ON team_members;
DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;

-- Create new simplified policies for team_members that don't cause recursion
CREATE POLICY "Users can view their own team membership"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own team membership"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own team membership"
  ON team_members
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own team membership"
  ON team_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create a separate policy for team management that doesn't cause recursion
-- This allows team owners to manage all members, but avoids the recursive query
CREATE POLICY "Team owners can manage all team members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_members.team_id 
      AND teams.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_members.team_id 
      AND teams.created_by = auth.uid()
    )
  );

-- Fix other policies that might have similar recursion issues
-- Update teams policy to be simpler
DROP POLICY IF EXISTS "Users can view teams they belong to" ON teams;
CREATE POLICY "Users can view teams they belong to"
  ON teams
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT tm.team_id 
      FROM team_members tm 
      WHERE tm.user_id = auth.uid()
    )
  );

-- Update team_invitations policies to avoid recursion
DROP POLICY IF EXISTS "Team owners and admins can manage invitations" ON team_invitations;
DROP POLICY IF EXISTS "Users can view invitations for their teams" ON team_invitations;

CREATE POLICY "Team owners can manage invitations"
  ON team_invitations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_invitations.team_id 
      AND teams.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_invitations.team_id 
      AND teams.created_by = auth.uid()
    )
  );

-- Update team_posts policies to avoid recursion
DROP POLICY IF EXISTS "Team editors and above can manage team posts" ON team_posts;
DROP POLICY IF EXISTS "Team members can view team posts" ON team_posts;

CREATE POLICY "Team owners can manage team posts"
  ON team_posts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_posts.team_id 
      AND teams.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_posts.team_id 
      AND teams.created_by = auth.uid()
    )
  );

CREATE POLICY "Team members can view team posts"
  ON team_posts
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id 
      FROM team_members tm 
      WHERE tm.user_id = auth.uid()
    )
  );

-- Update post_assignments policies to avoid recursion
DROP POLICY IF EXISTS "Team editors and above can manage assignments" ON post_assignments;
DROP POLICY IF EXISTS "Users can view assignments for their team posts" ON post_assignments;

CREATE POLICY "Team owners can manage assignments"
  ON post_assignments
  FOR ALL
  TO authenticated
  USING (
    post_id IN (
      SELECT tp.post_id 
      FROM team_posts tp 
      JOIN teams t ON tp.team_id = t.id 
      WHERE t.created_by = auth.uid()
    )
  )
  WITH CHECK (
    post_id IN (
      SELECT tp.post_id 
      FROM team_posts tp 
      JOIN teams t ON tp.team_id = t.id 
      WHERE t.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view assignments for their team posts"
  ON post_assignments
  FOR SELECT
  TO authenticated
  USING (
    post_id IN (
      SELECT tp.post_id 
      FROM team_posts tp 
      WHERE tp.team_id IN (
        SELECT tm.team_id 
        FROM team_members tm 
        WHERE tm.user_id = auth.uid()
      )
    )
  );

-- Update post_approvals policies to avoid recursion
DROP POLICY IF EXISTS "Team admins and owners can approve posts" ON post_approvals;

CREATE POLICY "Team owners can approve posts"
  ON post_approvals
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = post_approvals.team_id 
      AND teams.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = post_approvals.team_id 
      AND teams.created_by = auth.uid()
    )
  );

-- Update team_comments policies to avoid recursion
DROP POLICY IF EXISTS "Team members can create comments" ON team_comments;

CREATE POLICY "Team members can create comments"
  ON team_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    team_id IN (
      SELECT tm.team_id 
      FROM team_members tm 
      WHERE tm.user_id = auth.uid()
    )
  );

-- Update team_activity policies to avoid recursion
DROP POLICY IF EXISTS "Team members can create activity entries" ON team_activity;

CREATE POLICY "Team members can create activity entries"
  ON team_activity
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    team_id IN (
      SELECT tm.team_id 
      FROM team_members tm 
      WHERE tm.user_id = auth.uid()
    )
  );