import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { 
  Bell, 
  User, 
  Shield, 
  LogOut, 
  Save, 
  Trash2, 
  AlertCircle,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Music2 as TikTok,
  Pointer as Pinterest,
  Linkedin,
  Link2,
  Unlink,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ConnectedAccount {
  platform: string;
  username: string;
  connected: boolean;
  lastSync?: string;
  description: string;
}

export default function Settings() {
  const { user, signOut } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [connecting, setConnecting] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [accounts, setAccounts] = useState<ConnectedAccount[]>([
    { 
      platform: 'instagram', 
      username: '', 
      connected: false,
      description: 'Share photos and videos with your followers'
    },
    { 
      platform: 'twitter', 
      username: '', 
      connected: false,
      description: 'Engage with your audience in real-time'
    },
    { 
      platform: 'facebook', 
      username: '', 
      connected: false,
      description: 'Connect with your community and share updates'
    },
    { 
      platform: 'youtube', 
      username: '', 
      connected: false,
      description: 'Manage your video content and engage with subscribers'
    },
    { 
      platform: 'tiktok', 
      username: '', 
      connected: false,
      description: 'Create and share short-form videos'
    },
    { 
      platform: 'pinterest', 
      username: '', 
      connected: false,
      description: 'Share visual content and drive traffic'
    },
    { 
      platform: 'linkedin', 
      username: '', 
      connected: false,
      description: 'Connect with professionals and share business updates'
    }
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const showMessage = (message: string, isError = false) => {
    if (isError) {
      setErrorMessage(message);
      setSuccessMessage('');
    } else {
      setSuccessMessage(message);
      setErrorMessage('');
    }
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 5000);
  };

  const handleConnect = async (platform: string) => {
    setConnecting(platform);
    setErrorMessage('');

    try {
      // Simulate API call to connect platform
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAccounts(prev => prev.map(account => 
        account.platform === platform
          ? { ...account, connected: true, username: `user_${platform}`, lastSync: new Date().toISOString() }
          : account
      ));
      showMessage(`Successfully connected to ${platform}`);
    } catch (err: any) {
      showMessage(`Failed to connect ${platform}. Please try again.`, true);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (platform: string) => {
    setConnecting(platform);
    setErrorMessage('');

    try {
      // Simulate API call to disconnect platform
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAccounts(prev => prev.map(account => 
        account.platform === platform
          ? { ...account, connected: false, username: '', lastSync: undefined }
          : account
      ));
      showMessage(`Successfully disconnected from ${platform}`);
    } catch (err: any) {
      showMessage(`Failed to disconnect ${platform}. Please try again.`, true);
    } finally {
      setConnecting(null);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: formData.email,
        data: { full_name: formData.fullName }
      });

      if (error) throw error;
      showMessage('Profile updated successfully');
    } catch (error: any) {
      showMessage(error.message, true);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      showMessage('New passwords do not match', true);
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;
      showMessage('Password updated successfully');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error: any) {
      showMessage(error.message, true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('delete_user');
      if (error) throw error;
      await signOut();
    } catch (error: any) {
      showMessage(error.message, true);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-6 h-6 text-pink-500" />;
      case 'twitter':
        return <Twitter className="w-6 h-6 text-blue-400" />;
      case 'facebook':
        return <Facebook className="w-6 h-6 text-blue-600" />;
      case 'youtube':
        return <Youtube className="w-6 h-6 text-red-600" />;
      case 'tiktok':
        return <TikTok className="w-6 h-6 text-black" />;
      case 'pinterest':
        return <Pinterest className="w-6 h-6 text-red-500" />;
      case 'linkedin':
        return <Linkedin className="w-6 h-6 text-blue-700" />;
      default:
        return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return 'bg-pink-50 border-pink-100';
      case 'twitter':
        return 'bg-blue-50 border-blue-100';
      case 'facebook':
        return 'bg-blue-100 border-blue-200';
      case 'youtube':
        return 'bg-red-50 border-red-100';
      case 'tiktok':
        return 'bg-gray-50 border-gray-100';
      case 'pinterest':
        return 'bg-red-50 border-red-100';
      case 'linkedin':
        return 'bg-blue-50 border-blue-100';
      default:
        return 'bg-gray-50 border-gray-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

      {(successMessage || errorMessage) && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          errorMessage ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        }`}>
          {errorMessage && <AlertCircle className="w-5 h-5" />}
          {successMessage || errorMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Profile Settings</h2>
          </div>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </form>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Connected Accounts</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {accounts.map((account) => (
              <div
                key={account.platform}
                className={`rounded-lg border p-4 ${getPlatformColor(account.platform)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getPlatformIcon(account.platform)}
                    <div>
                      <h3 className="text-lg font-semibold capitalize">
                        {account.platform}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {account.description}
                      </p>
                      {account.connected && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-gray-600">
                            Connected as @{account.username}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => account.connected 
                      ? handleDisconnect(account.platform)
                      : handleConnect(account.platform)
                    }
                    variant={account.connected ? "outline" : "default"}
                    disabled={connecting === account.platform}
                    className={`min-w-[120px] ${
                      account.connected ? 'border-red-200 text-red-600 hover:bg-red-50' : ''
                    }`}
                  >
                    {connecting === account.platform ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : account.connected ? (
                      <>
                        <Unlink className="w-4 h-4 mr-2" />
                        Disconnect
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Notification Preferences</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive updates via email</p>
              </div>
              <input
                type="checkbox"
                name="emailNotifications"
                checked={formData.emailNotifications}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Push Notifications</h3>
                <p className="text-sm text-gray-500">Receive push notifications</p>
              </div>
              <input
                type="checkbox"
                name="pushNotifications"
                checked={formData.pushNotifications}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Weekly Digest</h3>
                <p className="text-sm text-gray-500">Receive weekly summary</p>
              </div>
              <input
                type="checkbox"
                name="weeklyDigest"
                checked={formData.weeklyDigest}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 rounded"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Security</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              Update Password
            </Button>
          </form>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <LogOut className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Account Actions</h2>
          </div>
          <div className="space-y-4">
            <Button
              onClick={() => signOut()}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
            <Button
              onClick={handleDeleteAccount}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}