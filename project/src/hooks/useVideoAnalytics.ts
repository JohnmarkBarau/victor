import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { usePosts } from './usePosts';

export interface VideoAnalytics {
  id: string;
  post_id: string;
  platform: string;
  video_url: string;
  duration: number; // in seconds
  views: number;
  watch_time: number; // total watch time in seconds
  completion_rate: number; // percentage of video watched
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  click_through_rate: number;
  engagement_rate: number;
  retention_points: number[]; // array of retention percentages at 10%, 25%, 50%, 75%, 100%
  peak_concurrent_viewers: number;
  average_view_duration: number;
  replay_count: number;
  thumbnail_click_rate: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface VideoPerformanceMetrics {
  totalViews: number;
  totalWatchTime: number;
  averageCompletionRate: number;
  averageEngagementRate: number;
  totalVideos: number;
  topPerformingVideo: {
    id: string;
    title: string;
    views: number;
    completionRate: number;
    platform: string;
  } | null;
  platformBreakdown: {
    platform: string;
    videoCount: number;
    totalViews: number;
    avgCompletionRate: number;
    avgEngagementRate: number;
  }[];
  retentionAnalysis: {
    averageDropOffPoint: number;
    strongRetentionVideos: number;
    improvementAreas: string[];
  };
  growthMetrics: {
    viewsGrowth: number;
    engagementGrowth: number;
    completionRateGrowth: number;
  };
}

export interface VideoInsight {
  type: 'success' | 'warning' | 'info' | 'improvement';
  title: string;
  description: string;
  actionable: string;
  priority: 'high' | 'medium' | 'low';
  metric?: string;
}

export interface VideoTrend {
  period: string;
  views: number;
  watchTime: number;
  completionRate: number;
  engagementRate: number;
}

export function useVideoAnalytics(timeframe: '7d' | '30d' | '90d' = '30d') {
  const [videoAnalytics, setVideoAnalytics] = useState<VideoAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { posts } = usePosts();

  const fetchVideoAnalytics = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const daysAgo = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data, error } = await supabase
        .from('video_analytics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      setVideoAnalytics(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createVideoAnalytics = async (
    postId: string, 
    platform: string, 
    videoUrl: string, 
    duration: number,
    metrics: Partial<VideoAnalytics>
  ): Promise<VideoAnalytics> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('video_analytics')
      .insert({
        post_id: postId,
        platform,
        video_url: videoUrl,
        duration,
        views: metrics.views || 0,
        watch_time: metrics.watch_time || 0,
        completion_rate: metrics.completion_rate || 0,
        likes: metrics.likes || 0,
        comments: metrics.comments || 0,
        shares: metrics.shares || 0,
        saves: metrics.saves || 0,
        click_through_rate: metrics.click_through_rate || 0,
        engagement_rate: metrics.engagement_rate || 0,
        retention_points: metrics.retention_points || [100, 85, 70, 55, 40],
        peak_concurrent_viewers: metrics.peak_concurrent_viewers || 0,
        average_view_duration: metrics.average_view_duration || 0,
        replay_count: metrics.replay_count || 0,
        thumbnail_click_rate: metrics.thumbnail_click_rate || 0,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    
    setVideoAnalytics(prev => [...prev, data]);
    return data;
  };

  const updateVideoAnalytics = async (id: string, updates: Partial<VideoAnalytics>): Promise<VideoAnalytics> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('video_analytics')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    setVideoAnalytics(prev => prev.map(item => item.id === id ? data : item));
    return data;
  };

  const getVideoPerformanceMetrics = (): VideoPerformanceMetrics => {
    const totalViews = videoAnalytics.reduce((sum, video) => sum + video.views, 0);
    const totalWatchTime = videoAnalytics.reduce((sum, video) => sum + video.watch_time, 0);
    const averageCompletionRate = videoAnalytics.length > 0 
      ? videoAnalytics.reduce((sum, video) => sum + video.completion_rate, 0) / videoAnalytics.length 
      : 0;
    const averageEngagementRate = videoAnalytics.length > 0
      ? videoAnalytics.reduce((sum, video) => sum + video.engagement_rate, 0) / videoAnalytics.length
      : 0;

    // Find top performing video
    const topVideo = videoAnalytics.reduce((best, current) => {
      const currentScore = current.views * 0.4 + current.completion_rate * 0.6;
      const bestScore = best ? best.views * 0.4 + best.completion_rate * 0.6 : 0;
      return currentScore > bestScore ? current : best;
    }, null as VideoAnalytics | null);

    let topPerformingVideo = null;
    if (topVideo) {
      const post = posts.find(p => p.id === topVideo.post_id);
      topPerformingVideo = {
        id: topVideo.id,
        title: post?.content.substring(0, 50) + '...' || 'Video Content',
        views: topVideo.views,
        completionRate: topVideo.completion_rate,
        platform: topVideo.platform
      };
    }

    // Platform breakdown
    const platformMap = new Map<string, {
      videoCount: number;
      totalViews: number;
      totalCompletionRate: number;
      totalEngagementRate: number;
    }>();

    videoAnalytics.forEach(video => {
      const existing = platformMap.get(video.platform) || {
        videoCount: 0,
        totalViews: 0,
        totalCompletionRate: 0,
        totalEngagementRate: 0
      };

      existing.videoCount += 1;
      existing.totalViews += video.views;
      existing.totalCompletionRate += video.completion_rate;
      existing.totalEngagementRate += video.engagement_rate;

      platformMap.set(video.platform, existing);
    });

    const platformBreakdown = Array.from(platformMap.entries()).map(([platform, data]) => ({
      platform,
      videoCount: data.videoCount,
      totalViews: data.totalViews,
      avgCompletionRate: data.videoCount > 0 ? data.totalCompletionRate / data.videoCount : 0,
      avgEngagementRate: data.videoCount > 0 ? data.totalEngagementRate / data.videoCount : 0
    }));

    // Retention analysis
    const avgRetentionPoints = videoAnalytics.length > 0
      ? videoAnalytics.reduce((acc, video) => {
          video.retention_points.forEach((point, index) => {
            acc[index] = (acc[index] || 0) + point;
          });
          return acc;
        }, [] as number[]).map(sum => sum / videoAnalytics.length)
      : [];

    const averageDropOffPoint = avgRetentionPoints.findIndex(point => point < 50) * 20 || 100;
    const strongRetentionVideos = videoAnalytics.filter(video => 
      video.completion_rate > 70
    ).length;

    const improvementAreas = [];
    if (averageCompletionRate < 50) improvementAreas.push('Video completion rates');
    if (averageEngagementRate < 3) improvementAreas.push('Engagement rates');
    if (averageDropOffPoint < 50) improvementAreas.push('Early retention');

    // Growth metrics (comparing first half vs second half)
    const midpoint = Math.floor(videoAnalytics.length / 2);
    const firstHalf = videoAnalytics.slice(0, midpoint);
    const secondHalf = videoAnalytics.slice(midpoint);

    const firstHalfViews = firstHalf.reduce((sum, video) => sum + video.views, 0);
    const secondHalfViews = secondHalf.reduce((sum, video) => sum + video.views, 0);
    const viewsGrowth = firstHalfViews > 0 ? ((secondHalfViews - firstHalfViews) / firstHalfViews) * 100 : 0;

    const firstHalfEngagement = firstHalf.reduce((sum, video) => sum + video.engagement_rate, 0);
    const secondHalfEngagement = secondHalf.reduce((sum, video) => sum + video.engagement_rate, 0);
    const engagementGrowth = firstHalfEngagement > 0 ? ((secondHalfEngagement - firstHalfEngagement) / firstHalfEngagement) * 100 : 0;

    const firstHalfCompletion = firstHalf.reduce((sum, video) => sum + video.completion_rate, 0);
    const secondHalfCompletion = secondHalf.reduce((sum, video) => sum + video.completion_rate, 0);
    const completionRateGrowth = firstHalfCompletion > 0 ? ((secondHalfCompletion - firstHalfCompletion) / firstHalfCompletion) * 100 : 0;

    return {
      totalViews,
      totalWatchTime,
      averageCompletionRate,
      averageEngagementRate,
      totalVideos: videoAnalytics.length,
      topPerformingVideo,
      platformBreakdown,
      retentionAnalysis: {
        averageDropOffPoint,
        strongRetentionVideos,
        improvementAreas
      },
      growthMetrics: {
        viewsGrowth,
        engagementGrowth,
        completionRateGrowth
      }
    };
  };

  const getVideoInsights = (): VideoInsight[] => {
    const metrics = getVideoPerformanceMetrics();
    const insights: VideoInsight[] = [];

    // Completion rate insights
    if (metrics.averageCompletionRate > 70) {
      insights.push({
        type: 'success',
        title: 'Excellent Video Retention',
        description: `Your videos have an average completion rate of ${metrics.averageCompletionRate.toFixed(1)}%`,
        actionable: 'Continue creating content in this style and format',
        priority: 'low',
        metric: `${metrics.averageCompletionRate.toFixed(1)}%`
      });
    } else if (metrics.averageCompletionRate < 40) {
      insights.push({
        type: 'warning',
        title: 'Low Video Completion Rate',
        description: `Your videos have an average completion rate of ${metrics.averageCompletionRate.toFixed(1)}%`,
        actionable: 'Consider shorter videos, stronger hooks, or more engaging content',
        priority: 'high',
        metric: `${metrics.averageCompletionRate.toFixed(1)}%`
      });
    }

    // Engagement insights
    if (metrics.averageEngagementRate > 5) {
      insights.push({
        type: 'success',
        title: 'High Video Engagement',
        description: `Your videos achieve ${metrics.averageEngagementRate.toFixed(1)}% engagement rate`,
        actionable: 'Scale up video production on your best-performing platforms',
        priority: 'medium',
        metric: `${metrics.averageEngagementRate.toFixed(1)}%`
      });
    } else if (metrics.averageEngagementRate < 2) {
      insights.push({
        type: 'improvement',
        title: 'Engagement Opportunity',
        description: `Video engagement rate is ${metrics.averageEngagementRate.toFixed(1)}%`,
        actionable: 'Add clear calls-to-action and interactive elements',
        priority: 'high',
        metric: `${metrics.averageEngagementRate.toFixed(1)}%`
      });
    }

    // Platform performance insights
    const bestPlatform = metrics.platformBreakdown.reduce((best, current) => 
      current.avgEngagementRate > best.avgEngagementRate ? current : best,
      metrics.platformBreakdown[0]
    );

    if (bestPlatform && metrics.platformBreakdown.length > 1) {
      insights.push({
        type: 'info',
        title: `${bestPlatform.platform} is Your Top Video Platform`,
        description: `${bestPlatform.platform} shows ${bestPlatform.avgEngagementRate.toFixed(1)}% engagement rate`,
        actionable: `Focus more video content on ${bestPlatform.platform}`,
        priority: 'medium',
        metric: `${bestPlatform.avgEngagementRate.toFixed(1)}%`
      });
    }

    // Retention insights
    if (metrics.retentionAnalysis.averageDropOffPoint < 30) {
      insights.push({
        type: 'warning',
        title: 'Early Drop-off Detected',
        description: `Viewers typically drop off at ${metrics.retentionAnalysis.averageDropOffPoint}% of your videos`,
        actionable: 'Improve your video hooks and opening 10 seconds',
        priority: 'high',
        metric: `${metrics.retentionAnalysis.averageDropOffPoint}%`
      });
    }

    // Growth insights
    if (metrics.growthMetrics.viewsGrowth > 20) {
      insights.push({
        type: 'success',
        title: 'Strong Video Growth',
        description: `Video views have grown by ${metrics.growthMetrics.viewsGrowth.toFixed(1)}%`,
        actionable: 'Maintain current video strategy and posting frequency',
        priority: 'low',
        metric: `+${metrics.growthMetrics.viewsGrowth.toFixed(1)}%`
      });
    }

    return insights;
  };

  const getVideoTrends = (): VideoTrend[] => {
    const trends: VideoTrend[] = [];
    const daysInPeriod = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const periodLength = Math.floor(daysInPeriod / 7); // Weekly periods

    for (let i = 0; i < 7; i++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (daysInPeriod - (i * periodLength)));
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - (daysInPeriod - ((i + 1) * periodLength)));

      const periodVideos = videoAnalytics.filter(video => {
        const videoDate = new Date(video.created_at);
        return videoDate >= startDate && videoDate < endDate;
      });

      if (periodVideos.length > 0) {
        trends.push({
          period: `Week ${i + 1}`,
          views: periodVideos.reduce((sum, video) => sum + video.views, 0),
          watchTime: periodVideos.reduce((sum, video) => sum + video.watch_time, 0),
          completionRate: periodVideos.reduce((sum, video) => sum + video.completion_rate, 0) / periodVideos.length,
          engagementRate: periodVideos.reduce((sum, video) => sum + video.engagement_rate, 0) / periodVideos.length
        });
      }
    }

    return trends;
  };

  const generateSampleVideoAnalytics = async () => {
    if (!user || videoAnalytics.length > 0) return;

    // Find posts that could be videos (contain video-related keywords or have video URLs)
    const videoPosts = posts.filter(post => 
      post.media_urls && post.media_urls.length > 0 ||
      post.content.toLowerCase().includes('video') ||
      post.content.toLowerCase().includes('watch') ||
      post.platforms.includes('youtube') ||
      post.platforms.includes('tiktok')
    );

    if (videoPosts.length === 0) return;

    try {
      const sampleData = videoPosts.flatMap(post => 
        post.platforms
          .filter(platform => ['youtube', 'tiktok', 'instagram', 'facebook', 'twitter'].includes(platform))
          .map(platform => ({
            post_id: post.id,
            platform,
            video_url: post.media_urls?.[0] || `https://example.com/video/${post.id}`,
            duration: Math.floor(Math.random() * 180) + 30, // 30-210 seconds
            views: Math.floor(Math.random() * 5000) + 500,
            watch_time: Math.floor(Math.random() * 300000) + 10000, // Total watch time
            completion_rate: Math.floor(Math.random() * 60) + 30, // 30-90%
            likes: Math.floor(Math.random() * 200) + 20,
            comments: Math.floor(Math.random() * 50) + 5,
            shares: Math.floor(Math.random() * 30) + 3,
            saves: Math.floor(Math.random() * 40) + 5,
            click_through_rate: Math.floor(Math.random() * 8) + 2, // 2-10%
            engagement_rate: Math.floor(Math.random() * 6) + 2, // 2-8%
            retention_points: [
              100,
              Math.floor(Math.random() * 20) + 75, // 75-95%
              Math.floor(Math.random() * 25) + 60, // 60-85%
              Math.floor(Math.random() * 30) + 45, // 45-75%
              Math.floor(Math.random() * 35) + 30  // 30-65%
            ],
            peak_concurrent_viewers: Math.floor(Math.random() * 100) + 10,
            average_view_duration: Math.floor(Math.random() * 120) + 20, // 20-140 seconds
            replay_count: Math.floor(Math.random() * 50) + 5,
            thumbnail_click_rate: Math.floor(Math.random() * 15) + 5, // 5-20%
            user_id: user.id
          }))
      );

      const { error } = await supabase
        .from('video_analytics')
        .insert(sampleData);

      if (error) throw error;
      await fetchVideoAnalytics();
    } catch (err) {
      console.error('Error generating sample video analytics:', err);
    }
  };

  useEffect(() => {
    fetchVideoAnalytics();
  }, [user, timeframe]);

  useEffect(() => {
    if (posts.length > 0 && videoAnalytics.length === 0) {
      generateSampleVideoAnalytics();
    }
  }, [posts, videoAnalytics]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('video_analytics_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_analytics',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setVideoAnalytics(prev => [...prev, payload.new as VideoAnalytics]);
          } else if (payload.eventType === 'UPDATE') {
            setVideoAnalytics(prev => prev.map(item => 
              item.id === payload.new.id ? payload.new as VideoAnalytics : item
            ));
          } else if (payload.eventType === 'DELETE') {
            setVideoAnalytics(prev => prev.filter(item => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    videoAnalytics,
    loading,
    error,
    createVideoAnalytics,
    updateVideoAnalytics,
    fetchVideoAnalytics,
    getVideoPerformanceMetrics,
    getVideoInsights,
    getVideoTrends,
    generateSampleVideoAnalytics
  };
}