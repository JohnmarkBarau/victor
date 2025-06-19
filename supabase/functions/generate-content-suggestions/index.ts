import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SuggestionsRequest {
  industry?: string
  targetAudience?: string
  contentGoals?: string[]
  platforms?: string[]
  recentTopics?: string[]
  brandVoice?: string
  count?: number
}

interface ContentSuggestion {
  title: string
  description: string
  contentType: 'post' | 'thread' | 'carousel' | 'video' | 'story'
  platforms: string[]
  estimatedEngagement: 'Low' | 'Medium' | 'High'
  difficulty: 'Easy' | 'Medium' | 'Hard'
  timeToCreate: string
  hashtags: string[]
  tips: string[]
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

function buildSuggestionsPrompt(request: SuggestionsRequest): string {
  const { 
    industry = 'general business', 
    targetAudience = 'general audience', 
    contentGoals = ['engagement'], 
    platforms = ['instagram', 'twitter'], 
    recentTopics = [],
    brandVoice = 'professional and friendly',
    count = 5
  } = request
  
  return `Generate ${count} creative and engaging social media content suggestions for:

Industry: ${industry}
Target Audience: ${targetAudience}
Content Goals: ${contentGoals.join(', ')}
Platforms: ${platforms.join(', ')}
Brand Voice: ${brandVoice}
${recentTopics.length > 0 ? `Recent Topics to Avoid: ${recentTopics.join(', ')}` : ''}

For each suggestion, provide:
1. A catchy title
2. A brief description (2-3 sentences)
3. Content type (post, thread, carousel, video, story)
4. Best platforms for this content
5. Estimated engagement potential (Low/Medium/High)
6. Difficulty level (Easy/Medium/Hard)
7. Estimated time to create
8. 3-5 relevant hashtags
9. 2-3 practical tips for execution

Focus on:
- Current trends and timely topics
- Content that drives ${contentGoals.join(' and ')}
- Platform-specific optimization
- Actionable and valuable content ideas
- Mix of content types for variety

Format as a JSON array with the following structure for each suggestion:
{
  "title": "string",
  "description": "string", 
  "contentType": "post|thread|carousel|video|story",
  "platforms": ["platform1", "platform2"],
  "estimatedEngagement": "Low|Medium|High",
  "difficulty": "Easy|Medium|Hard",
  "timeToCreate": "string",
  "hashtags": ["hashtag1", "hashtag2"],
  "tips": ["tip1", "tip2"]
}

Generate creative, diverse suggestions that would perform well for this audience:`
}

async function generateSuggestionsWithOpenAI(prompt: string): Promise<ContentSuggestion[]> {
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
          content: 'You are a creative social media strategist who generates innovative, engaging content ideas that drive results. You understand current trends, platform algorithms, and audience psychology. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.9,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content || ''
  
  try {
    return JSON.parse(content)
  } catch (parseError) {
    console.error('Failed to parse OpenAI response as JSON:', content)
    throw new Error('Failed to generate valid suggestions')
  }
}

// Fallback suggestions if AI fails
function getFallbackSuggestions(request: SuggestionsRequest): ContentSuggestion[] {
  const { platforms = ['instagram', 'twitter'], count = 5 } = request
  
  const fallbacks: ContentSuggestion[] = [
    {
      title: "Behind-the-Scenes Content",
      description: "Share the process behind your work or product creation. People love seeing the human side of brands.",
      contentType: "story",
      platforms: platforms.slice(0, 2),
      estimatedEngagement: "High",
      difficulty: "Easy",
      timeToCreate: "15 minutes",
      hashtags: ["#BehindTheScenes", "#Process", "#Authentic"],
      tips: ["Use natural lighting", "Show real people at work", "Add captions explaining the process"]
    },
    {
      title: "User-Generated Content Showcase",
      description: "Feature your customers using your product or service. This builds community and provides social proof.",
      contentType: "post",
      platforms: platforms,
      estimatedEngagement: "High",
      difficulty: "Medium",
      timeToCreate: "30 minutes",
      hashtags: ["#CustomerSpotlight", "#Community", "#UserGenerated"],
      tips: ["Always ask permission first", "Tag the original creator", "Add your own commentary"]
    },
    {
      title: "Quick Tips Thread",
      description: "Share actionable tips related to your industry in an easy-to-digest thread format.",
      contentType: "thread",
      platforms: ["twitter", "linkedin"],
      estimatedEngagement: "Medium",
      difficulty: "Easy",
      timeToCreate: "20 minutes",
      hashtags: ["#Tips", "#QuickWins", "#Productivity"],
      tips: ["Keep each tip to one sentence", "Number your tips", "End with a call-to-action"]
    },
    {
      title: "Industry Trend Analysis",
      description: "Share your perspective on current trends in your industry. Position yourself as a thought leader.",
      contentType: "carousel",
      platforms: ["linkedin", "instagram"],
      estimatedEngagement: "Medium",
      difficulty: "Hard",
      timeToCreate: "45 minutes",
      hashtags: ["#Trends", "#Industry", "#Analysis"],
      tips: ["Use data to support your points", "Include visual charts", "Make predictions"]
    },
    {
      title: "Day in the Life",
      description: "Show what a typical day looks like in your role or industry. Great for building personal brand.",
      contentType: "story",
      platforms: ["instagram", "facebook"],
      estimatedEngagement: "High",
      difficulty: "Easy",
      timeToCreate: "Throughout the day",
      hashtags: ["#DayInTheLife", "#Routine", "#WorkLife"],
      tips: ["Plan key moments to capture", "Use story highlights", "Add polls and questions"]
    }
  ]
  
  return fallbacks.slice(0, count)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const request: SuggestionsRequest = await req.json()
    
    let suggestions: ContentSuggestion[]
    
    try {
      const prompt = buildSuggestionsPrompt(request)
      suggestions = await generateSuggestionsWithOpenAI(prompt)
    } catch (aiError) {
      console.error('AI generation failed, using fallback:', aiError)
      suggestions = getFallbackSuggestions(request)
    }

    return new Response(
      JSON.stringify({
        suggestions,
        metadata: {
          industry: request.industry,
          targetAudience: request.targetAudience,
          contentGoals: request.contentGoals,
          platforms: request.platforms,
          generatedAt: new Date().toISOString(),
          count: suggestions.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Content suggestions error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        suggestions: getFallbackSuggestions({ count: 3 })
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})