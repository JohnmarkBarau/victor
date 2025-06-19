import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RefreshTokenRequest {
  platform: string
  refresh_token: string
}

interface PlatformConfig {
  tokenUrl: string
  clientId: string
  clientSecret: string
}

const platformConfigs: Record<string, PlatformConfig> = {
  twitter: {
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    clientId: Deno.env.get('TWITTER_CLIENT_ID') || '',
    clientSecret: Deno.env.get('TWITTER_CLIENT_SECRET') || ''
  },
  instagram: {
    tokenUrl: 'https://graph.instagram.com/refresh_access_token',
    clientId: Deno.env.get('INSTAGRAM_CLIENT_ID') || '',
    clientSecret: Deno.env.get('INSTAGRAM_CLIENT_SECRET') || ''
  },
  facebook: {
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    clientId: Deno.env.get('FACEBOOK_CLIENT_ID') || '',
    clientSecret: Deno.env.get('FACEBOOK_CLIENT_SECRET') || ''
  },
  linkedin: {
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    clientId: Deno.env.get('LINKEDIN_CLIENT_ID') || '',
    clientSecret: Deno.env.get('LINKEDIN_CLIENT_SECRET') || ''
  },
  youtube: {
    tokenUrl: 'https://oauth2.googleapis.com/token',
    clientId: Deno.env.get('GOOGLE_CLIENT_ID') || '',
    clientSecret: Deno.env.get('GOOGLE_CLIENT_SECRET') || ''
  }
}

async function refreshAccessToken(platform: string, refreshToken: string) {
  const config = platformConfigs[platform]
  if (!config) {
    throw new Error(`Platform ${platform} not supported`)
  }

  let tokenParams: URLSearchParams

  switch (platform) {
    case 'instagram':
      // Instagram uses a different refresh flow
      tokenParams = new URLSearchParams({
        grant_type: 'ig_refresh_token',
        access_token: refreshToken // Instagram uses access_token instead of refresh_token
      })
      break
    
    case 'facebook':
      tokenParams = new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        fb_exchange_token: refreshToken
      })
      break
    
    default:
      // Standard OAuth 2.0 refresh flow
      tokenParams = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret
      })
      break
  }

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: tokenParams
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Token refresh failed: ${errorText}`)
  }

  const tokenData = await response.json()
  
  // Calculate new expiration time
  let expiresAt = null
  if (tokenData.expires_in) {
    expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
  }

  return {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || refreshToken, // Keep old refresh token if new one not provided
    expires_at: expiresAt
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { platform, refresh_token }: RefreshTokenRequest = await req.json()

    if (!platform || !refresh_token) {
      throw new Error('Missing required parameters: platform, refresh_token')
    }

    const result = await refreshAccessToken(platform, refresh_token)

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Token refresh error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})