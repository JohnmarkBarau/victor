import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { MediaUpload } from '../components/post/MediaUpload';
import { SocialPostComposer } from '../components/social/SocialPostComposer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Image as ImageIcon, Calendar, Clock, Hash, Settings2, Sparkles, Instagram, Twitter, Facebook, Youtube, Atom as Tiktok, Loader2, AlertCircle, Check, X, Send } from 'lucide-react';
import { usePosts } from '../hooks/usePosts';
import { useSocialAuth } from '../hooks/useSocialAuth';
import { supabase } from '../lib/supabase';

interface AIConfig {
  topic: string;
  tone: 'Professional' | 'Casual' | 'Friendly' | 'Formal';
  length: 'Short' | 'Medium' | 'Long' | 'Unlimited';
  targetPlatforms: string[];
}

export default function CreatePost() {
  const navigate = useNavigate();
  const { createPost, loading: postsLoading } = usePosts();
  const { connectedAccounts, postToSocialMedia } = useSocialAuth();
  
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    topic: '',
    tone: 'Professional',
    length: 'Medium',
    targetPlatforms: []
  });
  const [activeTab, setActiveTab] = useState<'traditional' | 'direct'>('traditional');

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram },
    { id: 'twitter', name: 'Twitter', icon: Twitter },
    { id: 'facebook', name: 'Facebook', icon: Facebook },
    { id: 'youtube', name: 'Youtube', icon: Youtube },
    { id: 'tiktok', name: 'TikTok', icon: Tiktok }
  ];

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

  const handleMediaUpload = (files: File[]) => {
    setMediaFiles(files);
  };

  const generateAIContent = async () => {
    if (!aiConfig.topic.trim()) {
      showMessage('Please enter a topic for AI content generation', true);
      return;
    }

    if (selectedPlatforms.length === 0) {
      showMessage('Please select at least one platform', true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-content', {
        body: {
          topic: aiConfig.topic,
          tone: aiConfig.tone,
          length: aiConfig.length,
          platforms: selectedPlatforms
        }
      });

      if (functionError) throw functionError;
      if (!data?.content) throw new Error('No content generated');

      // Set the generated content in the main content field
      setContent(data.content);
      showMessage('AI content generated successfully!');
    } catch (err: any) {
      showMessage(err.message || 'Failed to generate content', true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (status: 'draft' | 'scheduled' | 'published') => {
    if (!content.trim()) {
      showMessage('Please add some content to your post', true);
      return;
    }

    if (selectedPlatforms.length === 0) {
      showMessage('Please select at least one platform', true);
      return;
    }

    if (status === 'scheduled' && (!scheduledDate || !scheduledTime)) {
      showMessage('Please set a date and time for scheduling', true);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // For now, we'll just create URLs for the media files
      // In a real app, you'd upload these to storage first
      const mediaUrls = mediaFiles.map((file, index) => 
        URL.createObjectURL(file)
      );

      const postData = {
        content,
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
        platforms: selectedPlatforms,
        scheduled_time: scheduledDate && scheduledTime 
          ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
          : undefined,
        hashtags: hashtags.split(' ').filter(tag => tag.trim().length > 0),
        status
      };

      await createPost(postData);

      const statusMessage = {
        draft: 'Post saved as draft',
        scheduled: 'Post scheduled successfully',
        published: 'Post published successfully'
      };

      showMessage(statusMessage[status]);

      // Reset form after successful save
      setTimeout(() => {
        if (status === 'published' || status === 'scheduled') {
          navigate('/dashboard');
        } else {
          // Reset form for draft
          setContent('');
          setSelectedPlatforms([]);
          setScheduledDate('');
          setScheduledTime('');
          setHashtags('');
          setMediaFiles([]);
          setAiConfig({
            topic: '',
            tone: 'Professional',
            length: 'Medium',
            targetPlatforms: []
          });
        }
      }, 1500);

    } catch (err: any) {
      showMessage(err.message || 'Failed to save post', true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDirectPost = async () => {
    if (!content.trim()) {
      showMessage('Please add some content to your post', true);
      return;
    }

    const connectedPlatforms = connectedAccounts.filter(account => 
      selectedPlatforms.includes(account.platform)
    );

    if (connectedPlatforms.length === 0) {
      showMessage('Please connect and select at least one social media account', true);
      return;
    }

    setIsPosting(true);
    setError(null);

    try {
      const mediaUrls = mediaFiles.map(file => URL.createObjectURL(file));
      const results = [];

      for (const account of connectedPlatforms) {
        try {
          const result = await postToSocialMedia(account.id, content, mediaUrls);
          results.push({ platform: account.platform, success: true, result });
        } catch (err: any) {
          results.push({ platform: account.platform, success: false, error: err.message });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        showMessage(`Successfully posted to ${successCount} platform${successCount !== 1 ? 's' : ''}${failCount > 0 ? `, ${failCount} failed` : ''}`);
        
        // Reset form on success
        setContent('');
        setSelectedPlatforms([]);
        setMediaFiles([]);
        setHashtags('');
      } else {
        showMessage('Failed to post to any platforms', true);
      }
    } catch (err: any) {
      showMessage(err.message || 'Failed to post', true);
    } finally {
      setIsPosting(false);
    }
  };

  const getCharacterLimit = () => {
    if (selectedPlatforms.includes('twitter')) return 280;
    if (selectedPlatforms.includes('instagram')) return 2200;
    if (selectedPlatforms.includes('facebook')) return 63206;
    return 280; // Default to most restrictive
  };

  const characterLimit = getCharacterLimit();
  const isOverLimit = content.length > characterLimit;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Post</h1>

      {(error || success) && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
          error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {error ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          <p>{error || success}</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'traditional' | 'direct')} className="mb-8">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="traditional">Traditional Posting</TabsTrigger>
          <TabsTrigger value="direct">Direct Social Media Posting</TabsTrigger>
        </TabsList>

        <TabsContent value="direct">
          <SocialPostComposer 
            initialContent={content}
            onPostSuccess={() => {
              showMessage('Successfully posted to social media!');
              setTimeout(() => navigate('/dashboard'), 1500);
            }}
          />
        </TabsContent>

        <TabsContent value="traditional">
          <div className="flex gap-8">
            {/* Left Column */}
            <div className="flex-1">
              <Tabs defaultValue="editor">
                <TabsList className="w-full mb-6">
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="ai-assist">AI Assist</TabsTrigger>
                </TabsList>

                <TabsContent value="editor">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Media
                      </label>
                      <MediaUpload
                        onUpload={handleMediaUpload}
                        maxFiles={4}
                        acceptedFileTypes={['image/*', 'video/*']}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Caption
                      </label>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write a caption..."
                        className={`w-full min-h-[200px] p-4 border rounded-lg resize-none ${
                          isOverLimit ? 'border-red-300 focus:border-red-500' : 'focus:border-blue-500'
                        }`}
                      />
                      <div className={`flex justify-between text-sm mt-2 ${
                        isOverLimit ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        <span>{content.length}/{characterLimit}</span>
                        {isOverLimit && (
                          <span className="flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            Character limit exceeded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ai-assist">
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">AI Content Generator</h2>
                    <p className="text-gray-600">Let our AI help you create engaging content</p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Topic or Keywords
                        </label>
                        <input
                          type="text"
                          value={aiConfig.topic}
                          onChange={(e) => setAiConfig(prev => ({ ...prev, topic: e.target.value }))}
                          placeholder="e.g., product launch, industry trends"
                          className="w-full p-3 border rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tone
                        </label>
                        <select
                          value={aiConfig.tone}
                          onChange={(e) => setAiConfig(prev => ({ 
                            ...prev, 
                            tone: e.target.value as AIConfig['tone']
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
                          Content Length
                        </label>
                        <select
                          value={aiConfig.length}
                          onChange={(e) => setAiConfig(prev => ({
                            ...prev,
                            length: e.target.value as AIConfig['length']
                          }))}
                          className="w-full p-3 border rounded-lg"
                        >
                          <option value="Short">Short (50-100 characters)</option>
                          <option value="Medium">Medium (100-200 characters)</option>
                          <option value="Long">Long (200-280 characters)</option>
                          <option value="Unlimited">Unlimited (No character limit)</option>
                        </select>
                        {aiConfig.length === 'Unlimited' && (
                          <p className="text-sm text-blue-600 mt-2 bg-blue-50 p-3 rounded-lg">
                            <strong>Unlimited mode:</strong> AI will generate comprehensive content without character restrictions. Perfect for detailed posts, blog-style content, or long-form social media posts.
                          </p>
                        )}
                      </div>

                      <Button
                        onClick={generateAIContent}
                        disabled={isGenerating || !aiConfig.topic.trim() || selectedPlatforms.length === 0}
                        className="w-full"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating content...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Content
                          </>
                        )}
                      </Button>

                      {selectedPlatforms.length === 0 && (
                        <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                          Please select at least one platform below to generate content.
                        </p>
                      )}
                    </div>

                    {/* Show generated content preview */}
                    {content && (
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-medium text-blue-900 mb-2">Generated Content Preview:</h3>
                        <p className="text-blue-800 text-sm whitespace-pre-wrap">{content}</p>
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              // Switch to editor tab to show the content
                              const editorTab = document.querySelector('[value="editor"]') as HTMLElement;
                              editorTab?.click();
                            }}
                          >
                            Edit Content
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setContent('')}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Platform Selection */}
              <div className="mt-8">
                <h2 className="text-lg font-medium mb-4">Platforms</h2>
                <div className="flex flex-wrap gap-3">
                  {platforms.map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = selectedPlatforms.includes(platform.id);
                    return (
                      <button
                        key={platform.id}
                        onClick={() => setSelectedPlatforms(prev => 
                          prev.includes(platform.id)
                            ? prev.filter(p => p !== platform.id)
                            : [...prev, platform.id]
                        )}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-200 text-blue-700' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {platform.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column - Settings */}
            <div className="w-80 bg-white rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Post Settings</h2>
              <p className="text-sm text-gray-600 mb-8">Configure your post details</p>

              <div className="space-y-6">
                {/* Scheduling */}
                <div>
                  <h3 className="font-medium mb-4">Scheduling</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Date</label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Time</label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    Best time to post: 9:00 AM
                  </div>
                </div>

                {/* Hashtags */}
                <div>
                  <h3 className="font-medium mb-4">Hashtags</h3>
                  <input
                    type="text"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    placeholder="Add hashtags separated by spaces"
                    className="w-full p-2 border rounded-lg"
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                      #SocialMedia
                    </span>
                    <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                      #ContentCreation
                    </span>
                    <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                      #Marketing
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSave('draft')}
                    disabled={isSaving || postsLoading}
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Save Draft
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSave('scheduled')}
                    disabled={isSaving || postsLoading || !scheduledDate || !scheduledTime}
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
                    Schedule Post
                  </Button>
                  
                  <Button
                    className="w-full"
                    onClick={() => handleSave('published')}
                    disabled={isSaving || postsLoading || isOverLimit}
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Publish Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}