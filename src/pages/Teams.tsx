import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { AIContentGenerator } from '../components/ai/AIContentGenerator';
import {
  Users,
  Plus,
  Settings,
  UserPlus,
  Crown,
  Shield,
  Edit,
  Eye,
  MoreHorizontal,
  Calendar,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Activity,
  TrendingUp,
  FileText,
  Send,
  Loader2,
  Mail,
  Trash2,
  Star,
  Target,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { useTeams } from '../hooks/useTeams';
import { useTeamCollaboration } from '../hooks/useTeamCollaboration';
import { usePosts } from '../hooks/usePosts';

export default function Teams() {
  const {
    teams,
    currentTeam,
    setCurrentTeam,
    teamMembers,
    teamInvitations,
    loading,
    error,
    createTeam,
    inviteTeamMember,
    updateMemberRole,
    removeMember,
    canManageTeam,
    canEditContent
  } = useTeams();

  const {
    assignments,
    approvals,
    teamActivity,
    getMyAssignments,
    getPendingApprovals,
    getOverdueAssignments,
    createAssignment,
    updateAssignmentStatus,
    requestApproval,
    updateApproval,
    createTeamComment,
    fetchTeamComments,
    teamComments
  } = useTeamCollaboration(currentTeam?.id);

  const { posts, createPost } = usePosts();

  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'assignments' | 'approvals' | 'activity' | 'ai-content'>('overview');
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const myAssignments = getMyAssignments();
  const pendingApprovals = getPendingApprovals();
  const overdueAssignments = getOverdueAssignments();

  useEffect(() => {
    if (currentTeam && selectedPost) {
      fetchTeamComments(selectedPost);
    }
  }, [currentTeam, selectedPost, fetchTeamComments]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;

    setIsCreatingTeam(true);
    try {
      const team = await createTeam({
        name: newTeamName,
        description: newTeamDescription
      });
      setCurrentTeam(team);
      setShowCreateTeam(false);
      setNewTeamName('');
      setNewTeamDescription('');
    } catch (err) {
      console.error('Error creating team:', err);
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !currentTeam) return;

    setIsInviting(true);
    try {
      await inviteTeamMember(currentTeam.id, inviteEmail, inviteRole);
      setShowInviteMember(false);
      setInviteEmail('');
      setInviteRole('editor');
    } catch (err) {
      console.error('Error inviting member:', err);
    } finally {
      setIsInviting(false);
    }
  };

  const handleCreatePostFromAI = async (content: string) => {
    try {
      await createPost({
        content,
        platforms: ['instagram', 'twitter'],
        status: 'draft'
      });
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'editor':
        return <Edit className="w-4 h-4 text-green-500" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Yet</h3>
        <p className="text-gray-500 mb-6">
          Create your first team to start collaborating on social media content.
        </p>
        <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Set up a new team for collaborative content creation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name
                </label>
                <Input
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g., Marketing Team"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <Input
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  placeholder="Brief description of the team's purpose"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateTeam}
                  disabled={isCreatingTeam || !newTeamName.trim()}
                  className="flex-1"
                >
                  {isCreatingTeam ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Team'
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateTeam(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Team Collaboration</h1>
          <p className="text-gray-600 mt-1">
            Collaborate with your team on social media content creation and management
          </p>
        </div>
        <div className="flex items-center gap-3">
          {currentTeam && (
            <select
              value={currentTeam.id}
              onChange={(e) => {
                const team = teams.find(t => t.id === e.target.value);
                if (team) setCurrentTeam(team);
              }}
              className="px-3 py-2 border rounded-md"
            >
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          )}
          <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                New Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Set up a new team for collaborative content creation.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name
                  </label>
                  <Input
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g., Marketing Team"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <Input
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    placeholder="Brief description of the team's purpose"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateTeam}
                    disabled={isCreatingTeam || !newTeamName.trim()}
                    className="flex-1"
                  >
                    {isCreatingTeam ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Team'
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateTeam(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {currentTeam && (
        <>
          {/* Team Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{currentTeam.name}</h2>
                    {currentTeam.description && (
                      <p className="text-gray-600">{currentTeam.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{currentTeam.member_count} members</span>
                      <span>•</span>
                      <span>Your role: {currentTeam.member_role}</span>
                    </div>
                  </div>
                </div>
                {canManageTeam(currentTeam.id) && (
                  <Dialog open={showInviteMember} onOpenChange={setShowInviteMember}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>
                          Send an invitation to join {currentTeam.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <Input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="colleague@company.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                          </label>
                          <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value as typeof inviteRole)}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="viewer">Viewer - Can view content</option>
                            <option value="editor">Editor - Can create and edit content</option>
                            <option value="admin">Admin - Can manage team and members</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleInviteMember}
                            disabled={isInviting || !inviteEmail.trim()}
                            className="flex-1"
                          >
                            {isInviting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Invitation
                              </>
                            )}
                          </Button>
                          <Button variant="outline" onClick={() => setShowInviteMember(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">My Assignments</p>
                    <p className="text-2xl font-bold text-gray-900">{myAssignments.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pending Approvals</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingApprovals.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Overdue Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{overdueAssignments.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Team Members</p>
                    <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
            <TabsList className="w-full border-b bg-white">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="ai-content" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Content
              </TabsTrigger>
              <TabsTrigger value="members" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Members
              </TabsTrigger>
              <TabsTrigger value="assignments" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Assignments
              </TabsTrigger>
              <TabsTrigger value="approvals" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Approvals
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {teamActivity.length > 0 ? (
                      <div className="space-y-3">
                        {teamActivity.slice(0, 5).map((activity) => (
                          <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Activity className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">
                                {activity.action.replace('_', ' ')} {activity.entity_type}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(activity.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No recent activity</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Team Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Completed Assignments</span>
                        <span className="font-semibold">
                          {assignments.filter(a => a.status === 'completed').length} / {assignments.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Approval Rate</span>
                        <span className="font-semibold">
                          {approvals.length > 0 
                            ? Math.round((approvals.filter(a => a.status === 'approved').length / approvals.length) * 100)
                            : 0
                          }%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Active Members</span>
                        <span className="font-semibold">{teamMembers.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ai-content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    Team AI Content Generator
                  </CardTitle>
                  <CardDescription>
                    Generate content collaboratively with your team using AI assistance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AIContentGenerator 
                    onContentGenerated={handleCreatePostFromAI}
                    platforms={['instagram', 'twitter', 'linkedin']}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.user?.full_name || member.user?.email}
                            </p>
                            <div className="flex items-center gap-2">
                              {getRoleIcon(member.role)}
                              <span className="text-sm text-gray-500 capitalize">{member.role}</span>
                            </div>
                          </div>
                        </div>
                        {canManageTeam(currentTeam.id) && member.role !== 'owner' && (
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {teamInvitations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Invitations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {teamInvitations.map((invitation) => (
                        <div key={invitation.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{invitation.email}</p>
                            <p className="text-sm text-gray-500">
                              Invited as {invitation.role} • {new Date(invitation.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="warning">Pending</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="assignments" className="space-y-6">
              <div className="space-y-4">
                {assignments.length > 0 ? (
                  assignments.map((assignment) => (
                    <Card key={assignment.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getStatusColor(assignment.status)}>
                                {assignment.status.replace('_', ' ')}
                              </Badge>
                              {assignment.due_date && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Calendar className="w-4 h-4" />
                                  Due {new Date(assignment.due_date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            <p className="text-gray-900 mb-2">
                              {assignment.post?.content.substring(0, 100)}...
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Assigned to: {assignment.assignee?.full_name || assignment.assignee?.email}</span>
                              <span>•</span>
                              <span>By: {assignment.assigner?.full_name || assignment.assigner?.email}</span>
                            </div>
                            {assignment.notes && (
                              <p className="text-sm text-gray-600 mt-2 italic">{assignment.notes}</p>
                            )}
                          </div>
                          {canEditContent(currentTeam.id) && (
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments</h3>
                    <p className="text-gray-500">Team assignments will appear here when created.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="approvals" className="space-y-6">
              <div className="space-y-4">
                {approvals.length > 0 ? (
                  approvals.map((approval) => (
                    <Card key={approval.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getStatusColor(approval.status)}>
                                {approval.status.replace('_', ' ')}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                Requested {new Date(approval.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-900 mb-2">
                              {approval.post?.content.substring(0, 100)}...
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Requested by: {approval.requester?.full_name || approval.requester?.email}</span>
                              {approval.approved_by && (
                                <>
                                  <span>•</span>
                                  <span>Approved by: {approval.approver?.full_name || approval.approver?.email}</span>
                                </>
                              )}
                            </div>
                            {approval.feedback && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">{approval.feedback}</p>
                              </div>
                            )}
                          </div>
                          {canManageTeam(currentTeam.id) && approval.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => updateApproval(approval.id, 'approved')}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateApproval(approval.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Approvals</h3>
                    <p className="text-gray-500">Content approval requests will appear here.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <div className="space-y-4">
                {teamActivity.length > 0 ? (
                  teamActivity.map((activity) => (
                    <Card key={activity.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Activity className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              <span className="font-medium">
                                {activity.user?.full_name || activity.user?.email}
                              </span>{' '}
                              {activity.action.replace('_', ' ')} {activity.entity_type}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.created_at).toLocaleString()}
                            </p>
                            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                              <div className="mt-2 text-xs text-gray-600">
                                {JSON.stringify(activity.metadata, null, 2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity</h3>
                    <p className="text-gray-500">Team activity will appear here as members collaborate.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}