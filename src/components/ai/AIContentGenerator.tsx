import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import {
  Sparkles,
  Loader2,
  Copy,
  RefreshCw,
  Settings,
  Target,
  Zap,
  TrendingUp,
  MessageSquare,
  Hash,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Users,
  BarChart3
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AIContentGeneratorProps {
  onContentGenerated?: (content: string) => void;
  initialTopic?: string;
  platforms?: string[];
}

interface ContentSuggestion {
  title: string;
  description: string;
  contentType: 'post' | 'thread' | 'carousel' | 'video' | 'story';
  platforms: string[];
  estimatedEngagement: 'Low' | 'Medium' | 'High';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeToCreate: string;
  hashtags: string[];
  tips: string[];
}

export function AIContentGenerator({ onContentGenerated, initialTopic = '', platforms = [] }: AIContentGeneratorProps) {
  const [activeTab, setActiveTab] = useState<'generate' | 'suggestions'>('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    topic: initialTopic,
    tone: 'Professional' as 'Professional' | 'Casual' | 'Friendly' | 'Formal',
    length: 'Medium' as 'Short' | 'Medium' | 'Long' | 'Unlimited',
    platforms: platforms.length > 0 ? platforms : ['instagram'],
    contentType: 'post' as 'post' | 'thread' | 'carousel' | 'story',
    includeHashtags: true,
    includeEmojis: true,
    targetAudience: '',
    callToAction: '',
    industry: '',
    contentGoals: ['engagement'] as string[]
  });

  const showMessage = (message: string, isError = false) => {
    if (isError) {
      setError(message);
      setSuccess(null);
    } else {
      setSuccess(message);
      setError(null);
    }
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 5000);
  };

  const generateContent = async () => {
    if (!formData.topic.trim()) {
      showMessage('Please enter a topic for content generation', true);
      return;
    }

    if (formData.platforms.length === 0) {
      showMessage('Please select at least one platform', true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-content', {
        body: {
          topic: formData.topic,
          tone: formData.tone,
          length: formData.length,
          platforms: formData.platforms,
          contentType: formData.contentType,
          includeHashtags: formData.includeHashtags,
          includeEmojis: formData.includeEmojis,
          targetAudience: formData.targetAudience || undefined,
          callToAction: formData.callToAction || undefined
        }
      });

      if (functionError) throw functionError;
      if (!data?.content) throw new Error('No content generated');

      setGeneratedContent(data.content);
      onContentGenerated?.(data.content);
      showMessage('Content generated successfully!');
    } catch (err: any) {
      showMessage(err.message || 'Failed to generate content', true);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSuggestions = async () => {
    setIsLoadingSuggestions(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-content-suggestions', {
        body: {
          industry: formData.industry || undefined,
          targetAudience: formData.targetAudience || undefined,
          contentGoals: formData.contentGoals,
          platforms: formData.platforms,
          brandVoice: `${formData.tone.toLowerCase()} and engaging`,
          count: 6
        }
      });

      if (functionError) throw functionError;
      if (!data?.suggestions) throw new Error('No suggestions generated');

      setSuggestions(data.suggestions);
      showMessage('Content suggestions generated!');
    } catch (err: any) {
      showMessage(err.message || 'Failed to generate suggestions', true);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showMessage('Copied to clipboard!');
    } catch (err) {
      showMessage('Failed to copy to clipboard', true);
    }
  };

  const handlePlatformToggle = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleContentGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      contentGoals: prev.contentGoals.includes(goal)
        ? prev.contentGoals.filter(g => g !== goal)
        : [...prev.contentGoals, goal]
    }));
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const availablePlatforms = [
    { id: 'instagram', name: 'Instagram' },
    { id: 'twitter', name: 'Twitter' },
    { id: 'facebook', name: 'Facebook' },
    { id: 'linkedin', name: 'LinkedIn' },
    { id: 'tiktok', name: 'TikTok' },
    { id: 'youtube', name: 'YouTube' }
  ];

  const contentGoals = [
    { id: 'engagement', name: 'Engagement', icon: MessageSquare },
    { id: 'awareness', name: 'Brand Awareness', icon: TrendingUp },
    { id: 'leads', name: 'Lead Generation', icon: Target },
    { id: 'sales', name: 'Sales', icon: Zap },
    { id: 'education', name: 'Education', icon: Lightbulb },
    { id: 'community', name: 'Community Building', icon: Users }
  ];

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {(error || success) && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {error ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          <p>{error || success}</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'generate' | 'suggestions')}>
        <TabsList className="w-full">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Generate Content
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Content Ideas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Content Configuration
                </CardTitle>
                <CardDescription>
                  Configure your AI content generation settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Topic */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic or Keywords *
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., sustainable fashion, productivity tips, new product launch"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Tone and Length */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tone
                    </label>
                    <select
                      value={formData.tone}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        tone: e.target.value as typeof formData.tone
                      }))}
                      className="w-full p-3 border rounded-lg"
                    >
                      <option value="Professional">Professional</option>
                      <option value="Casual">Casual</option>
                      <option value="Friendly">Friendly</option>
                      <option value="Formal">Formal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Length
                    </label>
                    <select
                      value={formData.length}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        length: e.target.value as typeof formData.length
                      }))}
                      className="w-full p-3 border rounded-lg"
                    >
                      <option value="Short">Short (50-100 chars)</option>
                      <option value="Medium">Medium (100-200 chars)</option>
                      <option value="Long">Long (200-500 chars)</option>
                      <option value="Unlimited">Unlimited</option>
                    </select>
                  </div>
                </div>

                {/* Content Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <select
                    value={formData.contentType}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      contentType: e.target.value as typeof formData.contentType
                    }))}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="post">Regular Post</option>
                    <option value="thread">Thread/Carousel</option>
                    <option value="story">Story</option>
                  </select>
                </div>

                {/* Platforms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Platforms *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePlatforms.map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => handlePlatformToggle(platform.id)}
                        className={`p-2 text-sm rounded-lg border transition-colors ${
                          formData.platforms.includes(platform.id)
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {platform.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Advanced Options</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.includeHashtags}
                        onChange={(e) => setFormData(prev => ({ ...prev, includeHashtags: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Include Hashtags</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.includeEmojis}
                        onChange={(e) => setFormData(prev => ({ ...prev, includeEmojis: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Include Emojis</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Audience (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                      placeholder="e.g., small business owners, millennials, tech enthusiasts"
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Call-to-Action (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.callToAction}
                      onChange={(e) => setFormData(prev => ({ ...prev, callToAction: e.target.value }))}
                      placeholder="e.g., Visit our website, Sign up today, Share your thoughts"
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>

                <Button
                  onClick={generateContent}
                  disabled={isGenerating || !formData.topic.trim() || formData.platforms.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Content...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Generated Content
                  </span>
                  {generatedContent && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatedContent)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateContent}
                        disabled={isGenerating}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Regenerate
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedContent ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="whitespace-pre-wrap text-gray-900">{generatedContent}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{generatedContent.length} characters</span>
                      <div className="flex gap-2">
                        {formData.platforms.map(platform => (
                          <Badge key={platform} variant="outline" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate</h3>
                    <p className="text-gray-500">
                      Configure your settings and click "Generate Content" to create AI-powered social media content.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Content Ideas & Suggestions</h3>
              <p className="text-gray-600">AI-powered content ideas tailored to your goals</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Industry:</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="e.g., technology, fashion"
                  className="px-3 py-1 border rounded-md text-sm"
                />
              </div>
              <Button
                onClick={generateSuggestions}
                disabled={isLoadingSuggestions}
                className="flex items-center gap-2"
              >
                {isLoadingSuggestions ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-4 h-4" />
                    Get Ideas
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Content Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Goals
            </label>
            <div className="flex flex-wrap gap-2">
              {contentGoals.map((goal) => {
                const Icon = goal.icon;
                return (
                  <button
                    key={goal.id}
                    onClick={() => handleContentGoalToggle(goal.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
                      formData.contentGoals.includes(goal.id)
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {goal.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Suggestions Grid */}
          {suggestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map((suggestion, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                      <div className="flex gap-1">
                        <Badge className={getEngagementColor(suggestion.estimatedEngagement)}>
                          {suggestion.estimatedEngagement}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{suggestion.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{suggestion.contentType}</Badge>
                        <Badge className={getDifficultyColor(suggestion.difficulty)}>
                          {suggestion.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{suggestion.timeToCreate}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Best Platforms:</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.platforms.map(platform => (
                          <Badge key={platform} variant="outline" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Hashtags:</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.hashtags.map(hashtag => (
                          <Badge key={hashtag} variant="outline" className="text-xs">
                            <Hash className="w-3 h-3 mr-1" />
                            {hashtag.replace('#', '')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Tips:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {suggestion.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          topic: suggestion.title,
                          contentType: suggestion.contentType,
                          platforms: suggestion.platforms
                        }));
                        setActiveTab('generate');
                      }}
                    >
                      Use This Idea
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Suggestions Yet</h3>
              <p className="text-gray-500 mb-4">
                Click "Get Ideas" to generate AI-powered content suggestions based on your goals.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}