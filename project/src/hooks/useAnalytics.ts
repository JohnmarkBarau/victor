import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { usePosts } from './usePosts';

export interface AnalyticsData {
  id: string;
  post_id: string;
  platform: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface PlatformMetrics {
  platform: string;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalEngagement: number;
  engagementRate: number;
  postCount: number;
  avgEngagement: number;
}

export interface TimeSeriesData {
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagement: number;
}

export interface AnalyticsOverview {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalEngagement: number;
  avgEngagementRate: number;
  topPerformingPost: {
    id: string;
    content: string;
    engagement: number;
    platform: string;
  } | null;
  growthMetrics: {
    viewsGrowth: number;
    likesGrowth: number;
    commentsGrowth: number;
    sharesGrowth: number;
  };
}

export function useAnalytics(timeframe: '7d' | '30d' | '90d' = '30d') {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { posts } = usePosts();

  const fetchAnalytics = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const daysAgo = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data, error } = await supabase
        .from('post_analytics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAnalytics(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createAnalyticsEntry = async (postId: string, platform: string, metrics: Partial<AnalyticsData>): Promise<AnalyticsData> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('post_analytics')
      .insert({
        post_id: postId,
        platform,
        views: metrics.views || 0,
        likes: metrics.likes || 0,
        comments: metrics.comments || 0,
        shares: metrics.shares || 0,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    
    setAnalytics(prev => [...prev, data]);
    return data;
  };

  const updateAnalyticsEntry = async (id: string, updates: Partial<AnalyticsData>): Promise<AnalyticsData> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('post_analytics')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    setAnalytics(prev => prev.map(item => item.id === id ? data : item));
    return data;
  };

  const getPlatformMetrics = (): PlatformMetrics[] => {
    const platformMap = new Map<string, PlatformMetrics>();

    analytics.forEach(item => {
      const existing = platformMap.get(item.platform) || {
        platform: item.platform,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalEngagement: 0,
        engagementRate: 0,
        postCount: 0,
        avgEngagement: 0
      };

      existing.totalViews += item.views;
      existing.totalLikes += item.likes;
      existing.totalComments += item.comments;
      existing.totalShares += item.shares;
      existing.totalEngagement += (item.likes + item.comments + item.shares);
      existing.postCount += 1;

      platformMap.set(item.platform, existing);
    });

    return Array.from(platformMap.values()).map(platform => ({
      ...platform,
      avgEngagement: platform.postCount > 0 ? platform.totalEngagement / platform.postCount : 0,
      engagementRate: platform.totalViews > 0 ? (platform.totalEngagement / platform.totalViews) * 100 : 0
    }));
  };

  const getTimeSeriesData = (): TimeSeriesData[] => {
    const dateMap = new Map<string, TimeSeriesData>();

    analytics.forEach(item => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      const existing = dateMap.get(date) || {
        date,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        engagement: 0
      };

      existing.views += item.views;
      existing.likes += item.likes;
      existing.comments += item.comments;
      existing.shares += item.shares;
      existing.engagement += (item.likes + item.comments + item.shares);

      dateMap.set(date, existing);
    });

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  const getAnalyticsOverview = (): AnalyticsOverview => {
    const totalViews = analytics.reduce((sum, item) => sum + item.views, 0);
    const totalLikes = analytics.reduce((sum, item) => sum + item.likes, 0);
    const totalComments = analytics.reduce((sum, item) => sum + item.comments, 0);
    const totalShares = analytics.reduce((sum, item) => sum + item.shares, 0);
    const totalEngagement = totalLikes + totalComments + totalShares;

    // Find top performing post
    const postEngagementMap = new Map<string, number>();
    analytics.forEach(item => {
      const engagement = item.likes + item.comments + item.shares;
      const existing = postEngagementMap.get(item.post_id) || 0;
      postEngagementMap.set(item.post_id, existing + engagement);
    });

    let topPerformingPost = null;
    let maxEngagement = 0;
    postEngagementMap.forEach((engagement, postId) => {
      if (engagement > maxEngagement) {
        maxEngagement = engagement;
        const post = posts.find(p => p.id === postId);
        if (post) {
          const analytics_item = analytics.find(a => a.post_id === postId);
          topPerformingPost = {
            id: postId,
            content: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
            engagement,
            platform: analytics_item?.platform || 'unknown'
          };
        }
      }
    });

    // Calculate growth metrics (comparing first half vs second half of timeframe)
    const midpoint = Math.floor(analytics.length / 2);
    const firstHalf = analytics.slice(0, midpoint);
    const secondHalf = analytics.slice(midpoint);

    const firstHalfViews = firstHalf.reduce((sum, item) => sum + item.views, 0);
    const secondHalfViews = secondHalf.reduce((sum, item) => sum + item.views, 0);
    const viewsGrowth = firstHalfViews > 0 ? ((secondHalfViews - firstHalfViews) / firstHalfViews) * 100 : 0;

    const firstHalfLikes = firstHalf.reduce((sum, item) => sum + item.likes, 0);
    const secondHalfLikes = secondHalf.reduce((sum, item) => sum + item.likes, 0);
    const likesGrowth = firstHalfLikes > 0 ? ((secondHalfLikes - firstHalfLikes) / firstHalfLikes) * 100 : 0;

    const firstHalfComments = firstHalf.reduce((sum, item) => sum + item.comments, 0);
    const secondHalfComments = secondHalf.reduce((sum, item) => sum + item.comments, 0);
    const commentsGrowth = firstHalfComments > 0 ? ((secondHalfComments - firstHalfComments) / firstHalfComments) * 100 : 0;

    const firstHalfShares = firstHalf.reduce((sum, item) => sum + item.shares, 0);
    const secondHalfShares = secondHalf.reduce((sum, item) => sum + item.shares, 0);
    const sharesGrowth = firstHalfShares > 0 ? ((secondHalfShares - firstHalfShares) / firstHalfShares) * 100 : 0;

    return {
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      totalEngagement,
      avgEngagementRate: totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0,
      topPerformingPost,
      growthMetrics: {
        viewsGrowth,
        likesGrowth,
        commentsGrowth,
        sharesGrowth
      }
    };
  };

  // Generate sample analytics data for existing posts
  const generateSampleAnalytics = async () => {
    if (!user || analytics.length > 0) return;

    const publishedPosts = posts.filter(post => post.status === 'published');
    if (publishedPosts.length === 0) return;

    try {
      const sampleData = publishedPosts.flatMap(post => 
        post.platforms.map(platform => ({
          post_id: post.id,
          platform,
          views: Math.floor(Math.random() * 1000) + 100,
          likes: Math.floor(Math.random() * 100) + 10,
          comments: Math.floor(Math.random() * 50) + 5,
          shares: Math.floor(Math.random() * 25) + 2,
          user_id: user.id
        }))
      );

      const { error } = await supabase
        .from('post_analytics')
        .insert(sampleData);

      if (error) throw error;
      await fetchAnalytics();
    } catch (err) {
      console.error('Error generating sample analytics:', err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user, timeframe]);

  useEffect(() => {
    if (posts.length > 0 && analytics.length === 0) {
      generateSampleAnalytics();
    }
  }, [posts, analytics]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('analytics_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_analytics',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAnalytics(prev => [...prev, payload.new as AnalyticsData]);
          } else if (payload.eventType === 'UPDATE') {
            setAnalytics(prev => prev.map(item => 
              item.id === payload.new.id ? payload.new as AnalyticsData : item
            ));
          } else if (payload.eventType === 'DELETE') {
            setAnalytics(prev => prev.filter(item => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    analytics,
    loading,
    error,
    createAnalyticsEntry,
    updateAnalyticsEntry,
    fetchAnalytics,
    getPlatformMetrics,
    getTimeSeriesData,
    getAnalyticsOverview,
    generateSampleAnalytics
  };
}