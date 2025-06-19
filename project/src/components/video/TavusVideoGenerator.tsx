import React, { useState, useCallback } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  Video,
  User,
  Mic,
  Camera,
  Upload,
  Download,
  Share2,
  Play,
  Pause,
  Loader2,
  AlertCircle,
  Check,
  Settings,
  Sparkles,
  Eye,
  Clock,
  FileVideo,
  Zap
} from 'lucide-react';

interface TavusTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  duration: string;
  category: 'business' | 'social' | 'educational' | 'marketing';
  features: string[];
}

interface TavusVideoConfig {
  templateId: string;
  script: string;
  voiceId: string;
  avatarId: string;
  background: string;
  language: string;
  speed: number;
  tone: 'professional' | 'casual' | 'friendly' | 'energetic';
}

interface TavusVideo {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  url?: string;
  thumbnail?: string;
  duration?: number;
  createdAt: string;
}

export function TavusVideoGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [videoConfig, setVideoConfig] = useState<TavusVideoConfig>({
    templateId: '',
    script: '',
    voiceId: 'default',
    avatarId: 'default',
    background: 'office',
    language: 'en',
    speed: 1.0,
    tone: 'professional'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<TavusVideo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'script' | 'avatar' | 'settings'>('templates');

  const templates: TavusTemplate[] = [
    {
      id: 'business-intro',
      name: 'Business Introduction',
      description: 'Professional introduction video for business use',
      thumbnail: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg',
      duration: '30-60s',
      category: 'business',
      features: ['Professional avatar', 'Clean background', 'Corporate tone']
    },
    {
      id: 'product-demo',
      name: 'Product Demo',
      description: 'Showcase your product with engaging presentation',
      thumbnail: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
      duration: '60-90s',
      category: 'marketing',
      features: ['Product showcase', 'Call-to-action', 'Engaging visuals']
    },
    {
      id: 'social-announcement',
      name: 'Social Media Announcement',
      description: 'Perfect for social media announcements and updates',
      thumbnail: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg',
      duration: '15-30s',
      category: 'social',
      features: ['Social-friendly format', 'Casual tone', 'Eye-catching']
    },
    {
      id: 'educational-content',
      name: 'Educational Content',
      description: 'Create informative and educational videos',
      thumbnail: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg',
      duration: '90-120s',
      category: 'educational',
      features: ['Clear explanation', 'Visual aids', 'Structured content']
    }
  ];

  const avatars = [
    { id: 'default', name: 'Professional Male', description: 'Business professional appearance' },
    { id: 'female-casual', name: 'Casual Female', description: 'Friendly and approachable' },
    { id: 'male-creative', name: 'Creative Male', description: 'Modern and artistic style' },
    { id: 'female-executive', name: 'Executive Female', description: 'Corporate leadership style' }
  ];

  const voices = [
    { id: 'default', name: 'Professional Voice', description: 'Clear and authoritative' },
    { id: 'friendly', name: 'Friendly Voice', description: 'Warm and approachable' },
    { id: 'energetic', name: 'Energetic Voice', description: 'Dynamic and engaging' },
    { id: 'calm', name: 'Calm Voice', description: 'Soothing and trustworthy' }
  ];

  const backgrounds = [
    { id: 'office', name: 'Modern Office', description: 'Professional office setting' },
    { id: 'studio', name: 'Clean Studio', description: 'Minimalist studio background' },
    { id: 'home', name: 'Home Office', description: 'Comfortable home environment' },
    { id: 'outdoor', name: 'Outdoor Setting', description: 'Natural outdoor background' }
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

  const generateAIScript = async () => {
    try {
      // This would integrate with your existing AI content generation
      const template = templates.find(t => t.id === selectedTemplate);
      const sampleScript = `Hello! I'm excited to share something amazing with you today. ${template?.description || 'This video'} will help you understand our innovative approach and how it can benefit you. Let's dive in and explore the possibilities together!`;
      
      setVideoConfig(prev => ({ ...prev, script: sampleScript }));
      showMessage('AI script generated successfully!');
    } catch (err) {
      showMessage('Failed to generate script', true);
    }
  };

  const generateTavusVideo = async () => {
    if (!videoConfig.script.trim()) {
      showMessage('Please add a script for your video', true);
      return;
    }

    if (!selectedTemplate) {
      showMessage('Please select a template', true);
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate Tavus API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newVideo: TavusVideo = {
        id: `tavus_${Date.now()}`,
        status: 'completed',
        url: 'https://example.com/tavus-video.mp4',
        thumbnail: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg',
        duration: 45,
        createdAt: new Date().toISOString()
      };

      setGeneratedVideos(prev => [newVideo, ...prev]);
      showMessage('Tavus video generated successfully!');
    } catch (err) {
      showMessage('Failed to generate video', true);
    } finally {
      setIsGenerating(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business': return 'bg-blue-100 text-blue-800';
      case 'social': return 'bg-pink-100 text-pink-800';
      case 'educational': return 'bg-green-100 text-green-800';
      case 'marketing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            Tavus AI Video Generator
          </h2>
          <p className="text-gray-600 mt-1">
            Create personalized AI videos with realistic avatars and voices
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={generateTavusVideo}
            disabled={isGenerating || !videoConfig.script.trim() || !selectedTemplate}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Video className="w-4 h-4 mr-2" />
                Generate Video
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {(error || success) && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {error ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          <p>{error || success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Video Configuration</CardTitle>
                <div className="flex gap-1">
                  {(['templates', 'script', 'avatar', 'settings'] as const).map((tab) => (
                    <Button
                      key={tab}
                      variant={activeTab === tab ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab(tab)}
                      className="capitalize"
                    >
                      {tab}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Templates Tab */}
              {activeTab === 'templates' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Choose a Template</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                          selectedTemplate === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:border-gray-300'
                        }`}
                        onClick={() => {
                          setSelectedTemplate(template.id);
                          setVideoConfig(prev => ({ ...prev, templateId: template.id }));
                        }}
                      >
                        <img
                          src={template.thumbnail}
                          alt={template.name}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{template.name}</h4>
                            <Badge className={getCategoryColor(template.category)}>
                              {template.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Clock className="w-4 h-4" />
                            {template.duration}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {template.features.map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Script Tab */}
              {activeTab === 'script' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Video Script</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateAIScript}
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate AI Script
                    </Button>
                  </div>
                  <textarea
                    value={videoConfig.script}
                    onChange={(e) => setVideoConfig(prev => ({ ...prev, script: e.target.value }))}
                    placeholder="Enter your video script here. This will be spoken by your chosen avatar..."
                    className="w-full min-h-[200px] p-4 border rounded-lg resize-none"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{videoConfig.script.length} characters</span>
                    <span>Estimated duration: {Math.ceil(videoConfig.script.length / 10)} seconds</span>
                  </div>
                </div>
              )}

              {/* Avatar Tab */}
              {activeTab === 'avatar' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Choose Avatar</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {avatars.map((avatar) => (
                        <div
                          key={avatar.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            videoConfig.avatarId === avatar.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'hover:border-gray-300'
                          }`}
                          onClick={() => setVideoConfig(prev => ({ ...prev, avatarId: avatar.id }))}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{avatar.name}</h4>
                              <p className="text-sm text-gray-600">{avatar.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Choose Voice</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {voices.map((voice) => (
                        <div
                          key={voice.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            videoConfig.voiceId === voice.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'hover:border-gray-300'
                          }`}
                          onClick={() => setVideoConfig(prev => ({ ...prev, voiceId: voice.id }))}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <Mic className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{voice.name}</h4>
                              <p className="text-sm text-gray-600">{voice.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Background Setting</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {backgrounds.map((bg) => (
                        <div
                          key={bg.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            videoConfig.background === bg.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'hover:border-gray-300'
                          }`}
                          onClick={() => setVideoConfig(prev => ({ ...prev, background: bg.id }))}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Camera className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{bg.name}</h4>
                              <p className="text-sm text-gray-600">{bg.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Speech Speed
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={videoConfig.speed}
                        onChange={(e) => setVideoConfig(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>Slow (0.5x)</span>
                        <span>{videoConfig.speed}x</span>
                        <span>Fast (2.0x)</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tone
                      </label>
                      <select
                        value={videoConfig.tone}
                        onChange={(e) => setVideoConfig(prev => ({ ...prev, tone: e.target.value as any }))}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="friendly">Friendly</option>
                        <option value="energetic">Energetic</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Generated Videos Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileVideo className="w-5 h-5" />
                Generated Videos
              </CardTitle>
              <CardDescription>
                Your Tavus AI generated videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedVideos.length === 0 ? (
                <div className="text-center py-8">
                  <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Videos Yet</h3>
                  <p className="text-gray-500 text-sm">
                    Configure your video settings and generate your first Tavus AI video
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedVideos.map((video) => (
                    <div key={video.id} className="border rounded-lg overflow-hidden">
                      {video.thumbnail && (
                        <img
                          src={video.thumbnail}
                          alt="Video thumbnail"
                          className="w-full h-32 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            variant={video.status === 'completed' ? 'success' : 
                                   video.status === 'processing' ? 'warning' : 'destructive'}
                          >
                            {video.status}
                          </Badge>
                          {video.duration && (
                            <span className="text-sm text-gray-500">
                              {video.duration}s
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Created {new Date(video.createdAt).toLocaleDateString()}
                        </p>
                        {video.status === 'completed' && (
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1">
                              <Play className="w-4 h-4 mr-1" />
                              Play
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Tavus Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• Keep scripts conversational and natural</p>
                <p>• Choose avatars that match your brand tone</p>
                <p>• Test different voice speeds for optimal delivery</p>
                <p>• Use appropriate backgrounds for your content type</p>
                <p>• Videos typically take 2-5 minutes to generate</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}