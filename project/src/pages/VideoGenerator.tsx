import React, { useState, useCallback } from 'react';
import { Player } from '@remotion/player';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { FileUpload } from '../components/ui/FileUpload';
import { TavusVideoGenerator } from '../components/video/TavusVideoGenerator';
import {
  Video,
  Image as ImageIcon,
  Type,
  Palette,
  Sparkles,
  Download,
  Share2,
  Loader2,
  Settings,
  Play,
  Pause,
  RefreshCw,
  AlertCircle,
  Check,
  Zap,
  Bot
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  duration: number;
}

interface VideoConfig {
  template: string;
  text: string;
  background: string;
  font: string;
  textColor: string;
  animation: string;
  media?: string;
}

export default function VideoGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [videoConfig, setVideoConfig] = useState<VideoConfig>({
    template: 'social-post',
    text: '',
    background: '#ffffff',
    font: 'Inter',
    textColor: '#000000',
    animation: 'fade',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeVideoType, setActiveVideoType] = useState<'standard' | 'tavus'>('standard');

  const templates: Template[] = [
    {
      id: 'social-post',
      name: 'Social Media Post',
      description: 'Perfect for Instagram and TikTok',
      thumbnail: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg',
      duration: 15,
    },
    {
      id: 'quote',
      name: 'Quote Video',
      description: 'Animated text with beautiful backgrounds',
      thumbnail: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg',
      duration: 10,
    },
    {
      id: 'product',
      name: 'Product Showcase',
      description: 'Highlight your products with style',
      thumbnail: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg',
      duration: 20,
    },
  ];

  const animations = [
    { id: 'fade', name: 'Fade In' },
    { id: 'slide', name: 'Slide Up' },
    { id: 'bounce', name: 'Bounce' },
    { id: 'typewriter', name: 'Typewriter' },
  ];

  const fonts = [
    'Inter',
    'Roboto',
    'Montserrat',
    'Playfair Display',
    'Open Sans',
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

  const handleMediaUpload = useCallback((urls: string[]) => {
    if (urls.length > 0) {
      setVideoConfig(prev => ({ ...prev, media: urls[0] }));
    }
  }, []);

  const generateAICaption = async () => {
    if (!aiTopic.trim()) {
      showMessage('Please enter a topic for AI caption generation', true);
      return;
    }

    setIsGeneratingCaption(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-content', {
        body: {
          topic: aiTopic,
          tone: 'Professional',
          length: 'Short',
          platforms: ['instagram', 'tiktok']
        }
      });

      if (functionError) throw functionError;
      if (!data?.content) throw new Error('No content generated');

      setVideoConfig(prev => ({
        ...prev,
        text: data.content
      }));

      showMessage('AI caption generated successfully!');
    } catch (err: any) {
      showMessage(err.message || 'Failed to generate caption', true);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Simulate video generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      setGeneratedVideoUrl('https://example.com/generated-video.mp4');
      showMessage('Video generated successfully!');
    } catch (error) {
      showMessage('Error generating video', true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Video Generator</h1>
          <p className="text-gray-600 mt-1">
            Create professional videos with AI-powered captions and avatars
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={activeVideoType === 'standard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveVideoType('standard')}
              className="flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              Standard Video
            </Button>
            <Button
              variant={activeVideoType === 'tavus' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveVideoType('tavus')}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Tavus AI Video
            </Button>
          </div>
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

      {/* Tavus AI Video Generator */}
      {activeVideoType === 'tavus' && <TavusVideoGenerator />}

      {/* Standard Video Generator */}
      {activeVideoType === 'standard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Preview</h2>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setVideoConfig({
                        template: 'social-post',
                        text: '',
                        background: '#ffffff',
                        font: 'Inter',
                        textColor: '#000000',
                        animation: 'fade',
                      });
                      setGeneratedVideoUrl(null);
                      setAiTopic('');
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !videoConfig.text.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
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
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {generatedVideoUrl ? (
                  <div className="relative">
                    <video
                      src={generatedVideoUrl}
                      className="w-full h-full"
                      controls
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <Button size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-4 rounded-full bg-white shadow-lg hover:bg-gray-50 mb-4"
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6 text-gray-800" />
                        ) : (
                          <Play className="w-6 h-6 text-gray-800" />
                        )}
                      </button>
                      {!videoConfig.text && (
                        <p className="text-gray-500 text-sm">Add content to see preview</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
              <Tabs defaultValue="content">
                <TabsList className="w-full border-b">
                  <TabsTrigger value="content" className="flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger value="style" className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Style
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Caption
                      </label>
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={aiTopic}
                            onChange={(e) => setAiTopic(e.target.value)}
                            placeholder="Enter topic for AI generation..."
                            className="flex-1 p-3 border rounded-md"
                          />
                          <Button
                            variant="outline"
                            onClick={generateAICaption}
                            disabled={isGeneratingCaption || !aiTopic.trim()}
                            className="flex-shrink-0"
                          >
                            {isGeneratingCaption ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate
                              </>
                            )}
                          </Button>
                        </div>
                        <textarea
                          value={videoConfig.text}
                          onChange={(e) => setVideoConfig(prev => ({ ...prev, text: e.target.value }))}
                          placeholder="Enter your caption or generate with AI above..."
                          className="w-full min-h-[100px] p-3 border rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Media
                      </label>
                      <FileUpload
                        onUpload={handleMediaUpload}
                        maxFiles={1}
                        acceptedFileTypes={['image/*', 'video/*']}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="style" className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Font
                      </label>
                      <select
                        value={videoConfig.font}
                        onChange={(e) => setVideoConfig(prev => ({ ...prev, font: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                      >
                        {fonts.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Animation
                      </label>
                      <select
                        value={videoConfig.animation}
                        onChange={(e) => setVideoConfig(prev => ({ ...prev, animation: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                      >
                        {animations.map(animation => (
                          <option key={animation.id} value={animation.id}>
                            {animation.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text Color
                      </label>
                      <input
                        type="color"
                        value={videoConfig.textColor}
                        onChange={(e) => setVideoConfig(prev => ({ ...prev, textColor: e.target.value }))}
                        className="w-full h-10 rounded-md cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Background Color
                      </label>
                      <input
                        type="color"
                        value={videoConfig.background}
                        onChange={(e) => setVideoConfig(prev => ({ ...prev, background: e.target.value }))}
                        className="w-full h-10 rounded-md cursor-pointer"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video Duration (seconds)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="60"
                        className="w-full p-2 border rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Output Quality
                      </label>
                      <select className="w-full p-2 border rounded-md">
                        <option value="720">720p</option>
                        <option value="1080">1080p</option>
                        <option value="2k">2K</option>
                        <option value="4k">4K</option>
                      </select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-6">Templates</h2>
              <div className="space-y-4">
                {templates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    className={`border rounded-lg overflow-hidden cursor-pointer transition-colors ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <Video className="w-4 h-4" />
                        {template.duration}s
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Tips</h2>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  • Keep captions short and engaging
                </p>
                <p className="text-sm text-gray-600">
                  • Use contrasting colors for better readability
                </p>
                <p className="text-sm text-gray-600">
                  • Choose animations that match your content's tone
                </p>
                <p className="text-sm text-gray-600">
                  • Test different templates for optimal engagement
                </p>
                <p className="text-sm text-gray-600">
                  • Try Tavus AI for personalized avatar videos
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}