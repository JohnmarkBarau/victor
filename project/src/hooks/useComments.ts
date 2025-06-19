import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export interface Comment {
  id: string;
  post_id: string;
  platform: string;
  content: string;
  author: string;
  reply?: string;
  replied_at?: string;
  created_at: string;
  user_id: string;
}

export interface CreateCommentData {
  post_id: string;
  platform: string;
  content: string;
  author: string;
}

export function useComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const fetchComments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createComment = async (commentData: CreateCommentData): Promise<Comment> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('comments')
      .insert({
        ...commentData,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    
    setComments(prev => [data, ...prev]);
    return data;
  };

  const replyToComment = async (commentId: string, reply: string): Promise<Comment> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('comments')
      .update({
        reply,
        replied_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    setComments(prev => prev.map(comment => 
      comment.id === commentId ? data : comment
    ));
    return data;
  };

  const generateAIReply = async (comment: Comment): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-reply', {
        body: {
          platform: comment.platform,
          comment: comment.content,
          author: comment.author
        }
      });

      if (error) throw error;
      return data.reply || 'Thank you for your comment! We appreciate your feedback.';
    } catch (err) {
      console.error('Error generating AI reply:', err);
      // Fallback reply
      return 'Thank you for your comment! We appreciate your feedback and will get back to you soon.';
    }
  };

  const deleteComment = async (commentId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (error) throw error;

    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };

  const getCommentsByStatus = () => {
    const pending = comments.filter(c => !c.reply);
    const replied = comments.filter(c => c.reply);
    
    return {
      pending,
      replied,
      total: comments.length
    };
  };

  const getCommentsByPlatform = (platform: string) => {
    return comments.filter(c => c.platform.toLowerCase() === platform.toLowerCase());
  };

  const getRecentComments = (limit = 5) => {
    return comments.slice(0, limit);
  };

  const getResponseRate = () => {
    if (comments.length === 0) return 0;
    const repliedCount = comments.filter(c => c.reply).length;
    return Math.round((repliedCount / comments.length) * 100);
  };

  const getAverageResponseTime = () => {
    const repliedComments = comments.filter(c => c.reply && c.replied_at);
    if (repliedComments.length === 0) return 'N/A';

    const totalMinutes = repliedComments.reduce((sum, comment) => {
      const created = new Date(comment.created_at);
      const replied = new Date(comment.replied_at!);
      const diffMinutes = Math.floor((replied.getTime() - created.getTime()) / (1000 * 60));
      return sum + diffMinutes;
    }, 0);

    const avgMinutes = Math.floor(totalMinutes / repliedComments.length);
    
    if (avgMinutes < 60) return `${avgMinutes} min`;
    if (avgMinutes < 1440) return `${Math.floor(avgMinutes / 60)}h ${avgMinutes % 60}m`;
    return `${Math.floor(avgMinutes / 1440)}d`;
  };

  // Generate sample comments for testing
  const generateSampleComments = async () => {
    if (!user || comments.length > 0) return;

    const sampleComments = [
      {
        post_id: '11111111-1111-1111-1111-111111111111',
        platform: 'instagram',
        content: 'Love this new feature! When will it be available for everyone? 🚀',
        author: 'sarah_designs'
      },
      {
        post_id: '22222222-2222-2222-2222-222222222222',
        platform: 'twitter',
        content: 'Great insights! Would love to see more content like this. #Innovation',
        author: 'tech_enthusiast'
      },
      {
        post_id: '33333333-3333-3333-3333-333333333333',
        platform: 'facebook',
        content: 'This is exactly what I was looking for! Do you have any tutorials?',
        author: 'john.smith'
      },
      {
        post_id: '44444444-4444-4444-4444-444444444444',
        platform: 'linkedin',
        content: 'Excellent analysis. How do you see this trend evolving in the next year?',
        author: 'business_pro'
      },
      {
        post_id: '55555555-5555-5555-5555-555555555555',
        platform: 'instagram',
        content: 'Having some issues with the latest update. Can someone help? 🤔',
        author: 'user_help'
      }
    ];

    try {
      const { error } = await supabase
        .from('comments')
        .insert(sampleComments.map(comment => ({
          ...comment,
          user_id: user.id
        })));

      if (error) throw error;
      await fetchComments();
    } catch (err) {
      console.error('Error generating sample comments:', err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('comments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setComments(prev => [payload.new as Comment, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setComments(prev => prev.map(comment => 
              comment.id === payload.new.id ? payload.new as Comment : comment
            ));
          } else if (payload.eventType === 'DELETE') {
            setComments(prev => prev.filter(comment => comment.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    comments,
    loading,
    error,
    createComment,
    replyToComment,
    generateAIReply,
    deleteComment,
    fetchComments,
    getCommentsByStatus,
    getCommentsByPlatform,
    getRecentComments,
    getResponseRate,
    getAverageResponseTime,
    generateSampleComments
  };
}