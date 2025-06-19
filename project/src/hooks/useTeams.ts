import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export interface Team {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  settings: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_role?: string;
  member_count?: number;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  permissions: Record<string, any>;
  joined_at: string;
  invited_by?: string;
  user?: {
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  invited_by: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  team?: {
    name: string;
  };
  inviter?: {
    email: string;
    full_name?: string;
  };
}

export interface PostAssignment {
  id: string;
  post_id: string;
  assigned_to: string;
  assigned_by: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  notes?: string;
  created_at: string;
  updated_at: string;
  assignee?: {
    email: string;
    full_name?: string;
  };
  assigner?: {
    email: string;
    full_name?: string;
  };
  post?: {
    content: string;
    platforms: string[];
    status: string;
  };
}

export interface PostApproval {
  id: string;
  post_id: string;
  team_id: string;
  requested_by: string;
  approved_by?: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  feedback?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  requester?: {
    email: string;
    full_name?: string;
  };
  approver?: {
    email: string;
    full_name?: string;
  };
  post?: {
    content: string;
    platforms: string[];
  };
}

export interface TeamComment {
  id: string;
  post_id: string;
  team_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
  replies?: TeamComment[];
}

export interface TeamActivity {
  id: string;
  team_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, any>;
  created_at: string;
  user?: {
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamInvitations, setTeamInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const fetchTeams = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // First get teams where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      if (!memberData || memberData.length === 0) {
        setTeams([]);
        setLoading(false);
        return;
      }

      const teamIds = memberData.map(m => m.team_id);

      // Then get the team details
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .in('id', teamIds)
        .order('created_at', { ascending: false });

      if (teamsError) throw teamsError;

      // Get member counts for each team
      const teamsWithCounts = await Promise.all(
        (teamsData || []).map(async (team) => {
          const { count } = await supabase
            .from('team_members')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', team.id);

          const memberRole = memberData.find(m => m.team_id === team.id)?.role;

          return {
            ...team,
            member_role: memberRole,
            member_count: count || 0
          };
        })
      );

      setTeams(teamsWithCounts);
      
      // Set current team if none selected
      if (!currentTeam && teamsWithCounts.length > 0) {
        setCurrentTeam(teamsWithCounts[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (teamData: { name: string; description?: string }): Promise<Team> => {
    if (!user) throw new Error('User not authenticated');

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        ...teamData,
        created_by: user.id
      })
      .select()
      .single();

    if (teamError) throw teamError;

    // Add creator as owner
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: user.id,
        role: 'owner'
      });

    if (memberError) throw memberError;

    await fetchTeams();
    return team;
  };

  const updateTeam = async (teamId: string, updates: Partial<Team>): Promise<Team> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('teams')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', teamId)
      .select()
      .single();

    if (error) throw error;

    setTeams(prev => prev.map(team => team.id === teamId ? { ...team, ...data } : team));
    if (currentTeam?.id === teamId) {
      setCurrentTeam(prev => prev ? { ...prev, ...data } : null);
    }

    return data;
  };

  const deleteTeam = async (teamId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) throw error;

    setTeams(prev => prev.filter(team => team.id !== teamId));
    if (currentTeam?.id === teamId) {
      setCurrentTeam(null);
    }
  };

  const fetchTeamMembers = async (teamId: string) => {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        user:users!user_id(email, full_name, avatar_url)
      `)
      .eq('team_id', teamId)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    setTeamMembers(data || []);
  };

  const inviteTeamMember = async (
    teamId: string, 
    email: string, 
    role: 'admin' | 'editor' | 'viewer'
  ): Promise<TeamInvitation> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('team_invitations')
      .insert({
        team_id: teamId,
        email,
        role,
        invited_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    // TODO: Send invitation email
    await fetchTeamInvitations(teamId);
    return data;
  };

  const updateMemberRole = async (
    memberId: string, 
    role: 'admin' | 'editor' | 'viewer'
  ): Promise<TeamMember> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;

    setTeamMembers(prev => prev.map(member => 
      member.id === memberId ? { ...member, role } : member
    ));

    return data;
  };

  const removeMember = async (memberId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (error) throw error;

    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
  };

  const fetchTeamInvitations = async (teamId: string) => {
    const { data, error } = await supabase
      .from('team_invitations')
      .select(`
        *,
        team:teams(name),
        inviter:users!invited_by(email, full_name)
      `)
      .eq('team_id', teamId)
      .is('accepted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setTeamInvitations(data || []);
  };

  const acceptInvitation = async (invitationId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    // Get invitation details
    const { data: invitation, error: inviteError } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    if (inviteError) throw inviteError;

    // Add user to team
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: invitation.team_id,
        user_id: user.id,
        role: invitation.role,
        invited_by: invitation.invited_by
      });

    if (memberError) throw memberError;

    // Mark invitation as accepted
    const { error: updateError } = await supabase
      .from('team_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitationId);

    if (updateError) throw updateError;

    await fetchTeams();
  };

  const getUserRole = (teamId: string): string | null => {
    const team = teams.find(t => t.id === teamId);
    return team?.member_role || null;
  };

  const canManageTeam = (teamId: string): boolean => {
    const role = getUserRole(teamId);
    return role === 'owner' || role === 'admin';
  };

  const canEditContent = (teamId: string): boolean => {
    const role = getUserRole(teamId);
    return role === 'owner' || role === 'admin' || role === 'editor';
  };

  useEffect(() => {
    fetchTeams();
  }, [user]);

  useEffect(() => {
    if (currentTeam) {
      fetchTeamMembers(currentTeam.id);
      fetchTeamInvitations(currentTeam.id);
    }
  }, [currentTeam]);

  return {
    teams,
    currentTeam,
    setCurrentTeam,
    teamMembers,
    teamInvitations,
    loading,
    error,
    createTeam,
    updateTeam,
    deleteTeam,
    inviteTeamMember,
    updateMemberRole,
    removeMember,
    acceptInvitation,
    fetchTeams,
    fetchTeamMembers,
    fetchTeamInvitations,
    getUserRole,
    canManageTeam,
    canEditContent
  };
}