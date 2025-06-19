import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { 
  Calendar as CalendarIcon,
  TrendingUp,
  Sparkles,
  AlertCircle,
  Loader2,
  Plus,
  Hash,
  Clock,
  BarChart2,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Linkedin,
  Image as ImageIcon,
  Video,
  FileText,
  BookMarked,
  Filter,
  Target,
  Zap,
  Users,
  MessageSquare,
  Eye,
  ThumbsUp,
  Share2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Calendar as CalendarDays,
  ArrowRight,
  Star
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { usePosts } from '../hooks/usePosts';

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'insights'>('month');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const { posts, createPost } = usePosts();

  // Mock data for demonstration
  const suggestions = [
    {
      id: 'suggestion-1',
      type: 'engagement',
      title: 'Create Behind-the-Scenes Content',
      description: 'Share behind-the-scenes content to increase authenticity and engagement',
      suggestedDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
      platforms: ['instagram', 'tiktok'],
      priority: 'high',
      reasoning: 'Behind-the-scenes content typically receives 40% higher engagement',
      contentIdeas: [
        'Time-lapse of work process',
        'Team meeting highlights',
        'Office tour'
      ],
      hashtags: ['#BehindTheScenes', '#TeamWork', '#Process'],
      bestTime: '2:00 PM',
      expectedEngagement: 150
    },
    {
      id: 'suggestion-2',
      type: 'trending',
      title: 'Leverage Current Trends',
      description: 'Create content around trending topics in your industry',
      suggestedDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      platforms: ['twitter', 'linkedin'],
      priority: 'medium',
      reasoning: 'Trending topics can increase reach by 60%',
      contentIdeas: [
        'Industry trend analysis',
        'Hot topic commentary',
        'Trend prediction post'
      ],
      hashtags: ['#Trending', '#Industry', '#Innovation'],
      bestTime: '11:00 AM',
      expectedEngagement: 120
    }
  ];

  const trendingTopics = [
    {
      id: 'trend-1',
      title: 'AI and Technology Trends',
      description: 'AI continues to dominate conversations. Share insights about AI impact on your industry.',
      category: 'industry',
      relevanceScore: 89,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 90), 'yyyy-MM-dd'),
      hashtags: ['#AI', '#Technology', '#Innovation', '#FutureTech'],
      platforms: ['linkedin', 'twitter', 'youtube'],
      growth: 42
    }
  ];

  const calendarEvents = [
    ...posts.filter(post => post.scheduled_time).map(post => ({
      id: post.id,
      title: post.content.substring(0, 50) + '...',
      date: format(parseISO(post.scheduled_time!), 'yyyy-MM-dd'),
      type: 'post',
      status: 'scheduled',
      platforms: post.platforms,
      content: post.content,
      priority: 'high'
    })),
    ...suggestions.map(suggestion => ({
      id: suggestion.id,
      title: suggestion.title,
      date: suggestion.suggestedDate,
      type: 'suggestion',
      status: 'suggested',
      platforms: suggestion.platforms,
      priority: suggestion.priority,
      engagement: suggestion.expectedEngagement
    }))
  ];

  const insights = {
    scheduledPosts: posts.filter(p => p.status === 'scheduled').length,
    averageEngagement: 4.2,
    bestPerformingPlatform: { platform: 'instagram', engagementRate: 5.8 },
    contentGaps: 2,
    pendingComments: 5
  };

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
        return <CalendarIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="w-4 h-4" />;
      case 'suggestion':
        return <Lightbulb className="w-4 h-4" />;
      case 'trend':
        return <TrendingUp className="w-4 h-4" />;
      case 'gap':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const getEventTypeColor = (type: string, priority?: string) => {
    switch (type) {
      case 'post':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'suggestion':
        return priority === 'high' 
          ? 'bg-green-100 text-green-800 border-green-200'
          : 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'trend':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'gap':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Star className="w-3 h-3 text-red-500" />;
      case 'medium':
        return <AlertCircle className="w-3 h-3 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      default:
        return null;
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return calendarEvents.filter(event => event.date === dateStr);
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  const handleCreateFromSuggestion = async (suggestion: any) => {
    try {
      setLoading(true);
      await createPost({
        content: `${suggestion.title}\n\n${suggestion.description}\n\n${suggestion.hashtags.join(' ')}`,
        platforms: suggestion.platforms,
        scheduled_time: new Date(`${suggestion.suggestedDate}T${suggestion.bestTime}`).toISOString(),
        hashtags: suggestion.hashtags,
        status: 'scheduled'
      });
    } catch (error) {
      console.error('Error creating post from suggestion:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Smart Content Calendar</h1>
          <p className="text-gray-600 mt-1">
            AI-powered content planning with insights from your performance data
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Refresh Insights
          </Button>
        </div>
      </div>

      {/* Key Insights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CalendarDays className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Scheduled Posts</p>
                <p className="text-2xl font-bold text-gray-900">{insights.scheduledPosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. Engagement</p>
                <p className="text-2xl font-bold text-gray-900">{insights.averageEngagement.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Content Gaps</p>
                <p className="text-2xl font-bold text-gray-900">{insights.contentGaps}</p>
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
                <p className="text-sm text-gray-500">Pending Comments</p>
                <p className="text-2xl font-bold text-gray-900">{insights.pendingComments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="w-full border-b bg-white">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            AI Suggestions
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Trending Topics
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            Performance Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Content Calendar</CardTitle>
                  <CardDescription>
                    Click on a date to see scheduled content and suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="border rounded-lg p-4"
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    {format(selectedDate, 'MMMM d, yyyy')}
                  </CardTitle>
                  <CardDescription>
                    {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''} scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDateEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No events scheduled</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDateEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`p-3 rounded-lg border ${getEventTypeColor(event.type, event.priority)}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2">
                              {getEventTypeIcon(event.type)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-sm">{event.title}</h4>
                                  {event.priority && getPriorityIcon(event.priority)}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  {event.platforms.slice(0, 3).map(platform => (
                                    <div key={platform}>
                                      {getPlatformIcon(platform)}
                                    </div>
                                  ))}
                                  {event.platforms.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                      +{event.platforms.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Optimal Posting Times
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['instagram', 'twitter', 'linkedin'].map(platform => (
                      <div key={platform} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(platform)}
                          <span className="capitalize text-sm">{platform}</span>
                        </div>
                        <span className="text-sm font-medium">
                          2:00 PM
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {suggestion.description}
                      </CardDescription>
                    </div>
                    <Badge variant={suggestion.priority === 'high' ? 'destructive' : suggestion.priority === 'medium' ? 'warning' : 'secondary'}>
                      {suggestion.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Suggested Date</p>
                      <p className="text-sm text-gray-600">{format(parseISO(suggestion.suggestedDate), 'MMM d, yyyy')} at {suggestion.bestTime}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Platforms</p>
                      <div className="flex gap-2">
                        {suggestion.platforms.map(platform => (
                          <div key={platform} className="flex items-center gap-1">
                            {getPlatformIcon(platform)}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Content Ideas</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {suggestion.contentIdeas.slice(0, 2).map((idea, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{idea}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Expected Engagement</p>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">{suggestion.expectedEngagement} interactions</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button 
                        onClick={() => handleCreateFromSuggestion(suggestion)}
                        className="w-full"
                        size="sm"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Post
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {trendingTopics.map((topic) => (
              <Card key={topic.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={topic.category === 'seasonal' ? 'warning' : topic.category === 'holiday' ? 'destructive' : 'info'}>
                          {topic.category}
                        </Badge>
                        <span className="text-green-600 text-sm flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          +{topic.growth}%
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{topic.title}</h3>
                      <p className="text-gray-600 mb-4">{topic.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Relevance Score</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-600 rounded-full"
                                style={{ width: `${topic.relevanceScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{topic.relevanceScore}%</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Recommended Platforms</p>
                          <div className="flex gap-2">
                            {topic.platforms.map(platform => (
                              <div key={platform}>
                                {getPlatformIcon(platform)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Trending Hashtags</p>
                        <div className="flex flex-wrap gap-2">
                          {topic.hashtags.map((hashtag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {hashtag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6">
                      <Button variant="outline" size="sm">
                        <BookMarked className="w-4 h-4 mr-2" />
                        Save Topic
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Best Performing Platform</h4>
                    <div className="flex items-center gap-2">
                      {insights.bestPerformingPlatform && getPlatformIcon(insights.bestPerformingPlatform.platform)}
                      <span className="capitalize">{insights.bestPerformingPlatform?.platform}</span>
                      <Badge variant="success">
                        {insights.bestPerformingPlatform?.engagementRate.toFixed(1)}% engagement
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Content Consistency</h4>
                    <p className="text-green-700 text-sm">
                      You've published {posts.length} posts with {insights.scheduledPosts} more scheduled.
                      {insights.contentGaps > 0 
                        ? ` Consider filling ${insights.contentGaps} content gaps for better consistency.`
                        : ' Great job maintaining consistent posting!'
                      }
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Engagement Opportunities</h4>
                    <p className="text-purple-700 text-sm">
                      {insights.pendingComments > 0 
                        ? `You have ${insights.pendingComments} pending comments. Responding quickly can boost engagement.`
                        : 'All comments have been addressed. Great community management!'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Optimal Posting Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { platform: 'instagram', day: 'Tuesday', time: '2:00 PM', confidence: 92 },
                    { platform: 'twitter', day: 'Wednesday', time: '12:00 PM', confidence: 88 },
                    { platform: 'linkedin', day: 'Thursday', time: '8:00 AM', confidence: 85 },
                    { platform: 'facebook', day: 'Friday', time: '3:00 PM', confidence: 82 },
                    { platform: 'youtube', day: 'Saturday', time: '2:00 PM', confidence: 79 },
                    { platform: 'tiktok', day: 'Sunday', time: '7:00 PM', confidence: 86 }
                  ].map((time, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getPlatformIcon(time.platform)}
                        <div>
                          <p className="font-medium capitalize">{time.platform}</p>
                          <p className="text-sm text-gray-500">{time.day}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{time.time}</p>
                        <p className="text-sm text-gray-500">{time.confidence}% confidence</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}