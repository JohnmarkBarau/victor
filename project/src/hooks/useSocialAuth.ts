import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  display_name: string;
  profile_image?: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  is_active: boolean;
  connected_at: string;
  user_id: string;
}

export interface SocialAuthConfig {
  platform: string;
  client_id: string;
  redirect_uri: string;
  scope: string;
  auth_url: string;
}

export function useSocialAuth() {
  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const socialConfigs: Record<string, SocialAuthConfig> = {
    twitter: {
      platform: 'twitter',
      client_id: import.meta.env.VITE_TWITTER_CLIENT_ID || '',
      redirect_uri: `${window.location.origin}/auth/callback/twitter`,
      scope: 'tweet.read tweet.write users.read offline.access',
      auth_url: 'https://twitter.com/i/oauth2/authorize'
    },
    instagram: {
      platform: 'instagram',
      client_id: import.meta.env.VITE_INSTAGRAM_CLIENT_ID || '',
      redirect_uri: `${window.location.origin}/auth/callback/instagram`,
      scope: 'user_profile,user_media',
      auth_url: 'https://api.instagram.com/oauth/authorize'
    },
    facebook: {
      platform: 'facebook',
      client_id: import.meta.env.VITE_FACEBOOK_CLIENT_ID || '',
      redirect_uri: `${window.location.origin}/auth/callback/facebook`,
      scope: 'pages_manage_posts,pages_read_engagement,publish_to_groups',
      auth_url: 'https://www.facebook.com/v18.0/dialog/oauth'
    },
    linkedin: {
      platform: 'linkedin',
      client_id: import.meta.env.VITE_LINKEDIN_CLIENT_ID || '',
      redirect_uri: `${window.location.origin}/auth/callback/linkedin`,
      scope: 'w_member_social',
      auth_url: 'https://www.linkedin.com/oauth/v2/authorization'
    },
    youtube: {
      platform: 'youtube',
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      redirect_uri: `${window.location.origin}/auth/callback/youtube`,
      scope: 'https://www.googleapis.com/auth/youtube.upload',
      auth_url: 'https://accounts.google.com/o/oauth2/v2/auth'
    }
  };

  const fetchConnectedAccounts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('connected_at', { ascending: false });

      if (error) throw error;
      setConnectedAccounts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initiateOAuth = (platform: string) => {
    const config = socialConfigs[platform];
    if (!config) {
      throw new Error(`Platform ${platform} not supported`);
    }

    if (!config.client_id) {
      throw new Error(`${platform} client ID not configured. Please add VITE_${platform.toUpperCase()}_CLIENT_ID to your environment variables.`);
    }

    // Store platform in localStorage for callback handling
    localStorage.setItem('oauth_platform', platform);
    localStorage.setItem('oauth_state', Math.random().toString(36).substring(2));

    const params = new URLSearchParams({
      client_id: config.client_id,
      redirect_uri: config.redirect_uri,
      scope: config.scope,
      response_type: 'code',
      state: localStorage.getItem('oauth_state') || ''
    });

    // Special handling for different platforms
    if (platform === 'twitter') {
      params.append('code_challenge', 'challenge');
      params.append('code_challenge_method', 'plain');
    }

    const authUrl = `${config.auth_url}?${params.toString()}`;
    window.location.href = authUrl;
  };

  const handleOAuthCallback = async (code: string, state: string, platform: string) => {
    if (!user) throw new Error('User not authenticated');

    const storedState = localStorage.getItem('oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    try {
      // Call our edge function to handle the OAuth exchange
      const { data, error } = await supabase.functions.invoke('oauth-callback', {
        body: {
          platform,
          code,
          redirect_uri: socialConfigs[platform].redirect_uri
        }
      });

      if (error) throw error;

      // Store the account information
      const { data: accountData, error: insertError } = await supabase
        .from('social_accounts')
        .insert({
          platform,
          username: data.username,
          display_name: data.display_name,
          profile_image: data.profile_image,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at,
          user_id: user.id
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setConnectedAccounts(prev => [accountData, ...prev]);
      
      // Clean up localStorage
      localStorage.removeItem('oauth_platform');
      localStorage.removeItem('oauth_state');

      return accountData;
    } catch (err: any) {
      throw new Error(`Failed to connect ${platform}: ${err.message}`);
    }
  };

  const disconnectAccount = async (accountId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('social_accounts')
        .update({ is_active: false })
        .eq('id', accountId)
        .eq('user_id', user.id);

      if (error) throw error;

      setConnectedAccounts(prev => prev.filter(account => account.id !== accountId));
    } catch (err: any) {
      throw new Error(`Failed to disconnect account: ${err.message}`);
    }
  };

  const refreshToken = async (accountId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const account = connectedAccounts.find(acc => acc.id === accountId);
      if (!account) throw new Error('Account not found');

      const { data, error } = await supabase.functions.invoke('refresh-token', {
        body: {
          platform: account.platform,
          refresh_token: account.refresh_token
        }
      });

      if (error) throw error;

      const { error: updateError } = await supabase
        .from('social_accounts')
        .update({
          access_token: data.access_token,
          expires_at: data.expires_at
        })
        .eq('id', accountId);

      if (updateError) throw updateError;

      setConnectedAccounts(prev => prev.map(acc => 
        acc.id === accountId 
          ? { ...acc, access_token: data.access_token, expires_at: data.expires_at }
          : acc
      ));

      return data.access_token;
    } catch (err: any) {
      throw new Error(`Failed to refresh token: ${err.message}`);
    }
  };

  const postToSocialMedia = async (accountId: string, content: string, mediaUrls?: string[]) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const account = connectedAccounts.find(acc => acc.id === accountId);
      if (!account) throw new Error('Account not found');

      // Check if token needs refresh
      if (account.expires_at && new Date(account.expires_at) <= new Date()) {
        await refreshToken(accountId);
      }

      const { data, error } = await supabase.functions.invoke('post-to-social', {
        body: {
          platform: account.platform,
          access_token: account.access_token,
          content,
          media_urls: mediaUrls
        }
      });

      if (error) throw error;
      return data;
    } catch (err: any) {
      throw new Error(`Failed to post to ${connectedAccounts.find(acc => acc.id === accountId)?.platform}: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchConnectedAccounts();
  }, [user]);

  return {
    connectedAccounts,
    loading,
    error,
    initiateOAuth,
    handleOAuthCallback,
    disconnectAccount,
    refreshToken,
    postToSocialMedia,
    fetchConnectedAccounts,
    socialConfigs
  };
}