import React, { useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  BarController,
  DoughnutController,
} from 'chart.js';
import {
  Video,
  Play,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  Info,
  RefreshCw,
  Download,
  Filter,
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  Music2 as TikTok,
  Loader2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useVideoAnalytics } from '../hooks/useVideoAnalytics';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  BarController,
  DoughnutController
);

export default function VideoAnalytics() {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'completion' | 'engagement'>('views');
  
  const {
    videoAnalytics,
    loading,
    error,
    fetchVideoAnalytics,
    getVideoPerformanceMetrics,
    getVideoInsights,
    getVideoTrends,
    generateSampleVideoAnalytics
  } = useVideoAnalytics(timeframe);

  const metrics = getVideoPerformanceMetrics();
  const insights = getVideoInsights();
  const trends = getVideoTrends();

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-600" />;
      case 'tiktok':
        return <TikTok className="w-4 h-4 text-black" />;
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'facebook':
        return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'twitter':
        return <Twitter className="w-4 h-4 text-blue-400" />;
      default:
        return <Video className="w-4 h-4 text-gray-500" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'improvement':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-purple-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'improvement':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'info':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getViewsOverTimeData = () => ({
    labels: trends.map(trend => trend.period),
    datasets: [
      {
        label: 'Views',
        data: trends.map(trend => trend.views),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Watch Time (hours)',
        data: trends.map(trend => Math.round(trend.watchTime / 3600)),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: false,
      }
    ],
  });

  const getCompletionRateData = () => ({
    labels: trends.map(trend => trend.period),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: trends.map(trend => trend.completionRate),
        backgroundColor: trends.map(trend => 
          trend.completionRate > 70 ? 'rgba(16, 185, 129, 0.8)' :
          trend.completionRate > 50 ? 'rgba(245, 158, 11, 0.8)' :
          'rgba(239, 68, 68, 0.8)'
        ),
        borderColor: trends.map(trend => 
          trend.completionRate > 70 ? 'rgb(16, 185, 129)' :
          trend.completionRate > 50 ? 'rgb(245, 158, 11)' :
          'rgb(239, 68, 68)'
        ),
        borderWidth: 1
      }
    ],
  });

  const getPlatformPerformanceData = () => ({
    labels: metrics.platformBreakdown.map(p => p.platform),
    datasets: [
      {
        label: 'Total Views',
        data: metrics.platformBreakdown.map(p => p.totalViews),
        backgroundColor: [
          'rgba(255, 0, 0, 0.8)',      // YouTube - Red
          'rgba(0, 0, 0, 0.8)',        // TikTok - Black
          'rgba(234, 88, 144, 0.8)',   // Instagram - Pink
          'rgba(66, 103, 178, 0.8)',   // Facebook - Blue
          'rgba(29, 161, 242, 0.8)'    // Twitter - Blue
        ],
        borderColor: [
          'rgb(255, 0, 0)',
          'rgb(0, 0, 0)',
          'rgb(234, 88, 144)',
          'rgb(66, 103, 178)',
          'rgb(29, 161, 242)'
        ],
        borderWidth: 1
      }
    ],
  });

  const getEngagementBreakdownData = () => {
    const totalLikes = videoAnalytics.reduce((sum, video) => sum + video.likes, 0);
    const totalComments = videoAnalytics.reduce((sum, video) => sum + video.comments, 0);
    const totalShares = videoAnalytics.reduce((sum, video) => sum + video.shares, 0);
    const totalSaves = videoAnalytics.reduce((sum, video) => sum + video.saves, 0);

    return {
      labels: ['Likes', 'Comments', 'Shares', 'Saves'],
      datasets: [
        {
          data: [totalLikes, totalComments, totalShares, totalSaves],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(139, 92, 246)'
          ],
          borderWidth: 2
        }
      ],
    };
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    return (
      <span className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        {Math.abs(growth).toFixed(1)}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Video Analytics</h1>
          <p className="text-gray-600 mt-1">
            Track your video performance across all platforms
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button
            variant="outline"
            onClick={fetchVideoAnalytics}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          {videoAnalytics.length === 0 && (
            <Button
              onClick={generateSampleVideoAnalytics}
              className="flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              Generate Sample Data
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading video analytics: {error}
        </div>
      )}

      {videoAnalytics.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Video Analytics Data</h3>
            <p className="text-gray-500 text-center mb-4">
              Create video content or generate sample data to see your video performance metrics.
            </p>
            <Button onClick={generateSampleVideoAnalytics}>
              Generate Sample Data
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(metrics.totalViews)}
                    </p>
                    <div className="text-sm">
                      {formatGrowth(metrics.growthMetrics.viewsGrowth)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Watch Time</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatDuration(metrics.totalWatchTime)}
                    </p>
                    <div className="text-sm text-gray-500">
                      Avg: {formatDuration(metrics.totalWatchTime / metrics.totalVideos || 0)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.averageCompletionRate.toFixed(1)}%
                    </p>
                    <div className="text-sm">
                      {formatGrowth(metrics.growthMetrics.completionRateGrowth)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Zap className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Engagement Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.averageEngagementRate.toFixed(1)}%
                    </p>
                    <div className="text-sm">
                      {formatGrowth(metrics.growthMetrics.engagementGrowth)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Views & Watch Time Trends
                </CardTitle>
                <CardDescription>
                  Track your video views and total watch time over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Line 
                  data={getViewsOverTimeData()}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Completion Rate by Period
                </CardTitle>
                <CardDescription>
                  Monitor how well your videos retain viewers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Bar
                  data={getCompletionRateData()}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-red-600" />
                  Platform Performance
                </CardTitle>
                <CardDescription>
                  Compare video performance across platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Bar
                  data={getPlatformPerformanceData()}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-green-600" />
                  Engagement Breakdown
                </CardTitle>
                <CardDescription>
                  Distribution of engagement types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div className="w-64 h-64">
                    <Doughnut
                      data={getEngagementBreakdownData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom' as const,
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance Details</CardTitle>
              <CardDescription>
                Detailed metrics for each video platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.platformBreakdown.map((platform) => (
                  <div key={platform.platform} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(platform.platform)}
                      <div>
                        <p className="font-medium capitalize">{platform.platform}</p>
                        <p className="text-sm text-gray-500">
                          {platform.videoCount} videos • {formatNumber(platform.totalViews)} views
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Completion</p>
                          <p className="font-semibold">{platform.avgCompletionRate.toFixed(1)}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Engagement</p>
                          <p className="font-semibold">{platform.avgEngagementRate.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Video */}
          {metrics.topPerformingVideo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Top Performing Video
                </CardTitle>
                <CardDescription>
                  Your best performing video in the selected timeframe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Play className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 mb-2">{metrics.topPerformingVideo.title}</p>
                    <div className="flex items-center gap-4">
                      <Badge variant="success">
                        {formatNumber(metrics.topPerformingVideo.views)} views
                      </Badge>
                      <Badge variant="success">
                        {metrics.topPerformingVideo.completionRate.toFixed(1)}% completion
                      </Badge>
                      <span className="text-sm text-gray-500 capitalize flex items-center gap-1">
                        {getPlatformIcon(metrics.topPerformingVideo.platform)}
                        {metrics.topPerformingVideo.platform}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Video Performance Insights
              </CardTitle>
              <CardDescription>
                AI-powered insights to improve your video content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${getInsightColor(insight.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <div className="flex items-center gap-2">
                            {insight.metric && (
                              <Badge variant="outline\" className="text-xs">
                                {insight.metric}
                              </Badge>
                            )}
                            <Badge 
                              variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'warning' : 'secondary'}
                              className="text-xs"
                            >
                              {insight.priority}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm mb-2">{insight.description}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="w-4 h-4" />
                          <span className="font-medium">Action:</span>
                          <span>{insight.actionable}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Retention Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Retention Analysis
              </CardTitle>
              <CardDescription>
                Understand how viewers engage with your video content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Average Drop-off Point</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {metrics.retentionAnalysis.averageDropOffPoint}%
                  </p>
                  <p className="text-sm text-purple-700 mt-1">
                    Most viewers drop off at this point
                  </p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Strong Retention Videos</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {metrics.retentionAnalysis.strongRetentionVideos}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Videos with 70%+ completion rate
                  </p>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-2">Improvement Areas</h4>
                  <p className="text-2xl font-bold text-orange-600">
                    {metrics.retentionAnalysis.improvementAreas.length}
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    Areas needing attention
                  </p>
                </div>
              </div>
              
              {metrics.retentionAnalysis.improvementAreas.length > 0 && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h5 className="font-medium text-yellow-900 mb-2">Focus Areas for Improvement:</h5>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    {metrics.retentionAnalysis.improvementAreas.map((area, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}