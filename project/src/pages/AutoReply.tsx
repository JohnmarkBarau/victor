import React, { useState } from 'react';
import { 
  MessageSquare, 
  Loader2, 
  RefreshCw, 
  Sparkles,
  AlertCircle,
  Send,
  Edit2,
  Check,
  X,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Clock,
  TrendingUp,
  Settings,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { useComments } from '../hooks/useComments';

export default function AutoReply() {
  const {
    comments,
    loading,
    error,
    replyToComment,
    generateAIReply,
    fetchComments,
    getCommentsByStatus,
    getResponseRate,
    getAverageResponseTime,
    generateSampleComments
  } = useComments();

  const [generatingReply, setGeneratingReply] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [manualApproval, setManualApproval] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'replied'>('all');

  const { pending, replied, total } = getCommentsByStatus();
  const responseRate = getResponseRate();
  const avgResponseTime = getAverageResponseTime();

  const handleGenerateReply = async (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    setGeneratingReply(commentId);
    try {
      const aiReply = await generateAIReply(comment);
      setEditingReply(commentId);
      setReplyText(aiReply);
    } catch (err: any) {
      console.error('Error generating reply:', err);
    } finally {
      setGeneratingReply(null);
    }
  };

  const handleSaveReply = async (commentId: string) => {
    try {
      await replyToComment(commentId, replyText);
      setEditingReply(null);
      setReplyText('');
    } catch (err: any) {
      console.error('Error saving reply:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingReply(null);
    setReplyText('');
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="w-5 h-5 text-pink-500" />;
      case 'twitter':
        return <Twitter className="w-5 h-5 text-blue-400" />;
      case 'facebook':
        return <Facebook className="w-5 h-5 text-blue-600" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5 text-blue-700" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = selectedPlatform === 'all' || comment.platform === selectedPlatform;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'pending' && !comment.reply) ||
                         (selectedStatus === 'replied' && comment.reply);
    
    return matchesSearch && matchesPlatform && matchesStatus;
  });

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
          <h1 className="text-2xl font-bold text-gray-800">Comment Management</h1>
          <p className="text-gray-600 mt-1">
            Manage and respond to comments across all your social media platforms
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchComments}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          {comments.length === 0 && (
            <Button
              onClick={generateSampleComments}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Generate Sample Data
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Replies</p>
                <p className="text-2xl font-bold text-gray-900">{pending.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Response Rate</p>
                <p className="text-2xl font-bold text-gray-900">{responseRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{avgResponseTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Comments</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Auto-Reply Settings
          </CardTitle>
          <CardDescription>
            Configure how comments are automatically handled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Auto-Reply</h3>
                <p className="text-sm text-gray-500">Generate replies automatically</p>
              </div>
              <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={autoReplyEnabled}
                  onChange={() => setAutoReplyEnabled(!autoReplyEnabled)}
                />
                <div
                  className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform ${
                    autoReplyEnabled ? 'translate-x-6 bg-white' : 'translate-x-0 bg-gray-400'
                  }`}
                />
                <div
                  className={`absolute inset-0 rounded-full transition ${
                    autoReplyEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Manual Approval</h3>
                <p className="text-sm text-gray-500">Review before sending</p>
              </div>
              <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={manualApproval}
                  onChange={() => setManualApproval(!manualApproval)}
                />
                <div
                  className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform ${
                    manualApproval ? 'translate-x-6 bg-white' : 'translate-x-0 bg-gray-400'
                  }`}
                />
                <div
                  className={`absolute inset-0 rounded-full transition ${
                    manualApproval ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search comments or authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'pending' | 'replied')}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Comments</option>
              <option value="pending">Pending Reply</option>
              <option value="replied">Replied</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <Card>
        <CardHeader>
          <CardTitle>Comments ({filteredComments.length})</CardTitle>
          <CardDescription>
            Manage and respond to comments from your social media posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredComments.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {comments.length === 0 ? 'No comments yet' : 'No comments match your filters'}
              </h3>
              <p className="text-gray-500 mb-4">
                {comments.length === 0 
                  ? "Comments from your social media posts will appear here."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {comments.length === 0 && (
                <Button onClick={generateSampleComments}>
                  Generate Sample Comments
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {getPlatformIcon(comment.platform)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">
                            {comment.author}
                          </span>
                          <Badge variant="outline" className="capitalize">
                            {comment.platform}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                          {!comment.reply && (
                            <Badge variant="warning">Pending</Badge>
                          )}
                        </div>
                        <p className="text-gray-700 mb-4">{comment.content}</p>
                        
                        {editingReply === comment.id ? (
                          <div className="space-y-3">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="w-full min-h-[100px] p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Write your reply..."
                            />
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleSaveReply(comment.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Save Reply
                              </Button>
                              <Button
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : comment.reply ? (
                          <div className="mt-4 pl-4 border-l-2 border-green-200 bg-green-50 rounded-r-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="success">Replied</Badge>
                              <span className="text-sm text-gray-500">
                                {new Date(comment.replied_at!).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700">{comment.reply}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingReply(comment.id);
                                setReplyText(comment.reply || '');
                              }}
                              className="mt-2 text-gray-600"
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit Reply
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    
                    {!comment.reply && editingReply !== comment.id && (
                      <Button
                        onClick={() => handleGenerateReply(comment.id)}
                        disabled={generatingReply === comment.id}
                        className="ml-4 flex-shrink-0"
                      >
                        {generatingReply === comment.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Reply
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}