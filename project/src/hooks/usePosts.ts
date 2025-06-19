import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export interface Post {
  id: string;
  content: string;
  media_urls: string[] | null;
  platforms: string[];
  scheduled_time: string | null;
  hashtags: string[] | null;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePostData {
  content: string;
  media_urls?: string[];
  platforms: string[];
  scheduled_time?: string;
  hashtags?: string[];
  status?: 'draft' | 'scheduled' | 'published';
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const fetchPosts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: CreatePostData): Promise<Post> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('posts')
      .insert({
        ...postData,
        user_id: user.id,
        status: postData.status || 'draft'
      })
      .select()
      .single();

    if (error) throw error;
    
    // Update local state
    setPosts(prev => [data, ...prev]);
    return data;
  };

  const updatePost = async (id: string, updates: Partial<CreatePostData>): Promise<Post> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    // Update local state
    setPosts(prev => prev.map(post => post.id === id ? data : post));
    return data;
  };

  const deletePost = async (id: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    // Update local state
    setPosts(prev => prev.filter(post => post.id !== id));
  };

  const duplicatePost = async (id: string): Promise<Post> => {
    const originalPost = posts.find(p => p.id === id);
    if (!originalPost) throw new Error('Post not found');

    const duplicateData: CreatePostData = {
      content: `${originalPost.content} (Copy)`,
      media_urls: originalPost.media_urls || undefined,
      platforms: originalPost.platforms,
      hashtags: originalPost.hashtags || undefined,
      status: 'draft'
    };

    return createPost(duplicateData);
  };

  const getPostsByStatus = (status: Post['status']) => {
    return posts.filter(post => post.status === status);
  };

  const getScheduledPosts = () => {
    return posts.filter(post => 
      post.status === 'scheduled' && 
      post.scheduled_time &&
      new Date(post.scheduled_time) > new Date()
    );
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPosts(prev => [payload.new as Post, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPosts(prev => prev.map(post => 
              post.id === payload.new.id ? payload.new as Post : post
            ));
          } else if (payload.eventType === 'DELETE') {
            setPosts(prev => prev.filter(post => post.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    duplicatePost,
    fetchPosts,
    getPostsByStatus,
    getScheduledPosts
  };
}