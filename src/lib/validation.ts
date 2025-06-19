import { z } from 'zod';

export const postSchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
  platforms: z.array(z.string()).min(1, 'At least one platform is required'),
  scheduled_time: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  media_urls: z.array(z.string().url()).optional(),
  status: z.enum(['draft', 'scheduled', 'published']).default('draft')
});

export const teamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional()
});

export const inviteSchema = z.object({
  email: z.string().email('Valid email is required'),
  role: z.enum(['admin', 'editor', 'viewer'])
});

export const aiContentSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  tone: z.enum(['Professional', 'Casual', 'Friendly', 'Formal']),
  length: z.enum(['Short', 'Medium', 'Long', 'Unlimited']),
  platforms: z.array(z.string()).min(1, 'At least one platform is required')
});

export function validatePost(data: unknown) {
  return postSchema.parse(data);
}

export function validateTeam(data: unknown) {
  return teamSchema.parse(data);
}

export function validateInvite(data: unknown) {
  return inviteSchema.parse(data);
}

export function validateAIContent(data: unknown) {
  return aiContentSchema.parse(data);
}