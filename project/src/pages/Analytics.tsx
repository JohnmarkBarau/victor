import React, { useState } from 'react';
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
  ChartData,
  LineController,
  BarController,
  DoughnutController,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format, subDays, parseISO } from 'date-fns';
import { useAnalytics } from '../hooks/useAnalytics';
import { usePosts } from '../hooks/usePosts';
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown,
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Eye,
  Calendar,
  BarChart3,
  PieChart,
  RefreshCw,
  Download,
  Filter,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Linkedin
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

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

export default function Analytics() {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'views' | 'likes' | 'comments' | 'shares'>('engagement');
  
  const { 
    analytics, 
    loading, 
    error, 
    fetchAnalytics,
    getPlatformMetrics,
    getTimeSeriesData,
    getAnalyticsOverview,
    generateSampleAnalytics
  } = useAnalytics(timeframe);
  
  const { posts } = usePosts();

  const overview = getAnalyticsOverview();
  const platformMetrics = getPlatformMetrics();
  const timeSeriesData = getTimeSeriesData();

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'twitter':
        return <Twitter className="w-4 h-4 text-blue-400" />;
      case 'facebook':
        return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-600" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4 text-blue-700" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEngagementData = (): ChartData<'line'> => {
    const labels = timeSeriesData.map(item => format(parseISO(item.date), 'MMM dd'));
    
    return {
      labels,
      datasets: [
        {
          label: 'Engagement',
          data: timeSeriesData.map(item => item.engagement),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Views',
          data: timeSeriesData.map(item => item.views),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: false,
        }
      ],
    };
  };

  const getPlatformData = (): ChartData<'bar'> => ({
    labels: platformMetrics.map(p => p.platform),
    datasets: [
      {
        label: 'Total Engagement',
        data: platformMetrics.map(p => p.totalEngagement),
        backgroundColor: [
          'rgba(234, 88, 144, 0.8)',
          'rgba(29, 161, 242, 0.8)',
          'rgba(66, 103, 178, 0.8)',
          'rgba(255, 0, 0, 0.8)',
          'rgba(0, 119, 181, 0.8)'
        ],
        borderColor: [
          'rgb(234, 88, 144)',
          'rgb(29, 161, 242)',
          'rgb(66, 103, 178)',
          'rgb(255, 0, 0)',
          'rgb(0, 119, 181)'
        ],
        borderWidth: 1
      }
    ],
  });

  const getEngagementBreakdownData = (): ChartData<'doughnut'> => ({
    labels: ['Likes', 'Comments', 'Shares'],
    datasets: [
      {
        data: [overview.totalLikes, overview.totalComments, overview.totalShares],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)'
        ],
        borderWidth: 2
      }
    ],
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
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
          <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track your social media performance and engagement
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
            onClick={fetchAnalytics}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          {analytics.length === 0 && posts.length > 0 && (
            <Button
              onClick={generateSampleAnalytics}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Generate Sample Data
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading analytics: {error}
        </div>
      )}

      {analytics.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
            <p className="text-gray-500 text-center mb-4">
              {posts.length === 0 
                ? "Create some posts first to see analytics data here."
                : "Generate sample analytics data to see how your dashboard will look."
              }
            </p>
            {posts.length > 0 && (
              <Button onClick={generateSampleAnalytics}>
                Generate Sample Data
              </Button>
            )}
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
                      {formatNumber(overview.totalViews)}
                    </p>
                    <div className="text-sm">
                      {formatGrowth(overview.growthMetrics.viewsGrowth)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-50 rounded-lg">
                    <ThumbsUp className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Likes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(overview.totalLikes)}
                    </p>
                    <div className="text-sm">
                      {formatGrowth(overview.growthMetrics.likesGrowth)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Comments</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(overview.totalComments)}
                    </p>
                    <div className="text-sm">
                      {formatGrowth(overview.growthMetrics.commentsGrowth)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Share2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Shares</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(overview.totalShares)}
                    </p>
                    <div className="text-sm">
                      {formatGrowth(overview.growthMetrics.sharesGrowth)}
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
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Engagement Over Time
                </CardTitle>
                <CardDescription>
                  Track your engagement and views over the selected timeframe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Line 
                  data={getEngagementData()}
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
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Platform Performance
                </CardTitle>
                <CardDescription>
                  Compare engagement across different platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Bar
                  data={getPlatformData()}
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
                  <PieChart className="w-5 h-5 text-blue-600" />
                  Engagement Breakdown
                </CardTitle>
                <CardDescription>
                  Distribution of likes, comments, and shares
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

            <Card>
              <CardHeader>
                <CardTitle>Platform Metrics</CardTitle>
                <CardDescription>
                  Detailed performance by platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {platformMetrics.map((platform) => (
                    <div key={platform.platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getPlatformIcon(platform.platform)}
                        <div>
                          <p className="font-medium capitalize">{platform.platform}</p>
                          <p className="text-sm text-gray-500">
                            {platform.postCount} posts • {platform.engagementRate.toFixed(1)}% rate
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatNumber(platform.totalEngagement)}</p>
                        <p className="text-sm text-gray-500">engagement</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Post */}
          {overview.topPerformingPost && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Top Performing Post
                </CardTitle>
                <CardDescription>
                  Your best performing content in the selected timeframe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    {getPlatformIcon(overview.topPerformingPost.platform)}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 mb-2">{overview.topPerformingPost.content}</p>
                    <div className="flex items-center gap-4">
                      <Badge variant="success">
                        {formatNumber(overview.topPerformingPost.engagement)} engagements
                      </Badge>
                      <span className="text-sm text-gray-500 capitalize">
                        {overview.topPerformingPost.platform}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
              <CardDescription>
                AI-powered insights based on your analytics data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Engagement Rate</h4>
                  <p className="text-blue-700 text-sm">
                    Your average engagement rate is {overview.avgEngagementRate.toFixed(1)}%. 
                    {overview.avgEngagementRate > 3 
                      ? " This is above average - great job!" 
                      : " Consider posting more engaging content to improve this metric."
                    }
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Best Platform</h4>
                  <p className="text-purple-700 text-sm">
                    {platformMetrics.length > 0 && (
                      <>
                        {platformMetrics.reduce((best, current) => 
                          current.engagementRate > best.engagementRate ? current : best
                        ).platform} is your top performing platform with {
                          platformMetrics.reduce((best, current) => 
                            current.engagementRate > best.engagementRate ? current : best
                          ).engagementRate.toFixed(1)
                        }% engagement rate.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}