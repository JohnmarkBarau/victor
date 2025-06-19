import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Twitter, 
  Instagram, 
  Linkedin, 
  Image as ImageIcon, 
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Sparkles,
  Calendar,
  Save,
  Eye,
  MessageSquare,
  Loader2,
  AlertCircle,
  Check
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';

interface ThreadPost {
  id: string;
  content: string;
  images: string[];
  characterCount: number;
}

interface CarouselSlide {
  id: string;
  content: string;
  image: string;
  layout: 'image-top' | 'image-bottom' | 'image-left' | 'image-right' | 'full-image';
  background: string;
}

export default function ThreadBuilder() {
  const [mode, setMode] = useState<'thread' | 'carousel'>('thread');
  const [threadPosts, setThreadPosts] = useState<ThreadPost[]>([
    { id: '1', content: '', images: [], characterCount: 0 }
  ]);
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([
    { id: '1', content: '', image: '', layout: 'image-top', background: '#ffffff' }
  ]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = mode === 'thread' ? [...threadPosts] : [...carouselSlides];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    if (mode === 'thread') {
      setThreadPosts(items as ThreadPost[]);
    } else {
      setCarouselSlides(items as CarouselSlide[]);
    }
  };

  const addNewItem = () => {
    if (mode === 'thread') {
      setThreadPosts([
        ...threadPosts,
        { id: String(threadPosts.length + 1), content: '', images: [], characterCount: 0 }
      ]);
    } else {
      setCarouselSlides([
        ...carouselSlides,
        { id: String(carouselSlides.length + 1), content: '', image: '', layout: 'image-top', background: '#ffffff' }
      ]);
    }
  };

  const removeItem = (index: number) => {
    if (mode === 'thread') {
      const newPosts = [...threadPosts];
      newPosts.splice(index, 1);
      setThreadPosts(newPosts);
    } else {
      const newSlides = [...carouselSlides];
      newSlides.splice(index, 1);
      setCarouselSlides(newSlides);
    }
  };

  const generateAIContent = async () => {
    if (!aiTopic.trim()) {
      showMessage('Please enter a topic for AI content generation', true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-content', {
        body: {
          topic: aiTopic,
          tone: 'Professional',
          length: 'Medium',
          platforms: mode === 'thread' ? ['twitter'] : ['instagram']
        }
      });

      if (functionError) throw functionError;
      if (!data?.content) throw new Error('No content generated');

      // Split content into multiple parts for thread/carousel
      const contentParts = data.content.split('\n\n').filter(part => part.trim());
      
      if (mode === 'thread') {
        const newThreadPosts = contentParts.map((content, index) => ({
          id: String(index + 1),
          content: content.trim(),
          images: [],
          characterCount: content.trim().length
        }));
        setThreadPosts(newThreadPosts.length > 0 ? newThreadPosts : [{ id: '1', content: data.content, images: [], characterCount: data.content.length }]);
      } else {
        const newSlides = contentParts.map((content, index) => ({
          id: String(index + 1),
          content: content.trim(),
          image: '',
          layout: 'image-top' as const,
          background: '#ffffff'
        }));
        setCarouselSlides(newSlides.length > 0 ? newSlides : [{ id: '1', content: data.content, image: '', layout: 'image-top', background: '#ffffff' }]);
      }

      showMessage('AI content generated successfully!');
    } catch (err: any) {
      showMessage(err.message || 'Failed to generate content', true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContentChange = (index: number, content: string) => {
    if (mode === 'thread') {
      const newPosts = [...threadPosts];
      newPosts[index] = {
        ...newPosts[index],
        content,
        characterCount: content.length
      };
      setThreadPosts(newPosts);
    } else {
      const newSlides = [...carouselSlides];
      newSlides[index] = {
        ...newSlides[index],
        content
      };
      setCarouselSlides(newSlides);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {mode === 'thread' ? 'Thread Builder' : 'Carousel Builder'}
          </h1>
          <p className="text-gray-600 mt-2">
            Create engaging {mode === 'thread' ? 'Twitter threads' : 'social media carousels'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={mode === 'thread' ? 'default' : 'outline'}
            onClick={() => setMode('thread')}
            className="flex items-center gap-2"
          >
            <Twitter className="w-4 h-4" />
            Thread
          </Button>
          <Button
            variant={mode === 'carousel' ? 'default' : 'outline'}
            onClick={() => setMode('carousel')}
            className="flex items-center gap-2"
          >
            <Instagram className="w-4 h-4" />
            Carousel
          </Button>
        </div>
      </div>

      {(error || success) && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {error ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          <p>{error || success}</p>
        </div>
      )}

      <div className="flex gap-8">
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="Enter topic for AI generation..."
                    className="px-3 py-2 border rounded-lg"
                  />
                  <Button
                    onClick={generateAIContent}
                    disabled={isGenerating || !aiTopic.trim()}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {isPreviewMode ? 'Edit' : 'Preview'}
                </Button>
                <Button className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Draft
                </Button>
              </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="items">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {(mode === 'thread' ? threadPosts : carouselSlides).map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="border rounded-lg p-4 bg-white"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div
                                {...provided.dragHandleProps}
                                className="flex items-center gap-2 text-gray-500"
                              >
                                <MoveUp className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  {mode === 'thread' ? `Tweet ${index + 1}` : `Slide ${index + 1}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <textarea
                                value={mode === 'thread' ? threadPosts[index].content : carouselSlides[index].content}
                                onChange={(e) => handleContentChange(index, e.target.value)}
                                placeholder={mode === 'thread' ? "What's happening?" : "Add your content..."}
                                className="w-full min-h-[100px] p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />

                              {mode === 'thread' && (
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                  <span>{threadPosts[index].characterCount}/280 characters</span>
                                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" />
                                    Add Image
                                  </Button>
                                </div>
                              )}

                              {mode === 'carousel' && (
                                <div className="space-y-4">
                                  <div className="flex items-center gap-4">
                                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                                      <ImageIcon className="w-4 h-4" />
                                      Add Image
                                    </Button>
                                    <select
                                      value={carouselSlides[index].layout}
                                      onChange={(e) => {
                                        const newSlides = [...carouselSlides];
                                        newSlides[index] = {
                                          ...newSlides[index],
                                          layout: e.target.value as CarouselSlide['layout']
                                        };
                                        setCarouselSlides(newSlides);
                                      }}
                                      className="p-2 border rounded-md"
                                    >
                                      <option value="image-top">Image Top</option>
                                      <option value="image-bottom">Image Bottom</option>
                                      <option value="image-left">Image Left</option>
                                      <option value="image-right">Image Right</option>
                                      <option value="full-image">Full Image</option>
                                    </select>
                                    <input
                                      type="color"
                                      value={carouselSlides[index].background}
                                      onChange={(e) => {
                                        const newSlides = [...carouselSlides];
                                        newSlides[index] = {
                                          ...newSlides[index],
                                          background: e.target.value
                                        };
                                        setCarouselSlides(newSlides);
                                      }}
                                      className="w-8 h-8 rounded-md"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <Button
              onClick={addNewItem}
              variant="outline"
              className="mt-4 w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add {mode === 'thread' ? 'Tweet' : 'Slide'}
            </Button>
          </div>
        </div>

        {isPreviewMode && (
          <div className="w-96">
            <div className="bg-white rounded-lg shadow-sm p-8 sticky top-8">
              <h2 className="text-lg font-semibold mb-6">Preview</h2>
              <div className="space-y-6">
                {(mode === 'thread' ? threadPosts : carouselSlides).map((item, index) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4"
                    style={mode === 'carousel' ? { background: (item as CarouselSlide).background } : {}}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                      <div>
                        <p className="font-semibold">Your Name</p>
                        <p className="text-sm text-gray-500">@username</p>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap">{item.content}</p>
                    {mode === 'thread' && index < threadPosts.length - 1 && (
                      <div className="mt-4 border-l-2 border-gray-300 h-8 ml-5"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}