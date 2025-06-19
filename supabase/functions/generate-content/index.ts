import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContentRequest {
  topic: string
  tone: 'Professional' | 'Casual' | 'Friendly' | 'Formal'
  length: 'Short' | 'Medium' | 'Long' | 'Unlimited'
  platforms: string[]
  contentType?: 'post' | 'thread' | 'carousel' | 'story'
  includeHashtags?: boolean
  includeEmojis?: boolean
  targetAudience?: string
  callToAction?: string
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set')
}

function getCharacterLimit(length: string, platforms: string[]): number {
  if (length === 'Unlimited') return 0
  
  // Get the most restrictive platform limit
  const limits = platforms.map(platform => {
    switch (platform.toLowerCase()) {
      case 'twitter': return 280
      case 'instagram': return 2200
      case 'facebook': return 63206
      case 'linkedin': return 3000
      case 'tiktok': return 2200
      case 'youtube': return 5000
      default: return 280
    }
  })
  
  const platformLimit = Math.min(...limits)
  
  switch (length) {
    case 'Short': return Math.min(100, platformLimit)
    case 'Medium': return Math.min(200, platformLimit)
    case 'Long': return Math.min(500, platformLimit)
    default: return platformLimit
  }
}

function buildPrompt(request: ContentRequest): string {
  const { topic, tone, length, platforms, contentType, includeHashtags, includeEmojis, targetAudience, callToAction } = request
  
  const characterLimit = getCharacterLimit(length, platforms)
  const platformList = platforms.join(', ')
  
  let prompt = `Create engaging social media content about "${topic}" with the following specifications:

Tone: ${tone}
Platforms: ${platformList}
Content Type: ${contentType || 'post'}
${characterLimit > 0 ? `Character Limit: ${characterLimit} characters` : 'No character limit'}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}

Requirements:
- Write in a ${tone.toLowerCase()} tone
- Make it engaging and shareable
- Optimize for ${platformList}
${includeHashtags ? '- Include relevant hashtags' : '- Do not include hashtags'}
${includeEmojis ? '- Include appropriate emojis' : '- Do not include emojis'}
${callToAction ? `- Include this call-to-action: ${callToAction}` : '- Include a natural call-to-action'}

Content Guidelines:
- Hook the reader in the first line
- Provide value or entertainment
- Use clear, concise language
- Make it actionable when appropriate
- Ensure it's authentic and relatable

${contentType === 'thread' ? 'Format as a Twitter thread with numbered points (1/n format).' : ''}
${contentType === 'carousel' ? 'Create content suitable for a multi-slide carousel post.' : ''}
${contentType === 'story' ? 'Create content optimized for Stories format (short, visual, engaging).' : ''}

Generate the content now:`

  return prompt
}

async function generateWithOpenAI(prompt: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert social media content creator and copywriter. You create engaging, platform-optimized content that drives engagement and achieves business goals. Always follow the specified requirements exactly.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const request: ContentRequest = await req.json()

    if (!request.topic || !request.tone || !request.length || !request.platforms?.length) {
      throw new Error('Missing required fields: topic, tone, length, platforms')
    }

    const prompt = buildPrompt(request)
    const content = await generateWithOpenAI(prompt)

    return new Response(
      JSON.stringify({
        content: content.trim(),
        metadata: {
          topic: request.topic,
          tone: request.tone,
          length: request.length,
          platforms: request.platforms,
          characterCount: content.trim().length,
          generatedAt: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Content generation error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        fallbackContent: "We're experiencing high demand right now. Please try again in a moment, or create your content manually."
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})