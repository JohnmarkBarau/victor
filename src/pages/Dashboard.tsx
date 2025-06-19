import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Calendar, Edit2, Trash2, Copy, MoreHorizontal, Clock, Eye, ThumbsUp, MessageSquare, Share2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LazyImage } from '../components/ui/LazyImage';
import { usePosts } from '../hooks/usePosts';
import { useComments } from '../hooks/useComments';
import { useAuthStore } from '../store/authStore';

const TavusVideo = () => (
  <div className="relative bg-white p-6 rounded-lg shadow-sm mb-6">
    <div className="aspect-video w-full max-w-2xl mx-auto rounded-lg overflow-hidden">
      <iframe
        src="https://embed.tavus.com/your-video-id"
        className="w-full h-full"
        allow="camera; microphone; autoplay; clipboard-write; encrypted-media"
        allowFullScreen
      ></iframe>
    </div>
  </div>
);

export default function Dashboard() {
  const [showVideo, setShowVideo] = useState(true);
  const { posts, loading, deletePost, duplicatePost } = usePosts();
  const { comments, getCommentsByStatus, getRecentComments } = useComments();
  const { user } = useAuthStore();

  const handleDeletePost = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(id);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleDuplicatePost = async (id: string) => {
    try {
      await duplicatePost(id);
    } catch (error) {
      console.error('Error duplicating post:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const recentPosts = posts.slice(0, 5);
  const recentComments = getRecentComments(3);
  const { pending: pendingComments } = getCommentsByStatus();
  const draftPosts = posts.filter(p => p.status === 'draft').length;
  const scheduledPosts = posts.filter(p => p.status === 'scheduled').length;
  const publishedPosts = posts.filter(p => p.status === 'published').length;

  return (
    <div className="space-y-6">
      {showVideo && (
        <div className="relative bg-white p-6 rounded-lg shadow-sm mb-6">
          <button 
            onClick={() => setShowVideo(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
          <TavusVideo />
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.user_metadata?.full_name || user?.email}!
          </h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your social media</p>
        </div>
        <Link to="/create">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Post
          </Button>
        </Link>
      </div>

      {/* Alert for pending comments */}
      {pendingComments.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900">
                  {pendingComments.length} comment{pendingComments.length > 1 ? 's' : ''} awaiting reply
                </h3>
                <p className="text-orange-700 text-sm">
                  You have unresponded comments that need your attention.
                </p>
              </div>
              <Link to="/auto-reply">
                <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                  View Comments
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Posts</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">{posts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <ThumbsUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Published</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{publishedPosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Scheduled</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">{scheduledPosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Pending Comments</h3>
                <p className="text-3xl font-bold text-orange-600 mt-2">{pendingComments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Posts</CardTitle>
              <Link to="/create" className="text-blue-600 hover:text-blue-700 text-sm">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentPosts.length > 0 ? (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-gray-900 line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <Badge className={getStatusColor(post.status)}>
                            {post.status}
                          </Badge>
                          <span>{formatDate(post.created_at)}</span>
                          <span>{post.platforms.join(', ')}</span>
                        </div>
                      </div>
                      <div className="relative group">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 invisible group-hover:visible opacity-0 group-hover:opacity-100 w-32 bg-white border rounded-lg shadow-lg mt-1 py-1 transition-all duration-200 z-10">
                          <button
                            onClick={() => handleDuplicatePost(post.id)}
                            className="w-full text-left px-3 py-1 text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Copy className="w-3 h-3" />
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="w-full text-left px-3 py-1 text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No posts yet</p>
                <Link to="/create">
                  <Button size="sm">Create your first post</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Comments</CardTitle>
              <Link to="/auto-reply" className="text-blue-600 hover:text-blue-700 text-sm">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentComments.length > 0 ? (
              <div className="space-y-4">
                {recentComments.map((comment) => (
                  <div key={comment.id} className="border-l-4 border-orange-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{comment.author}</span>
                          <Badge variant="outline" className="capitalize">
                            {comment.platform}
                          </Badge>
                          {!comment.reply && (
                            <Badge variant="warning">Pending</Badge>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm line-clamp-2">{comment.content}</p>
                        <span className="text-xs text-gray-500 mt-1">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No comments yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {scheduledPosts > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Upcoming Posts</h3>
                <p className="text-blue-700">
                  You have {scheduledPosts} post{scheduledPosts > 1 ? 's' : ''} scheduled for the coming days.
                </p>
              </div>
              <Link to="/calendar" className="ml-auto">
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  View Calendar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}