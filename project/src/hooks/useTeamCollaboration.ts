import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { PostAssignment, PostApproval, TeamComment, TeamActivity } from './useTeams';

export function useTeamCollaboration(teamId?: string) {
  const [assignments, setAssignments] = useState<PostAssignment[]>([]);
  const [approvals, setApprovals] = useState<PostApproval[]>([]);
  const [teamComments, setTeamComments] = useState<TeamComment[]>([]);
  const [teamActivity, setTeamActivity] = useState<TeamActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const fetchAssignments = async () => {
    if (!user || !teamId) return;

    try {
      const { data, error } = await supabase
        .from('post_assignments')
        .select(`
          *,
          assignee:users!assigned_to(email, full_name),
          assigner:users!assigned_by(email, full_name),
          post:posts(content, platforms, status)
        `)
        .in('post_id', 
          supabase
            .from('team_posts')
            .select('post_id')
            .eq('team_id', teamId)
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const createAssignment = async (
    postId: string,
    assignedTo: string,
    dueDate?: string,
    notes?: string
  ): Promise<PostAssignment> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('post_assignments')
      .insert({
        post_id: postId,
        assigned_to: assignedTo,
        assigned_by: user.id,
        due_date: dueDate,
        notes
      })
      .select(`
        *,
        assignee:users!assigned_to(email, full_name),
        assigner:users!assigned_by(email, full_name),
        post:posts(content, platforms, status)
      `)
      .single();

    if (error) throw error;

    setAssignments(prev => [data, ...prev]);
    await logActivity('assignment_created', 'assignment', data.id, {
      post_id: postId,
      assigned_to: assignedTo
    });

    return data;
  };

  const updateAssignmentStatus = async (
    assignmentId: string,
    status: PostAssignment['status']
  ): Promise<PostAssignment> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('post_assignments')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', assignmentId)
      .select(`
        *,
        assignee:users!assigned_to(email, full_name),
        assigner:users!assigned_by(email, full_name),
        post:posts(content, platforms, status)
      `)
      .single();

    if (error) throw error;

    setAssignments(prev => prev.map(assignment => 
      assignment.id === assignmentId ? data : assignment
    ));

    await logActivity('assignment_updated', 'assignment', assignmentId, {
      status
    });

    return data;
  };

  const fetchApprovals = async () => {
    if (!user || !teamId) return;

    try {
      const { data, error } = await supabase
        .from('post_approvals')
        .select(`
          *,
          requester:users!requested_by(email, full_name),
          approver:users!approved_by(email, full_name),
          post:posts(content, platforms)
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApprovals(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const requestApproval = async (
    postId: string,
    teamId: string
  ): Promise<PostApproval> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('post_approvals')
      .insert({
        post_id: postId,
        team_id: teamId,
        requested_by: user.id
      })
      .select(`
        *,
        requester:users!requested_by(email, full_name),
        post:posts(content, platforms)
      `)
      .single();

    if (error) throw error;

    setApprovals(prev => [data, ...prev]);
    await logActivity('approval_requested', 'approval', data.id, {
      post_id: postId
    });

    return data;
  };

  const updateApproval = async (
    approvalId: string,
    status: PostApproval['status'],
    feedback?: string
  ): Promise<PostApproval> => {
    if (!user) throw new Error('User not authenticated');

    const updateData: any = {
      status,
      feedback,
      updated_at: new Date().toISOString()
    };

    if (status === 'approved') {
      updateData.approved_by = user.id;
      updateData.approved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('post_approvals')
      .update(updateData)
      .eq('id', approvalId)
      .select(`
        *,
        requester:users!requested_by(email, full_name),
        approver:users!approved_by(email, full_name),
        post:posts(content, platforms)
      `)
      .single();

    if (error) throw error;

    setApprovals(prev => prev.map(approval => 
      approval.id === approvalId ? data : approval
    ));

    await logActivity('approval_updated', 'approval', approvalId, {
      status,
      feedback
    });

    return data;
  };

  const fetchTeamComments = async (postId?: string) => {
    if (!user || !teamId) return;

    try {
      let query = supabase
        .from('team_comments')
        .select(`
          *,
          user:users!user_id(email, full_name, avatar_url)
        `)
        .eq('team_id', teamId)
        .is('parent_id', null)
        .order('created_at', { ascending: true });

      if (postId) {
        query = query.eq('post_id', postId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: replies } = await supabase
            .from('team_comments')
            .select(`
              *,
              user:users!user_id(email, full_name, avatar_url)
            `)
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true });

          return {
            ...comment,
            replies: replies || []
          };
        })
      );

      setTeamComments(commentsWithReplies);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const createTeamComment = async (
    postId: string,
    content: string,
    parentId?: string
  ): Promise<TeamComment> => {
    if (!user || !teamId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('team_comments')
      .insert({
        post_id: postId,
        team_id: teamId,
        user_id: user.id,
        content,
        parent_id: parentId
      })
      .select(`
        *,
        user:users!user_id(email, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    if (parentId) {
      // Update replies for parent comment
      setTeamComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { ...comment, replies: [...(comment.replies || []), data] }
          : comment
      ));
    } else {
      setTeamComments(prev => [...prev, { ...data, replies: [] }]);
    }

    await logActivity('comment_created', 'comment', data.id, {
      post_id: postId,
      content: content.substring(0, 100)
    });

    return data;
  };

  const fetchTeamActivity = async () => {
    if (!user || !teamId) return;

    try {
      const { data, error } = await supabase
        .from('team_activity')
        .select(`
          *,
          user:users!user_id(email, full_name, avatar_url)
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTeamActivity(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const logActivity = async (
    action: string,
    entityType: string,
    entityId: string,
    metadata: Record<string, any> = {}
  ) => {
    if (!user || !teamId) return;

    try {
      await supabase
        .from('team_activity')
        .insert({
          team_id: teamId,
          user_id: user.id,
          action,
          entity_type: entityType,
          entity_id: entityId,
          metadata
        });

      // Refresh activity feed
      await fetchTeamActivity();
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  };

  const getMyAssignments = () => {
    return assignments.filter(assignment => assignment.assigned_to === user?.id);
  };

  const getPendingApprovals = () => {
    return approvals.filter(approval => approval.status === 'pending');
  };

  const getOverdueAssignments = () => {
    const now = new Date();
    return assignments.filter(assignment => 
      assignment.due_date && 
      new Date(assignment.due_date) < now && 
      assignment.status !== 'completed'
    );
  };

  useEffect(() => {
    if (teamId) {
      setLoading(true);
      Promise.all([
        fetchAssignments(),
        fetchApprovals(),
        fetchTeamActivity()
      ]).finally(() => setLoading(false));
    }
  }, [teamId, user]);

  return {
    assignments,
    approvals,
    teamComments,
    teamActivity,
    loading,
    error,
    createAssignment,
    updateAssignmentStatus,
    requestApproval,
    updateApproval,
    fetchTeamComments,
    createTeamComment,
    logActivity,
    getMyAssignments,
    getPendingApprovals,
    getOverdueAssignments,
    fetchAssignments,
    fetchApprovals,
    fetchTeamActivity
  };
}