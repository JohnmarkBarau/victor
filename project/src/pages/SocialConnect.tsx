import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SocialAccountManager } from '../components/social/SocialAccountManager';
import { SocialPostComposer } from '../components/social/SocialPostComposer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { useSocialAuth } from '../hooks/useSocialAuth';
import { Loader2, AlertCircle, Check } from 'lucide-react';

export default function SocialConnect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useSocialAuth();
  const [callbackStatus, setCallbackStatus] = React.useState<{
    loading: boolean;
    success: boolean;
    error: string | null;
  }>({ loading: false, success: false, error: null });

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const platform = localStorage.getItem('oauth_platform');

    if (error) {
      setCallbackStatus({
        loading: false,
        success: false,
        error: `OAuth error: ${error}`
      });
      return;
    }

    if (code && state && platform) {
      setCallbackStatus({ loading: true, success: false, error: null });
      
      handleOAuthCallback(code, state, platform)
        .then(() => {
          setCallbackStatus({ loading: false, success: true, error: null });
          // Clear URL parameters
          navigate('/social-connect', { replace: true });
        })
        .catch((err) => {
          setCallbackStatus({
            loading: false,
            success: false,
            error: err.message
          });
        });
    }
  }, [searchParams, handleOAuthCallback, navigate]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Social Media Integration</h1>
        <p className="text-gray-600 mt-1">
          Connect your social media accounts and post directly from the app
        </p>
      </div>

      {/* OAuth Callback Status */}
      {(callbackStatus.loading || callbackStatus.success || callbackStatus.error) && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          callbackStatus.error 
            ? 'bg-red-50 text-red-700 border border-red-200'
            : callbackStatus.success
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {callbackStatus.loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {callbackStatus.success && <Check className="w-5 h-5" />}
          {callbackStatus.error && <AlertCircle className="w-5 h-5" />}
          <p>
            {callbackStatus.loading && 'Connecting your account...'}
            {callbackStatus.success && 'Account connected successfully!'}
            {callbackStatus.error && callbackStatus.error}
          </p>
        </div>
      )}

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="w-full border-b bg-white">
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            Connected Accounts
          </TabsTrigger>
          <TabsTrigger value="compose" className="flex items-center gap-2">
            Compose Post
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <SocialAccountManager />
        </TabsContent>

        <TabsContent value="compose">
          <SocialPostComposer />
        </TabsContent>
      </Tabs>
    </div>
  );
}