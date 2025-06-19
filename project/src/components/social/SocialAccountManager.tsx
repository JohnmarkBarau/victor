import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Linkedin,
  Link2,
  Unlink,
  Loader2,
  AlertCircle,
  Check,
  RefreshCw,
  Settings,
  User,
  Calendar,
  Activity
} from 'lucide-react';
import { useSocialAuth } from '../../hooks/useSocialAuth';

export function SocialAccountManager() {
  const {
    connectedAccounts,
    loading,
    error,
    initiateOAuth,
    disconnectAccount,
    refreshToken,
    fetchConnectedAccounts
  } = useSocialAuth();

  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const platforms = [
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-blue-400', bgColor: 'bg-blue-50' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500', bgColor: 'bg-pink-50' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', bgColor: 'bg-blue-50' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-600', bgColor: 'bg-red-50' }
  ];

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleConnect = async (platform: string) => {
    setConnecting(platform);
    try {
      await initiateOAuth(platform);
    } catch (err: any) {
      showMessage(err.message, 'error');
      setConnecting(null);
    }
  };

  const handleDisconnect = async (accountId: string, platform: string) => {
    if (!window.confirm(`Are you sure you want to disconnect your ${platform} account?`)) {
      return;
    }

    setDisconnecting(accountId);
    try {
      await disconnectAccount(accountId);
      showMessage(`Successfully disconnected ${platform} account`, 'success');
    } catch (err: any) {
      showMessage(err.message, 'error');
    } finally {
      setDisconnecting(null);
    }
  };

  const handleRefreshToken = async (accountId: string, platform: string) => {
    setRefreshing(accountId);
    try {
      await refreshToken(accountId);
      showMessage(`Successfully refreshed ${platform} token`, 'success');
    } catch (err: any) {
      showMessage(err.message, 'error');
    } finally {
      setRefreshing(null);
    }
  };

  const isConnected = (platform: string) => {
    return connectedAccounts.some(account => account.platform === platform);
  };

  const getConnectedAccount = (platform: string) => {
    return connectedAccounts.find(account => account.platform === platform);
  };

  const isTokenExpired = (account: any) => {
    if (!account.expires_at) return false;
    return new Date(account.expires_at) <= new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Social Media Accounts</h2>
          <p className="text-gray-600 mt-1">
            Connect your social media accounts to post directly from the app
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchConnectedAccounts}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'error' 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          <p>{message.text}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading accounts: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const connected = isConnected(platform.id);
          const account = getConnectedAccount(platform.id);
          const expired = account && isTokenExpired(account);

          return (
            <Card key={platform.id} className={`${connected ? 'border-green-200' : 'border-gray-200'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${platform.bgColor}`}>
                      <Icon className={`w-6 h-6 ${platform.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{platform.name}</CardTitle>
                      {connected && account && (
                        <CardDescription>
                          @{account.username}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  {connected && (
                    <Badge variant={expired ? 'destructive' : 'success'}>
                      {expired ? 'Expired' : 'Connected'}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {connected && account ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{account.display_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Connected {new Date(account.connected_at).toLocaleDateString()}</span>
                    </div>
                    {expired && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>Token expired - refresh required</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {expired && (
                        <Button
                          size="sm"
                          onClick={() => handleRefreshToken(account.id, platform.name)}
                          disabled={refreshing === account.id}
                          className="flex-1"
                        >
                          {refreshing === account.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Refreshing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Refresh
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDisconnect(account.id, platform.name)}
                        disabled={disconnecting === account.id}
                        className={expired ? 'flex-1' : 'w-full'}
                      >
                        {disconnecting === account.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Disconnecting...
                          </>
                        ) : (
                          <>
                            <Unlink className="w-4 h-4 mr-2" />
                            Disconnect
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Connect your {platform.name} account to post directly from the app
                    </p>
                    <Button
                      onClick={() => handleConnect(platform.id)}
                      disabled={connecting === platform.id}
                      className="w-full"
                    >
                      {connecting === platform.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Link2 className="w-4 h-4 mr-2" />
                          Connect {platform.name}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {connectedAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {connectedAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      isTokenExpired(account) ? 'bg-red-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <p className="font-medium capitalize">{account.platform}</p>
                      <p className="text-sm text-gray-500">@{account.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={isTokenExpired(account) ? 'destructive' : 'success'}>
                      {isTokenExpired(account) ? 'Token Expired' : 'Active'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Setup Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Required Environment Variables:</h4>
              <ul className="space-y-1 ml-4">
                <li>• VITE_TWITTER_CLIENT_ID - Twitter OAuth 2.0 Client ID</li>
                <li>• VITE_INSTAGRAM_CLIENT_ID - Instagram Basic Display API App ID</li>
                <li>• VITE_FACEBOOK_CLIENT_ID - Facebook App ID</li>
                <li>• VITE_LINKEDIN_CLIENT_ID - LinkedIn OAuth 2.0 Client ID</li>
                <li>• VITE_GOOGLE_CLIENT_ID - Google OAuth 2.0 Client ID (for YouTube)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">OAuth Redirect URIs:</h4>
              <ul className="space-y-1 ml-4">
                <li>• {window.location.origin}/auth/callback/twitter</li>
                <li>• {window.location.origin}/auth/callback/instagram</li>
                <li>• {window.location.origin}/auth/callback/facebook</li>
                <li>• {window.location.origin}/auth/callback/linkedin</li>
                <li>• {window.location.origin}/auth/callback/youtube</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}