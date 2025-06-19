# API Integration Guide for SocialSync AI

## Required APIs and Setup Instructions

### 1. Supabase (Database & Authentication) ✅ Already Configured
Your Supabase setup is already working. You have:
- Database tables for posts, analytics, comments, etc.
- Authentication system
- Row Level Security (RLS) policies

**Status**: ✅ Working

### 2. OpenAI API (AI Content Generation)
**Purpose**: Generate AI-powered content, replies, and suggestions

**Setup Steps**:
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get your API key
3. Add to your environment variables:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

**Current Integration**: Your edge functions are already set up to use OpenAI
- `generate-content` - Creates AI content
- `generate-reply` - Auto-replies to comments
- `generate-content-suggestions` - AI content recommendations

### 3. Social Media Platform APIs

#### Instagram Basic Display API
**Purpose**: Read Instagram posts, comments, and basic analytics

**Setup**:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Instagram Basic Display product
4. Get your App ID and App Secret
5. Add to environment:

```env
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
```

#### Twitter API v2
**Purpose**: Post tweets, read mentions, get analytics

**Setup**:
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new project and app
3. Get your Bearer Token and API keys
4. Add to environment:

```env
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret
```

#### LinkedIn API
**Purpose**: Post to LinkedIn, get company page analytics

**Setup**:
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Request access to required products
4. Add to environment:

```env
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

#### Facebook Graph API
**Purpose**: Post to Facebook pages, get insights

**Setup**:
1. Use the same Facebook Developers account from Instagram
2. Add Facebook Login and Pages API products
3. Add to environment:

```env
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

#### YouTube Data API v3
**Purpose**: Upload videos, get channel analytics

**Setup**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable YouTube Data API v3
4. Create credentials (OAuth 2.0)
5. Add to environment:

```env
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
```

### 4. Media Storage APIs

#### Cloudinary (Recommended for media)
**Purpose**: Store and optimize images/videos

**Setup**:
1. Go to [Cloudinary](https://cloudinary.com/)
2. Create a free account
3. Get your cloud name, API key, and secret
4. Add to environment:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 5. Analytics APIs (Optional but Recommended)

#### Google Analytics 4
**Purpose**: Track website traffic and user behavior

**Setup**:
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property
3. Get your Measurement ID
4. Add to environment:

```env
GA4_MEASUREMENT_ID=your_ga4_measurement_id
```

## Environment Variables Setup

Create a `.env` file in your project root with all the API keys:

```env
# Supabase (Already configured)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Social Media APIs
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret

# Media Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Analytics (Optional)
GA4_MEASUREMENT_ID=your_ga4_measurement_id
```

## Priority Order for Implementation

### Phase 1 (Essential - Start Here)
1. **OpenAI API** - For AI content generation
2. **Twitter API** - Easiest to implement and test
3. **Instagram Basic Display** - For reading data

### Phase 2 (Core Features)
4. **Facebook Graph API** - For posting and analytics
5. **LinkedIn API** - For professional content
6. **Cloudinary** - For media management

### Phase 3 (Advanced Features)
7. **YouTube API** - For video content
8. **Google Analytics** - For detailed tracking

## Testing Your APIs

Once you have the API keys:

1. **Test OpenAI**: Go to Create Post → AI Assist → Generate Content
2. **Test Social Media**: Go to Settings → Connected Accounts → Connect platforms
3. **Test Analytics**: Check Dashboard and Analytics pages for data

## Cost Considerations

- **OpenAI**: Pay per token (~$0.002 per 1K tokens)
- **Twitter API**: Free tier available (1,500 tweets/month)
- **Instagram**: Free for basic features
- **Facebook/LinkedIn**: Free for basic posting
- **YouTube**: Free with quotas
- **Cloudinary**: Free tier (25 credits/month)

## Next Steps

1. Start with OpenAI API key for immediate AI features
2. Add Twitter API for your first social media connection
3. Test the posting and analytics features
4. Gradually add other platforms based on your needs

Would you like me to help you implement any specific API integration first?