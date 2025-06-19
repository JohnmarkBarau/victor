import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OAuthCallbackRequest {
  platform: string
  code: string
  redirect_uri: string
}

interface PlatformConfig {
  tokenUrl: string
  clientId: string
  clientSecret: string
  userInfoUrl: string
}

const platformConfigs: Record<string, PlatformConfig> = {
  twitter: {
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    clientId: Deno.env.get('TWITTER_CLIENT_ID') || '',
    clientSecret: Deno.env.get('TWITTER_CLIENT_SECRET') || '',
    userInfoUrl: 'https://api.twitter.com/2/users/me'
  },
  instagram: {
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    clientId: Deno.env.get('INSTAGRAM_CLIENT_ID') || '',
    clientSecret: Deno.env.get('INSTAGRAM_CLIENT_SECRET') || '',
    userInfoUrl: 'https://graph.instagram.com/me'
  },
  facebook: {
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    clientId: Deno.env.get('FACEBOOK_CLIENT_ID') || '',
    clientSecret: Deno.env.get('FACEBOOK_CLIENT_SECRET') || '',
    userInfoUrl: 'https://graph.facebook.com/me'
  },
  linkedin: {
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    clientId: Deno.env.get('LINKEDIN_CLIENT_ID') || '',
    clientSecret: Deno.env.get('LINKEDIN_CLIENT_SECRET') || '',
    userInfoUrl: 'https://api.linkedin.com/v2/people/~'
  },
  youtube: {
    tokenUrl: 'https://oauth2.googleapis.com/token',
    clientId: Deno.env.get('GOOGLE_CLIENT_ID') || '',
    clientSecret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo'
  }
}

async function exchangeCodeForToken(platform: string, code: string, redirectUri: string) {
  const config = platformConfigs[platform]
  if (!config) {
    throw new Error(`Platform ${platform} not supported`)
  }

  const tokenParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret
  })

  // Special handling for Twitter OAuth 2.0
  if (platform === 'twitter') {
    tokenParams.append('code_verifier', 'challenge')
  }

  const tokenResponse = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: tokenParams
  })

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text()
    throw new Error(`Token exchange failed: ${errorText}`)
  }

  const tokenData = await tokenResponse.json()
  return tokenData
}

async function getUserInfo(platform: string, accessToken: string) {
  const config = platformConfigs[platform]
  if (!config) {
    throw new Error(`Platform ${platform} not supported`)
  }

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json'
  }

  // Platform-specific adjustments
  if (platform === 'instagram') {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const userResponse = await fetch(config.userInfoUrl, { headers })

  if (!userResponse.ok) {
    const errorText = await userResponse.text()
    throw new Error(`User info fetch failed: ${errorText}`)
  }

  const userData = await userResponse.json()
  
  // Normalize user data across platforms
  let normalizedData = {
    username: '',
    display_name: '',
    profile_image: ''
  }

  switch (platform) {
    case 'twitter':
      normalizedData = {
        username: userData.username || userData.data?.username || '',
        display_name: userData.name || userData.data?.name || '',
        profile_image: userData.profile_image_url || userData.data?.profile_image_url || ''
      }
      break
    case 'instagram':
      normalizedData = {
        username: userData.username || '',
        display_name: userData.name || userData.username || '',
        profile_image: userData.profile_picture_url || ''
      }
      break
    case 'facebook':
      normalizedData = {
        username: userData.id || '',
        display_name: userData.name || '',
        profile_image: userData.picture?.data?.url || ''
      }
      break
    case 'linkedin':
      normalizedData = {
        username: userData.id || '',
        display_name: `${userData.firstName?.localized?.en_US || ''} ${userData.lastName?.localized?.en_US || ''}`.trim(),
        profile_image: userData.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier || ''
      }
      break
    case 'youtube':
      normalizedData = {
        username: userData.id || '',
        display_name: userData.name || '',
        profile_image: userData.picture || ''
      }
      break
  }

  return normalizedData
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { platform, code, redirect_uri }: OAuthCallbackRequest = await req.json()

    if (!platform || !code || !redirect_uri) {
      throw new Error('Missing required parameters: platform, code, redirect_uri')
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(platform, code, redirect_uri)
    
    // Get user information
    const userInfo = await getUserInfo(platform, tokenData.access_token)

    // Calculate token expiration
    let expiresAt = null
    if (tokenData.expires_in) {
      expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    }

    const response = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      expires_at: expiresAt,
      username: userInfo.username,
      display_name: userInfo.display_name,
      profile_image: userInfo.profile_image
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('OAuth callback error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})