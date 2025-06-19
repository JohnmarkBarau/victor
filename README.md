# SocialSync AI - Social Media Management Platform

A comprehensive social media management platform with AI-powered content generation, team collaboration, and advanced analytics.

## 🚀 Features

### 🤖 AI-Powered Content Creation
- **AI Content Generation**: Generate engaging posts with OpenAI integration
- **Content Suggestions**: AI-powered content ideas based on industry and goals
- **Auto-Reply System**: Automatically respond to comments with AI
- **Content Optimization**: AI-powered hashtag suggestions and performance predictions

### 📊 Advanced Analytics
- **General Analytics**: Track views, likes, comments, and shares across platforms
- **Video Analytics**: Detailed video performance metrics with retention analysis
- **Real-time Insights**: AI-powered recommendations for content improvement
- **Platform Comparison**: Compare performance across different social media platforms

### 👥 Team Collaboration
- **Team Management**: Create teams with role-based permissions (Owner, Admin, Editor, Viewer)
- **Post Assignments**: Assign content creation tasks to team members
- **Approval Workflows**: Review and approve content before publishing
- **Team Comments**: Internal collaboration on posts
- **Activity Tracking**: Monitor team activity and collaboration

### 📅 Smart Content Planning
- **AI Calendar**: Smart content suggestions based on performance data
- **Optimal Timing**: AI-recommended posting times for maximum engagement
- **Content Gap Analysis**: Identify and fill content gaps in your schedule
- **Trending Topics**: Stay updated with relevant trending topics

### 🎬 Video Generation
- **Standard Video Generator**: Create videos with custom text, animations, and styling
- **Tavus AI Integration**: Generate personalized videos with AI avatars and voices
- **Multiple Templates**: Choose from various video templates for different use cases
- **Custom Branding**: Apply your brand colors, fonts, and styling

### 🧵 Content Tools
- **Thread Builder**: Create engaging Twitter threads and social media carousels
- **Multi-Platform Editor**: Optimize content for different platforms automatically
- **Media Management**: Upload and manage images, videos, and other media
- **Hashtag Optimization**: AI-powered hashtag suggestions for better reach

### 📱 Platform Support
- Instagram
- Twitter/X
- Facebook
- LinkedIn
- YouTube
- TikTok

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for development and building
- **React Router** for navigation
- **Zustand** for state management
- **Chart.js** for analytics visualization
- **Framer Motion** for animations
- **React DnD** for drag-and-drop functionality

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** with Row Level Security (RLS)
- **Supabase Edge Functions** for serverless API endpoints

### AI Integration
- **OpenAI GPT** for content generation and optimization
- **Tavus API** for AI video generation with avatars
- **Custom AI prompts** for social media optimization

### Media & Video
- **Remotion** for video generation and rendering
- **React Dropzone** for file uploads
- **Cloudinary** integration for media storage (optional)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd socialsync-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables in `.env`:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # OpenAI API (for AI features)
   OPENAI_API_KEY=your_openai_api_key
   
   # Social Media APIs (optional)
   VITE_TWITTER_CLIENT_ID=your_twitter_client_id
   VITE_INSTAGRAM_CLIENT_ID=your_instagram_client_id
   # ... other social media API keys
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the migrations in the `supabase/migrations` folder
   - Deploy the edge functions in `supabase/functions`

5. **Start the development server**
   ```bash
   npm run dev
   ```

### API Setup Guide

For detailed API setup instructions, see:
- [API Integration Guide](API_INTEGRATION_GUIDE.md)
- [OpenAI Setup Guide](OPENAI_SETUP_GUIDE.md)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── ai/             # AI-related components
│   ├── layout/         # Layout components (Navigation, Header)
│   ├── post/           # Post creation and management
│   ├── social/         # Social media integration
│   ├── ui/             # Base UI components (Button, Card, etc.)
│   └── video/          # Video generation components
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── store/              # State management
├── lib/                # Utility functions and configurations
└── utils/              # Helper functions

supabase/
├── functions/          # Edge functions for AI and integrations
├── migrations/         # Database schema migrations
└── config.toml         # Supabase configuration
```

## 🔧 Key Features Explained

### AI Content Generation
The platform integrates with OpenAI to provide intelligent content generation:
- **Topic-based generation**: Enter a topic and get optimized content
- **Platform optimization**: Content is tailored for specific social media platforms
- **Multiple length options**: Short, medium, long, or unlimited content
- **Tone customization**: Professional, casual, friendly, or formal tones

### Team Collaboration
Comprehensive team management features:
- **Role-based Access**: Owner, Admin, Editor, and Viewer roles with specific permissions
- **Assignment System**: Assign content creation tasks to team members
- **Approval Workflows**: Multi-step approval process for content review
- **Internal Comments**: Team discussion on posts before publishing
- **Activity Feed**: Track all team activities and changes

### Analytics & Insights
Advanced analytics with AI-powered insights:
- **Performance Tracking**: Monitor views, likes, comments, and shares
- **Video Analytics**: Detailed video performance with retention curves
- **Platform Comparison**: Compare performance across different platforms
- **Growth Metrics**: Track growth trends and identify opportunities
- **AI Recommendations**: Get personalized suggestions for improvement

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level security for all user data
- **Authentication**: Secure user authentication with Supabase Auth
- **API Key Management**: Secure storage and handling of API keys
- **Input Validation**: Comprehensive validation using Zod schemas
- **Error Boundaries**: Graceful error handling throughout the application

## 🎯 Performance Optimizations

- **Code Splitting**: Lazy loading of routes and components
- **Image Optimization**: Optimized image loading and caching
- **Database Indexing**: Proper indexing for fast queries
- **Real-time Updates**: Efficient real-time subscriptions
- **Caching**: Strategic caching of API responses

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

### Manual Deployment
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [API Integration Guide](API_INTEGRATION_GUIDE.md) for setup help
- Review the [OpenAI Setup Guide](OPENAI_SETUP_GUIDE.md) for AI features
- Open an issue for bug reports or feature requests

## 🗺 Roadmap

- [ ] Advanced video editing capabilities
- [ ] More AI avatar options and customization
- [ ] Integration with additional social media platforms
- [ ] Advanced team analytics and reporting
- [ ] Mobile app development
- [ ] White-label solutions for agencies
- [ ] Advanced automation workflows
- [ ] Custom AI model training
- [ ] Enterprise SSO integration
- [ ] Advanced reporting and exports