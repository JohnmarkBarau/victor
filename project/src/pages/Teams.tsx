import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Settings, 
  Crown, 
  Shield, 
  Edit3, 
  Eye,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Activity,
  UserPlus,
  MoreHorizontal,
  Trash2,
  Copy,
  Send,
  Filter,
  Search,
  Bell,
  Target,
  TrendingUp,
  FileText,
  Loader2,
  UserMinus,
  X,
  Save,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { useTeams } from '../hooks/useTeams';
import { useTeamCollaboration } from '../hooks/useTeamCollaboration';
import { usePosts } from '../hooks/usePosts';
import { format } from 'date-fns';

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
    updateTeam,
    deleteTeam,
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
    updateApproval
  } = useTeamCollaboration(currentTeam?.id);

  const { posts } = usePosts();

  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [showTeamSettings, setShowTeamSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState({
    postId: '',
    assignedTo: '',
    dueDate: '',
    notes: ''
  });

  // Team settings form state
  const [teamSettings, setTeamSettings] = useState({
    name: currentTeam?.name || '',
    description: currentTeam?.description || ''
  });

  React.useEffect(() => {
    if (currentTeam) {
      setTeamSettings({
        name: currentTeam.name,
        description: currentTeam.description || ''
      });
    }
  }, [currentTeam]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;

    setIsCreating(true);
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
      setIsCreating(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !currentTeam) return;

    try {
      await inviteTeamMember(currentTeam.id, inviteEmail, inviteRole);
      setShowInviteMember(false);
      setInviteEmail('');
      setInviteRole('editor');
    } catch (err) {
      console.error('Error inviting member:', err);
    }
  };

  const handleCreateAssignment = async () => {
    if (!assignmentForm.postId || !assignmentForm.assignedTo || !currentTeam) return;

    try {
      await createAssignment(
        assignmentForm.postId,
        assignmentForm.assignedTo,
        assignmentForm.dueDate || undefined,
        assignmentForm.notes || undefined
      );
      setShowCreateAssignment(false);
      setAssignmentForm({
        postId: '',
        assignedTo: '',
        dueDate: '',
        notes: ''
      });
    } catch (err) {
      console.error('Error creating assignment:', err);
    }
  };

  const handleUpdateTeamSettings = async () => {
    if (!currentTeam) return;

    try {
      await updateTeam(currentTeam.id, {
        name: teamSettings.name,
        description: teamSettings.description
      });
      setShowTeamSettings(false);
    } catch (err) {
      console.error('Error updating team:', err);
    }
  };

  const handleDeleteTeam = async () => {
    if (!currentTeam) return;

    setIsDeleting(true);
    try {
      await deleteTeam(currentTeam.id);
      setCurrentTeam(null);
      setShowDeleteConfirm(false);
      setShowTeamSettings(false);
    } catch (err) {
      console.error('Error deleting team:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (window.confirm('Are you sure you want to remove this member from the team?')) {
      try {
        await removeMember(memberId);
      } catch (err) {
        console.error('Error removing member:', err);
      }
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'editor':
        return <Edit3 className="w-4 h-4 text-green-500" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'editor':
        return 'bg-green-100 text-green-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'text-green-600';
      case 'pending':
      case 'in_progress':
        return 'text-yellow-600';
      case 'overdue':
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'overdue':
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatActivityAction = (activity: any) => {
    const actions: Record<string, string> = {
      'assignment_created': 'created an assignment',
      'assignment_updated': 'updated an assignment',
      'approval_requested': 'requested approval',
      'approval_updated': 'updated approval status',
      'comment_created': 'added a comment',
      'post_created': 'created a post',
      'post_updated': 'updated a post',
      'member_invited': 'invited a team member',
      'member_joined': 'joined the team'
    };
    return actions[activity.action] || activity.action;
  };

  const myAssignments = getMyAssignments();
  const pendingApprovals = getPendingApprovals();
  const overdueAssignments = getOverdueAssignments();

  // Get available posts for assignment
  const availablePosts = posts.filter(post => post.status === 'draft' || post.status === 'scheduled');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Team Collaboration</h1>
          <p className="text-gray-600 mt-1">
            Manage your team and collaborate on social media content
          </p>
        </div>
        <div className="flex items-center gap-3">
          {teams.length > 1 && (
            <select
              value={currentTeam?.id || ''}
              onChange={(e) => {
                const team = teams.find(t => t.id === e.target.value);
                setCurrentTeam(team || null);
              }}
              className="px-3 py-2 border rounded-md"
            >
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          )}
          <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Create a team to collaborate with others on social media management
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
                    placeholder="Enter team name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    placeholder="Describe your team's purpose"
                    className="w-full p-2 border rounded-md"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateTeam(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTeam} disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Team'
                    )}
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

      {teams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Yet</h3>
            <p className="text-gray-500 text-center mb-4">
              Create your first team to start collaborating with others on social media management.
            </p>
            <Button onClick={() => setShowCreateTeam(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      ) : !currentTeam ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Team</h3>
            <p className="text-gray-500 text-center mb-4">
              Choose a team from the dropdown above to view collaboration features.
            </p>
          </CardContent>
        </Card>
      ) : (
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
                      <p className="text-gray-600 mt-1">{currentTeam.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{teamMembers.length} members</span>
                      <span>Created {format(new Date(currentTeam.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canManageTeam(currentTeam.id) && (
                    <>
                      <Dialog open={showInviteMember} onOpenChange={setShowInviteMember}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
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
                                placeholder="Enter email address"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                              </label>
                              <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value as any)}
                                className="w-full p-2 border rounded-md"
                              >
                                <option value="viewer">Viewer - Can view content</option>
                                <option value="editor">Editor - Can create and edit content</option>
                                <option value="admin">Admin - Can manage team and content</option>
                              </select>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setShowInviteMember(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleInviteMember}>
                                <Send className="w-4 h-4 mr-2" />
                                Send Invitation
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={showCreateAssignment} onOpenChange={setShowCreateAssignment}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Create Assignment
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create Assignment</DialogTitle>
                            <DialogDescription>
                              Assign a task to a team member
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Post
                              </label>
                              <select
                                value={assignmentForm.postId}
                                onChange={(e) => setAssignmentForm(prev => ({ ...prev, postId: e.target.value }))}
                                className="w-full p-2 border rounded-md"
                              >
                                <option value="">Select a post</option>
                                {availablePosts.map(post => (
                                  <option key={post.id} value={post.id}>
                                    {post.content.substring(0, 50)}...
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Assign To
                              </label>
                              <select
                                value={assignmentForm.assignedTo}
                                onChange={(e) => setAssignmentForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                                className="w-full p-2 border rounded-md"
                              >
                                <option value="">Select a team member</option>
                                {teamMembers.filter(member => member.role !== 'viewer').map(member => (
                                  <option key={member.id} value={member.user_id}>
                                    {member.user?.full_name || member.user?.email}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date (Optional)
                              </label>
                              <Input
                                type="datetime-local"
                                value={assignmentForm.dueDate}
                                onChange={(e) => setAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes (Optional)
                              </label>
                              <textarea
                                value={assignmentForm.notes}
                                onChange={(e) => setAssignmentForm(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Add any additional instructions..."
                                className="w-full p-2 border rounded-md"
                                rows={3}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setShowCreateAssignment(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleCreateAssignment}>
                                Create Assignment
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}

                  <Dialog open={showTeamSettings} onOpenChange={setShowTeamSettings}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Settings
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Team Settings</DialogTitle>
                        <DialogDescription>
                          Manage your team settings and preferences
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Team Name
                            </label>
                            <Input
                              value={teamSettings.name}
                              onChange={(e) => setTeamSettings(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter team name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              value={teamSettings.description}
                              onChange={(e) => setTeamSettings(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Describe your team's purpose"
                              className="w-full p-2 border rounded-md"
                              rows={3}
                            />
                          </div>
                        </div>

                        {canManageTeam(currentTeam.id) && (
                          <div className="border-t pt-6">
                            <h3 className="text-lg font-medium text-red-900 mb-2">Danger Zone</h3>
                            <p className="text-sm text-red-700 mb-4">
                              Once you delete a team, there is no going back. Please be certain.
                            </p>
                            <Button
                              variant="destructive"
                              onClick={() => setShowDeleteConfirm(true)}
                              className="flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Team
                            </Button>
                          </div>
                        )}

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowTeamSettings(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateTeamSettings}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-900">
                  <AlertTriangle className="w-5 h-5" />
                  Delete Team
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{currentTeam.name}"? This action cannot be undone.
                  All team data, assignments, and activity will be permanently removed.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteTeam} disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Team
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Target className="w-6 h-6 text-blue-600" />
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
                    <Clock className="w-6 h-6 text-yellow-600" />
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
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
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
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full border-b bg-white">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="assignments" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Assignments
              </TabsTrigger>
              <TabsTrigger value="approvals" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Approvals
              </TabsTrigger>
              <TabsTrigger value="members" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Members
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
                    <CardTitle>Recent Assignments</CardTitle>
                    <CardDescription>Your latest task assignments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {myAssignments.length === 0 ? (
                      <div className="text-center py-8">
                        <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No assignments yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {myAssignments.slice(0, 5).map((assignment) => (
                          <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">
                                {assignment.post?.content.substring(0, 50)}...
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {getStatusIcon(assignment.status)}
                                <span className={`text-xs ${getStatusColor(assignment.status)}`}>
                                  {assignment.status.replace('_', ' ')}
                                </span>
                                {assignment.due_date && (
                                  <span className="text-xs text-gray-500">
                                    Due {format(new Date(assignment.due_date), 'MMM d')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateAssignmentStatus(assignment.id, 'completed')}
                              disabled={assignment.status === 'completed'}
                            >
                              {assignment.status === 'completed' ? 'Done' : 'Complete'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pending Approvals</CardTitle>
                    <CardDescription>Posts waiting for your approval</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pendingApprovals.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No pending approvals</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingApprovals.slice(0, 5).map((approval) => (
                          <div key={approval.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">
                                  {approval.post?.content.substring(0, 50)}...
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Requested by {approval.requester?.full_name || approval.requester?.email}
                                </p>
                              </div>
                              <div className="flex gap-1 ml-2">
                                <Button
                                  size="sm"
                                  onClick={() => updateApproval(approval.id, 'approved')}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateApproval(approval.id, 'rejected')}
                                >
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="assignments" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Task Assignments</CardTitle>
                      <CardDescription>Manage and track team task assignments</CardDescription>
                    </div>
                    {canManageTeam(currentTeam.id) && (
                      <Button onClick={() => setShowCreateAssignment(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Assignment
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {assignments.length === 0 ? (
                    <div className="text-center py-12">
                      <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments</h3>
                      <p className="text-gray-500">Task assignments will appear here when created.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {assignments.map((assignment) => (
                        <div key={assignment.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getStatusIcon(assignment.status)}
                                <span className={`font-medium ${getStatusColor(assignment.status)}`}>
                                  {assignment.status.replace('_', ' ').toUpperCase()}
                                </span>
                                {assignment.due_date && (
                                  <Badge variant="outline">
                                    Due {format(new Date(assignment.due_date), 'MMM d, yyyy')}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-900 mb-2">
                                {assignment.post?.content.substring(0, 100)}...
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>
                                  Assigned to: {assignment.assignee?.full_name || assignment.assignee?.email}
                                </span>
                                <span>
                                  By: {assignment.assigner?.full_name || assignment.assigner?.email}
                                </span>
                                <span>
                                  {format(new Date(assignment.created_at), 'MMM d, yyyy')}
                                </span>
                              </div>
                              {assignment.notes && (
                                <p className="text-sm text-gray-600 mt-2 italic">
                                  Note: {assignment.notes}
                                </p>
                              )}
                            </div>
                            {canEditContent(currentTeam.id) && assignment.status !== 'completed' && (
                              <div className="flex gap-2 ml-4">
                                <Button
                                  size="sm"
                                  onClick={() => updateAssignmentStatus(assignment.id, 'completed')}
                                >
                                  Mark Complete
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="approvals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Post Approvals</CardTitle>
                  <CardDescription>Review and approve team content</CardDescription>
                </CardHeader>
                <CardContent>
                  {approvals.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Approval Requests</h3>
                      <p className="text-gray-500">Approval requests will appear here when submitted.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {approvals.map((approval) => (
                        <div key={approval.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getStatusIcon(approval.status)}
                                <span className={`font-medium ${getStatusColor(approval.status)}`}>
                                  {approval.status.replace('_', ' ').toUpperCase()}
                                </span>
                                {approval.approved_at && (
                                  <Badge variant="success">
                                    Approved {format(new Date(approval.approved_at), 'MMM d')}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-900 mb-2">
                                {approval.post?.content.substring(0, 150)}...
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                                <span>
                                  Requested by: {approval.requester?.full_name || approval.requester?.email}
                                </span>
                                <span>
                                  Platforms: {approval.post?.platforms.join(', ')}
                                </span>
                                <span>
                                  {format(new Date(approval.created_at), 'MMM d, yyyy')}
                                </span>
                              </div>
                              {approval.feedback && (
                                <div className="p-3 bg-gray-50 rounded-lg mt-2">
                                  <p className="text-sm text-gray-700">
                                    <strong>Feedback:</strong> {approval.feedback}
                                  </p>
                                  {approval.approver && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      By {approval.approver.full_name || approval.approver.email}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            {canManageTeam(currentTeam.id) && approval.status === 'pending' && (
                              <div className="flex gap-2 ml-4">
                                <Button
                                  size="sm"
                                  onClick={() => updateApproval(approval.id, 'approved')}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateApproval(approval.id, 'rejected', 'Needs revision')}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage your team members and their roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.user?.full_name || member.user?.email}
                            </p>
                            <p className="text-sm text-gray-500">{member.user?.email}</p>
                            <p className="text-xs text-gray-400">
                              Joined {format(new Date(member.joined_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            {getRoleIcon(member.role)}
                            <Badge className={getRoleBadgeColor(member.role)}>
                              {member.role}
                            </Badge>
                          </div>
                          {canManageTeam(currentTeam.id) && member.role !== 'owner' && (
                            <div className="flex gap-1">
                              <select
                                value={member.role}
                                onChange={(e) => updateMemberRole(member.id, e.target.value as any)}
                                className="text-sm border rounded px-2 py-1"
                              >
                                <option value="viewer">Viewer</option>
                                <option value="editor">Editor</option>
                                <option value="admin">Admin</option>
                              </select>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveMember(member.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <UserMinus className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {teamInvitations.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Invitations</h3>
                      <div className="space-y-3">
                        {teamInvitations.map((invitation) => (
                          <div key={invitation.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{invitation.email}</p>
                              <p className="text-sm text-gray-500">
                                Invited as {invitation.role} • Expires {format(new Date(invitation.expires_at), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <Badge variant="warning">Pending</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Activity</CardTitle>
                  <CardDescription>Recent team activity and collaboration</CardDescription>
                </CardHeader>
                <CardContent>
                  {teamActivity.length === 0 ? (
                    <div className="text-center py-12">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity</h3>
                      <p className="text-gray-500">Team activity will appear here as members collaborate.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {teamActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 border-l-2 border-blue-200 bg-blue-50 rounded-r-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Activity className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              <strong>{activity.user?.full_name || activity.user?.email}</strong>{' '}
                              {formatActivityAction(activity)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                            </p>
                            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                              <div className="mt-2 text-xs text-gray-600">
                                {JSON.stringify(activity.metadata, null, 2)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}