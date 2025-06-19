import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  TrendingUp,
  Clock,
  MessageSquare,
  BarChart2,
  Hash,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Loader2,
  ThumbsUp,
  Share2,
  Eye,
  Calendar,
  Send,
  Edit2,
  Check,
  X,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Music2 as TikTok,
  Pointer as Pinterest,
  Linkedin
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';

interface EngagementMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  platform: string;
  created_at: string;
}

interface PerformanceInsight {
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  metric?: string;
  improvement?: string;
}

interface HashtagAnalysis {
  tag: string;
  engagement: number;
  posts: number;
  trending: boolean;
}

export default function EngagementBooster() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<EngagementMetrics[]>([]);
  const [insights, setInsights] = useState<PerformanceInsight[]>([]);
  const [hashtags, setHashtags] = useState<HashtagAnalysis[]>([]);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  useEffect(() => {
    fetchEngagementData();
  }, [selectedTimeframe, selectedPlatform]);

  const fetchEngagementData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('post_analytics')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMetrics(data || []);
      generateInsights(data);
      analyzeHashtags(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (data: EngagementMetrics[]) => {
    setInsights([
      {
        type: 'success',
        title: 'Best Posting Time Identified',
        description: 'Posts published between 2-4 PM show 27% higher engagement',
        metric: '27% increase',
        improvement: 'Schedule your posts during peak hours'
      },
      {
        type: 'warning',
        title: 'Engagement Drop Detected',
        description: 'Recent posts are receiving fewer comments than usual',
        metric: '-15% comments',
        improvement: 'Try asking questions in your captions'
      },
      {
        type: 'info',
        title: 'Content Type Analysis',
        description: 'Video content is outperforming images by 2x',
        metric: '2x engagement',
        improvement: 'Consider creating more video content'
      }
    ]);
  };

  const analyzeHashtags = (data: EngagementMetrics[]) => {
    setHashtags([
      { tag: '#socialmedia', engagement: 856, posts: 12, trending: true },
      { tag: '#marketing', engagement: 743, posts: 8, trending: false },
      { tag: '#business', engagement: 621, posts: 15, trending: true },
      { tag: '#startup', engagement: 534, posts: 6, trending: false },
      { tag: '#innovation', engagement: 489, posts: 9, trending: true }
    ]);
  };

  const generateAIRecommendations = async () => {
    setGeneratingInsights(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setGeneratingInsights(false);
    } catch (err: any) {
      setError(err.message);
      setGeneratingInsights(false);
    }
  };

  const getEngagementData = () => ({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Engagement Rate',
        data: [4.2, 3.8, 5.1, 4.9, 5.3, 4.7, 4.4],
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.4,
        fill: false
      }
    ]
  });

  const getContentTypeData = () => ({
    labels: ['Images', 'Videos', 'Carousels', 'Text'],
    datasets: [
      {
        label: 'Average Engagement',
        data: [423, 687, 542, 289],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(99, 102, 241, 0.8)'
        ]
      }
    ]
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Engagement Booster AI</h1>
          <p className="text-gray-600 mt-2">
            AI-powered insights to maximize your social media performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">Twitter</option>
            <option value="facebook">Facebook</option>
          </select>
          <Button
            onClick={generateAIRecommendations}
            disabled={generatingInsights}
            className="flex items-center gap-2"
          >
            {generatingInsights ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Generate Insights
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center gap-3 mb-8">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">124.5K</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <ThumbsUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Engagement Rate</p>
              <p className="text-2xl font-bold text-gray-900">4.8%</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Comments</p>
              <p className="text-2xl font-bold text-gray-900">2.3K</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Share2 className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Shares</p>
              <p className="text-2xl font-bold text-gray-900">1.8K</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Performance Insights
            </h2>
            <div className="space-y-6">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    insight.type === 'success'
                      ? 'bg-green-50 border-green-100'
                      : insight.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-100'
                      : 'bg-blue-50 border-blue-100'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                      <p className="text-gray-600 mt-1">{insight.description}</p>
                    </div>
                    {insight.metric && (
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                        insight.type === 'success'
                          ? 'bg-green-100 text-green-800'
                          : insight.type === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {insight.metric}
                      </span>
                    )}
                  </div>
                  {insight.improvement && (
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-medium">Recommendation:</span>
                      {insight.improvement}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-3">
                <BarChart2 className="w-5 h-5 text-blue-600" />
                Engagement Timeline
              </h2>
              <Line
                data={getEngagementData()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-3">
                <BarChart2 className="w-5 h-5 text-blue-600" />
                Content Type Performance
              </h2>
              <Bar
                data={getContentTypeData()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              Best Times to Post
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>Monday - Friday</span>
                </div>
                <span className="font-medium">2 PM - 4 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>Saturday</span>
                </div>
                <span className="font-medium">11 AM - 1 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>Sunday</span>
                </div>
                <span className="font-medium">3 PM - 5 PM</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-3">
              <Hash className="w-5 h-5 text-blue-600" />
              Top Performing Hashtags
            </h2>
            <div className="space-y-6">
              {hashtags.map((hashtag, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{hashtag.tag}</span>
                      {hashtag.trending && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Trending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Used in {hashtag.posts} posts
                    </p>
                  </div>
                  <span className="font-medium">
                    {hashtag.engagement.toLocaleString()} eng.
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              Reshare Opportunities
            </h2>
            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  "Launch announcement post from last week..."
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Potential reach: +5.2K
                  </span>
                  <Button size="sm">Optimize & Reshare</Button>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  "Product feature highlight from..."
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Potential reach: +3.8K
                  </span>
                  <Button size="sm">Optimize & Reshare</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}