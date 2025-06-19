import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, User, Link2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3">
              <img 
                src="/SocialSync AI Logo with Sync Arrow and Network Symbol.png" 
                alt="SocialSync AI" 
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-bold text-gray-900">SocialSync AI</span>
            </Link>
          </div>

          {user ? (
            <>
              <div className="hidden md:flex items-center space-x-8">
                <Link
                  to="/dashboard"
                  className={`text-gray-600 hover:text-gray-900 transition-colors ${
                    location.pathname === '/dashboard' ? 'text-gray-900' : ''
                  }`}
                >
                  Dashboard
                </Link>

                <div className="relative group">
                  <button className="flex items-center gap-1 text-gray-600 group-hover:text-gray-900 transition-colors">
                    Content
                    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 w-48 bg-white border rounded-lg shadow-lg mt-2 py-2 transition-all duration-200">
                    <Link
                      to="/create"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Create Post
                    </Link>
                    <Link
                      to="/calendar"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Smart Calendar
                    </Link>
                    <Link
                      to="/thread-builder"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Thread Builder
                    </Link>
                    <Link
                      to="/video"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Video Generator
                    </Link>
                  </div>
                </div>

                <div className="relative group">
                  <button className="flex items-center gap-1 text-gray-600 group-hover:text-gray-900 transition-colors">
                    Engagement
                    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 w-48 bg-white border rounded-lg shadow-lg mt-2 py-2 transition-all duration-200">
                    <Link
                      to="/auto-reply"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Auto-Reply
                    </Link>
                    <Link
                      to="/engagement"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Engagement Booster
                    </Link>
                  </div>
                </div>

                <div className="relative group">
                  <button className="flex items-center gap-1 text-gray-600 group-hover:text-gray-900 transition-colors">
                    Analytics
                    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 w-48 bg-white border rounded-lg shadow-lg mt-2 py-2 transition-all duration-200">
                    <Link
                      to="/analytics"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      General Analytics
                    </Link>
                    <Link
                      to="/video-analytics"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Video Analytics
                    </Link>
                  </div>
                </div>

                <Link
                  to="/teams"
                  className={`text-gray-600 hover:text-gray-900 transition-colors ${
                    location.pathname === '/teams' ? 'text-gray-900' : ''
                  }`}
                >
                  Teams
                </Link>

                <Link
                  to="/social-connect"
                  className={`text-gray-600 hover:text-gray-900 transition-colors ${
                    location.pathname === '/social-connect' ? 'text-gray-900' : ''
                  }`}
                >
                  <Link2 className="w-4 h-4 inline mr-1" />
                  Connect
                </Link>

                <Link
                  to="/settings"
                  className={`text-gray-600 hover:text-gray-900 transition-colors ${
                    location.pathname === '/settings' ? 'text-gray-900' : ''
                  }`}
                >
                  Settings
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="hidden sm:block">{user.email}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 invisible group-hover:visible opacity-0 group-hover:opacity-100 w-48 bg-white border rounded-lg shadow-lg mt-2 py-2 transition-all duration-200">
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/auth"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}