/*
  # Complete fix for team_members infinite recursion

  1. Problem Analysis
    - The team_members table has policies that reference itself, causing infinite recursion
    - Multiple policies are trying to query team_members within team_members policies
    - This creates circular dependencies that PostgreSQL cannot resolve

  2. Solution
    - Drop ALL existing policies on team_members and related tables
    - Create new, simplified policies that avoid self-referencing queries
    - Use direct relationships where possible instead of complex joins
    - Separate concerns: team ownership vs team membership

  3. Security Model
    - Team owners (teams.created_by) can manage everything in their teams
    - Team members can only view and manage their own membership
    - No recursive queries within the same table's policies
*/

-- First, drop ALL existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their own team membership" ON team_members;
DROP POLICY IF EXISTS "Users can insert their own team membership" ON team_members;
DROP POLICY IF EXISTS "Users can update their own team membership" ON team_members;
DROP POLICY IF EXISTS "Users can delete their own team membership" ON team_members;
DROP POLICY IF EXISTS "Team owners can manage all team members" ON team_members;
DROP POLICY IF EXISTS "Team owners and admins can manage members" ON team_members;
DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;

-- Drop related policies that might reference team_members
DROP POLICY IF EXISTS "Users can view teams they belong to" ON teams;
DROP POLICY IF EXISTS "Team owners can manage invitations" ON team_invitations;
DROP POLICY IF EXISTS "Team owners can manage team posts" ON team_posts;
DROP POLICY IF EXISTS "Team members can view team posts" ON team_posts;
DROP POLICY IF EXISTS "Team owners can manage assignments" ON post_assignments;
DROP POLICY IF EXISTS "Users can view assignments for their team posts" ON post_assignments;
DROP POLICY IF EXISTS "Team owners can approve posts" ON post_approvals;
DROP POLICY IF EXISTS "Team members can create comments" ON team_comments;
DROP POLICY IF EXISTS "Team members can create activity entries" ON team_activity;

-- Create new, non-recursive policies for team_members
-- These policies are simple and don't reference team_members within team_members

-- Policy 1: Users can always see their own team memberships
CREATE POLICY "Users can read own memberships"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Users can insert their own memberships (for accepting invitations)
CREATE POLICY "Users can insert own memberships"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy 3: Users can update their own memberships
CREATE POLICY "Users can update own memberships"
  ON team_members
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy 4: Users can delete their own memberships (leave team)
CREATE POLICY "Users can delete own memberships"
  ON team_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 5: Team owners can manage ALL team members (using teams table directly)
CREATE POLICY "Team owners manage members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    team_id IN (
      SELECT id FROM teams WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    team_id IN (
      SELECT id FROM teams WHERE created_by = auth.uid()
    )
  );

-- Now create simplified policies for other tables that don't cause recursion

-- Teams policies (simplified)
CREATE POLICY "Users can view own teams"
  ON teams
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Team invitations policies (simplified)
CREATE POLICY "Team owners manage invitations"
  ON team_invitations
  FOR ALL
  TO authenticated
  USING (
    team_id IN (
      SELECT id FROM teams WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    team_id IN (
      SELECT id FROM teams WHERE created_by = auth.uid()
    )
  );

-- Team posts policies (simplified)
CREATE POLICY "Team owners manage posts"
  ON team_posts
  FOR ALL
  TO authenticated
  USING (
    team_id IN (
      SELECT id FROM teams WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    team_id IN (
      SELECT id FROM teams WHERE created_by = auth.uid()
    )
  );

-- Post assignments policies (simplified)
CREATE POLICY "Team owners manage assignments"
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

-- Post approvals policies (simplified)
CREATE POLICY "Team members request approvals"
  ON post_approvals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    requested_by = auth.uid()
  );

CREATE POLICY "Team members view approvals"
  ON post_approvals
  FOR SELECT
  TO authenticated
  USING (
    requested_by = auth.uid() OR
    team_id IN (
      SELECT id FROM teams WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Team owners update approvals"
  ON post_approvals
  FOR UPDATE
  TO authenticated
  USING (
    team_id IN (
      SELECT id FROM teams WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    team_id IN (
      SELECT id FROM teams WHERE created_by = auth.uid()
    )
  );

-- Team comments policies (simplified)
CREATE POLICY "Team members view comments"
  ON team_comments
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    team_id IN (
      SELECT id FROM teams WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Team members create comments"
  ON team_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own comments"
  ON team_comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Team activity policies (simplified)
CREATE POLICY "Team members view activity"
  ON team_activity
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    team_id IN (
      SELECT id FROM teams WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Team members create activity"
  ON team_activity
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create a function to safely check team membership (if needed later)
-- This function can be used in application logic instead of policies
CREATE OR REPLACE FUNCTION is_team_member(team_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_id = team_uuid AND user_id = user_uuid
  );
$$;

-- Create a function to safely check team ownership
CREATE OR REPLACE FUNCTION is_team_owner(team_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM teams 
    WHERE id = team_uuid AND created_by = user_uuid
  );
$$;