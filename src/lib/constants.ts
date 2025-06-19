export const APP_CONFIG = {
  name: 'SocialSync AI',
  description: 'AI-powered social media management platform',
  version: '1.0.0',
  author: 'SocialSync Team',
  website: 'https://socialsync.ai',
  support: 'support@socialsync.ai'
};

export const PLATFORM_LIMITS = {
  twitter: { maxLength: 280, maxImages: 4, maxVideos: 1 },
  instagram: { maxLength: 2200, maxImages: 10, maxVideos: 1 },
  facebook: { maxLength: 63206, maxImages: 10, maxVideos: 1 },
  linkedin: { maxLength: 3000, maxImages: 9, maxVideos: 1 },
  tiktok: { maxLength: 2200, maxImages: 0, maxVideos: 1 },
  youtube: { maxLength: 5000, maxImages: 1, maxVideos: 1 }
};

export const SUPPORTED_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', color: '#E4405F' },
  { id: 'twitter', name: 'Twitter', color: '#1DA1F2' },
  { id: 'facebook', name: 'Facebook', color: '#4267B2' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0077B5' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000' },
  { id: 'tiktok', name: 'TikTok', color: '#000000' }
];

export const AI_TONES = [
  'Professional',
  'Casual', 
  'Friendly',
  'Formal',
  'Humorous',
  'Inspirational'
];

export const CONTENT_LENGTHS = [
  { id: 'short', name: 'Short', description: '50-100 characters' },
  { id: 'medium', name: 'Medium', description: '100-200 characters' },
  { id: 'long', name: 'Long', description: '200-500 characters' },
  { id: 'unlimited', name: 'Unlimited', description: 'No character limit' }
];