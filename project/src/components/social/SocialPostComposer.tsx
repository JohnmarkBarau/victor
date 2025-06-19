import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  Send,
  Image as ImageIcon,
  Video,
  Calendar,
  Loader2,
  AlertCircle,
  Check,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Linkedin,
  X
} from 'lucide-react';
import { useSocialAuth } from '../../hooks/useSocialAuth';
import { FileUpload } from '../ui/FileUpload';

interface SocialPostComposerProps {
  initialContent?: string;
  onPostSuccess?: (results: any[]) => void;
}

export function SocialPostComposer({ initialContent = '', onPostSuccess }: SocialPostComposerProps) {
  const { connectedAccounts, postToSocialMedia } = useSocialAuth();
  
  const [content, setContent] = useState(initialContent);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [postResults, setPostResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="w-4 h-4 text-blue-400" />;
      case 'instagram': return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'facebook': return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'linkedin': return <Linkedin className="w-4 h-4 text-blue-700" />;
      case 'youtube': return <Youtube className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const getCharacterLimit = (platform: string) => {
    switch (platform) {
      case 'twitter': return 280;
      case 'instagram': return 2200;
      case 'facebook': return 63206;
      case 'linkedin': return 3000;
      default: return 280;
    }
  };

  const getContentForPlatform = (platform: string) => {
    const limit = getCharacterLimit(platform);
    if (content.length <= limit) return content;
    
    // Truncate content for platforms with limits
    return content.substring(0, limit - 3) + '...';
  };

  const handleAccountToggle = (accountId: string) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleMediaUpload = (urls: string[]) => {
    setMediaUrls(urls);
  };

  const removeMedia = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!content.trim()) {
      setError('Please enter some content to post');
      return;
    }

    if (selectedAccounts.length === 0) {
      setError('Please select at least one account to post to');
      return;
    }

    setIsPosting(true);
    setError(null);
    setPostResults([]);

    const results = [];

    for (const accountId of selectedAccounts) {
      const account = connectedAccounts.find(acc => acc.id === accountId);
      if (!account) continue;

      try {
        const platformContent = getContentForPlatform(account.platform);
        const result = await postToSocialMedia(accountId, platformContent, mediaUrls);
        
        results.push({
          accountId,
          platform: account.platform,
          username: account.username,
          success: true,
          result
        });
      } catch (err: any) {
        results.push({
          accountId,
          platform: account.platform,
          username: account.username,
          success: false,
          error: err.message
        });
      }
    }

    setPostResults(results);
    setIsPosting(false);

    // Check if all posts were successful
    const allSuccessful = results.every(r => r.success);
    if (allSuccessful) {
      setContent('');
      setSelectedAccounts([]);
      setMediaUrls([]);
      onPostSuccess?.(results);
    }
  };

  const activeAccounts = connectedAccounts.filter(account => 
    !account.expires_at || new Date(account.expires_at) > new Date()
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compose Post</CardTitle>
          <CardDescription>
            Create and publish content directly to your connected social media accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full min-h-[120px] p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
              <span>{content.length} characters</span>
              {selectedAccounts.length > 0 && (
                <div className="flex gap-2">
                  {selectedAccounts.map(accountId => {
                    const account = connectedAccounts.find(acc => acc.id === accountId);
                    if (!account) return null;
                    
                    const limit = getCharacterLimit(account.platform);
                    const isOverLimit = content.length > limit;
                    
                    return (
                      <span key={accountId} className={`text-xs px-2 py-1 rounded ${
                        isOverLimit ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {account.platform}: {content.length}/{limit}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media (Optional)
            </label>
            <FileUpload
              onUpload={handleMediaUpload}
              maxFiles={4}
              acceptedFileTypes={['image/*', 'video/*']}
            />
            {mediaUrls.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {mediaUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Media ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeMedia(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Post to Accounts
            </label>
            {activeAccounts.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>No active social media accounts connected.</p>
                <p className="text-sm">Connect accounts in Settings to start posting.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeAccounts.map((account) => (
                  <div
                    key={account.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedAccounts.includes(account.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAccountToggle(account.id)}
                  >
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(account.platform)}
                      <div className="flex-1">
                        <p className="font-medium capitalize">{account.platform}</p>
                        <p className="text-sm text-gray-500">@{account.username}</p>
                      </div>
                      {selectedAccounts.includes(account.id) && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}

          {/* Post Results */}
          {postResults.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Post Results</h4>
              {postResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.success 
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {result.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span className="font-medium capitalize">{result.platform}</span>
                    <span className="text-sm">(@{result.username})</span>
                  </div>
                  {result.error && (
                    <p className="text-sm mt-1">{result.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Post Button */}
          <Button
            onClick={handlePost}
            disabled={isPosting || !content.trim() || selectedAccounts.length === 0}
            className="w-full"
            size="lg"
          >
            {isPosting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Posting to {selectedAccounts.length} account{selectedAccounts.length !== 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Post to {selectedAccounts.length} account{selectedAccounts.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}