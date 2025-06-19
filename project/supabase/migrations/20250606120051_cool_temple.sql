/*
  # Team Collaboration System

  1. New Tables
    - `teams` - Team information and settings
    - `team_members` - Team membership with roles
    - `team_invitations` - Pending team invitations
    - `team_posts` - Posts assigned to teams
    - `post_assignments` - Individual post assignments
    - `post_approvals` - Approval workflow tracking
    - `team_comments` - Internal team comments on posts
    - `team_activity` - Activity feed for teams

  2. Security
    - Enable RLS on all new tables
    - Add policies for team-based access control
    - Ensure users can only access their team data

  3. Features
    - Role-based permissions (owner, admin, editor, viewer)
    - Post approval workflows
    - Team activity tracking
    - Internal commenting system
*/

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  avatar_url text,
  settings jsonb DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team members with roles
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  permissions jsonb DEFAULT '{}',
  joined_at timestamptz DEFAULT now(),
  invited_by uuid REFERENCES auth.users(id),
  UNIQUE(team_id, user_id)
);

-- Team invitations
CREATE TABLE IF NOT EXISTS team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  invited_by uuid REFERENCES auth.users(id) NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_id, email)
);

-- Team posts (links posts to teams)
CREATE TABLE IF NOT EXISTS team_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_id, post_id)
);

-- Post assignments
CREATE TABLE IF NOT EXISTS post_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_by uuid REFERENCES auth.users(id) NOT NULL,
  due_date timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Post approval workflow
CREATE TABLE IF NOT EXISTS post_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  requested_by uuid REFERENCES auth.users(id) NOT NULL,
  approved_by uuid REFERENCES auth.users(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  feedback text,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team comments (internal collaboration)
CREATE TABLE IF NOT EXISTS team_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  parent_id uuid REFERENCES team_comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team activity feed
CREATE TABLE IF NOT EXISTS team_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activity ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Users can view teams they belong to"
  ON teams FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners and admins can update teams"
  ON teams FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Team members policies
CREATE POLICY "Users can view team members of their teams"
  ON team_members FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners and admins can manage members"
  ON team_members FOR ALL
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Team invitations policies
CREATE POLICY "Users can view invitations for their teams"
  ON team_invitations FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team owners and admins can manage invitations"
  ON team_invitations FOR ALL
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Team posts policies
CREATE POLICY "Team members can view team posts"
  ON team_posts FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team editors and above can manage team posts"
  ON team_posts FOR ALL
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'editor')
    )
  );

-- Post assignments policies
CREATE POLICY "Users can view assignments for their team posts"
  ON post_assignments FOR SELECT
  TO authenticated
  USING (
    post_id IN (
      SELECT tp.post_id FROM team_posts tp
      JOIN team_members tm ON tp.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team editors and above can manage assignments"
  ON post_assignments FOR ALL
  TO authenticated
  USING (
    post_id IN (
      SELECT tp.post_id FROM team_posts tp
      JOIN team_members tm ON tp.team_id = tm.team_id
      WHERE tm.user_id = auth.uid() 
      AND tm.role IN ('owner', 'admin', 'editor')
    )
  );

-- Post approvals policies
CREATE POLICY "Team members can view approvals for their teams"
  ON post_approvals FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can request approvals"
  ON post_approvals FOR INSERT
  TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    ) AND requested_by = auth.uid()
  );

CREATE POLICY "Team admins and owners can approve posts"
  ON post_approvals FOR UPDATE
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Team comments policies
CREATE POLICY "Team members can view team comments"
  ON team_comments FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create comments"
  ON team_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    ) AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own comments"
  ON team_comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Team activity policies
CREATE POLICY "Team members can view team activity"
  ON team_activity FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create activity entries"
  ON team_activity FOR INSERT
  TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_posts_team_id ON team_posts(team_id);
CREATE INDEX IF NOT EXISTS idx_team_posts_post_id ON team_posts(post_id);
CREATE INDEX IF NOT EXISTS idx_post_assignments_post_id ON post_assignments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_assignments_assigned_to ON post_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_post_approvals_post_id ON post_approvals(post_id);
CREATE INDEX IF NOT EXISTS idx_post_approvals_team_id ON post_approvals(team_id);
CREATE INDEX IF NOT EXISTS idx_team_comments_post_id ON team_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_team_comments_team_id ON team_comments(team_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_team_id ON team_activity(team_id);