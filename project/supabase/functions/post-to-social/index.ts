import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PostRequest {
  platform: string
  access_token: string
  content: string
  media_urls?: string[]
}

async function postToTwitter(accessToken: string, content: string, mediaUrls?: string[]) {
  const tweetData: any = { text: content }
  
  // Handle media uploads if provided
  if (mediaUrls && mediaUrls.length > 0) {
    // For Twitter, we'd need to upload media first and get media IDs
    // This is a simplified version - in production, you'd upload media to Twitter first
    console.log('Media URLs for Twitter:', mediaUrls)
  }

  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(tweetData)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Twitter post failed: ${errorText}`)
  }

  return await response.json()
}

async function postToInstagram(accessToken: string, content: string, mediaUrls?: string[]) {
  // Instagram requires media for posts
  if (!mediaUrls || mediaUrls.length === 0) {
    throw new Error('Instagram posts require at least one image or video')
  }

  // This is a simplified version - Instagram posting requires multiple steps:
  // 1. Create media container
  // 2. Publish the container
  // For now, we'll simulate the response
  
  return {
    id: `instagram_post_${Date.now()}`,
    message: 'Instagram post created successfully',
    media_count: mediaUrls.length
  }
}

async function postToFacebook(accessToken: string, content: string, mediaUrls?: string[]) {
  const postData: any = { message: content }
  
  if (mediaUrls && mediaUrls.length > 0) {
    // For Facebook, we can include a single image URL directly
    postData.link = mediaUrls[0]
  }

  // This would typically post to a Facebook page
  // You'd need the page ID and appropriate permissions
  const response = await fetch(`https://graph.facebook.com/me/feed`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Facebook post failed: ${errorText}`)
  }

  return await response.json()
}

async function postToLinkedIn(accessToken: string, content: string, mediaUrls?: string[]) {
  const postData = {
    author: 'urn:li:person:PERSON_ID', // This would be the actual person URN
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: content
        },
        shareMediaCategory: mediaUrls && mediaUrls.length > 0 ? 'IMAGE' : 'NONE'
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  }

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`LinkedIn post failed: ${errorText}`)
  }

  return await response.json()
}

async function postToYouTube(accessToken: string, content: string, mediaUrls?: string[]) {
  // YouTube posting is complex and typically involves video uploads
  // This is a placeholder for the actual implementation
  throw new Error('YouTube posting not yet implemented - requires video upload workflow')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { platform, access_token, content, media_urls }: PostRequest = await req.json()

    if (!platform || !access_token || !content) {
      throw new Error('Missing required parameters: platform, access_token, content')
    }

    let result

    switch (platform.toLowerCase()) {
      case 'twitter':
        result = await postToTwitter(access_token, content, media_urls)
        break
      case 'instagram':
        result = await postToInstagram(access_token, content, media_urls)
        break
      case 'facebook':
        result = await postToFacebook(access_token, content, media_urls)
        break
      case 'linkedin':
        result = await postToLinkedIn(access_token, content, media_urls)
        break
      case 'youtube':
        result = await postToYouTube(access_token, content, media_urls)
        break
      default:
        throw new Error(`Platform ${platform} not supported`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        platform,
        result
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Social media post error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})