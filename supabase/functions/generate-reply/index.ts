import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReplyRequest {
  platform: string
  comment: string
  author: string
  tone?: 'Professional' | 'Friendly' | 'Casual'
  brandVoice?: string
  context?: string
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

function buildReplyPrompt(request: ReplyRequest): string {
  const { platform, comment, author, tone = 'Friendly', brandVoice, context } = request
  
  return `Generate a professional and engaging reply to this ${platform} comment:

Comment: "${comment}"
Author: @${author}
Platform: ${platform}
Desired Tone: ${tone}
${brandVoice ? `Brand Voice: ${brandVoice}` : ''}
${context ? `Additional Context: ${context}` : ''}

Guidelines:
- Be ${tone.toLowerCase()} and authentic
- Address the commenter by name when appropriate
- Provide value in your response
- Keep it concise and platform-appropriate
- Show appreciation for their engagement
- Include a subtle call-to-action when relevant
- Match the energy level of the original comment
- Be helpful and solution-oriented if they have questions/issues

Platform-specific considerations:
${platform === 'twitter' ? '- Keep it under 280 characters\n- Use Twitter-style language' : ''}
${platform === 'instagram' ? '- Can be more casual and emoji-friendly\n- Encourage further engagement' : ''}
${platform === 'linkedin' ? '- Maintain professional tone\n- Focus on business value' : ''}
${platform === 'facebook' ? '- Can be conversational\n- Build community feeling' : ''}

Generate only the reply text, no additional formatting or quotes:`
}

async function generateReplyWithOpenAI(prompt: string): Promise<string> {
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
          content: 'You are an expert social media manager who creates engaging, authentic replies that build community and drive positive engagement. You understand platform nuances and always maintain brand consistency.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.8,
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
    const request: ReplyRequest = await req.json()

    if (!request.platform || !request.comment || !request.author) {
      throw new Error('Missing required fields: platform, comment, author')
    }

    const prompt = buildReplyPrompt(request)
    const reply = await generateReplyWithOpenAI(prompt)

    return new Response(
      JSON.stringify({
        reply: reply.trim(),
        metadata: {
          platform: request.platform,
          originalComment: request.comment,
          author: request.author,
          tone: request.tone || 'Friendly',
          generatedAt: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Reply generation error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        fallbackReply: "Thank you for your comment! We appreciate your engagement and will get back to you soon. 😊"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})