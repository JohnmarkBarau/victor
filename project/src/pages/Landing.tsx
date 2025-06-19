import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { LayoutDashboard, Calendar, MessageSquare, Sparkles, ArrowRight, TrendingUp, Video, MessageCircle } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: LayoutDashboard,
      title: 'Unified Dashboard',
      description: 'Manage all your social media accounts from one central location.'
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Schedule posts at optimal times for maximum engagement.'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Content',
      description: 'Generate engaging content with our advanced AI assistant.'
    },
    {
      icon: MessageSquare,
      title: 'Engagement Management',
      description: 'Never miss a comment or message with our unified inbox.'
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Insights',
      description: 'Track performance and optimize your social media strategy.'
    },
    {
      icon: Video,
      title: 'Video Generation',
      description: 'Create professional videos with AI-powered captions.'
    },
    {
      icon: MessageCircle,
      title: 'Thread Builder',
      description: 'Design engaging Twitter threads and social carousels.'
    },
    {
      icon: Sparkles,
      title: 'Engagement Booster',
      description: 'AI-powered suggestions to increase your social media engagement.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img 
                src="/SocialSync AI Logo with Sync Arrow and Network Symbol.png" 
                alt="SocialSync AI" 
                className="w-10 h-10 object-contain"
              />
              <h1 className="text-xl font-bold text-gray-900">SocialSync AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/pricing')}
              >
                Pricing
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/auth')}
              >
                Sign in
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Try Demo
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Supercharge your</span>
              <span className="block text-blue-600">Social Media Presence</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Streamline your social media management with AI-powered content creation, smart scheduling, and unified analytics.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                size="lg"
              >
                Try Demo Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Everything you need to succeed
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Powerful tools to help you manage and grow your social media presence
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div>
                      <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600 ring-4 ring-white">
                        <Icon className="h-6 w-6" />
                      </span>
                    </div>
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}