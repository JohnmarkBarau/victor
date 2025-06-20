import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AuthForm } from './components/auth/AuthForm';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { useAuthStore } from './store/authStore';
import { OfflineNotification } from './components/ui/OfflineNotification';

// Import pages
import Dashboard from './pages/Dashboard';
import CreatePost from './pages/CreatePost';
import AutoReply from './pages/AutoReply';
import Analytics from './pages/Analytics';
import VideoAnalytics from './pages/VideoAnalytics';
import Settings from './pages/Settings';
import ThreadBuilder from './pages/ThreadBuilder';
import EngagementBooster from './pages/EngagementBooster';
import VideoGenerator from './pages/VideoGenerator';
import Calendar from './pages/Calendar';
import Pricing from './pages/Pricing';
import Teams from './pages/Teams';
import SocialConnect from './pages/SocialConnect';
import Landing from './pages/Landing';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <OfflineNotification className="sticky top-16 z-40 mx-auto max-w-7xl mt-2" />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          
          {/* Auth route - redirect to dashboard if already logged in */}
          <Route 
            path="/auth" 
            element={user ? <Navigate to="/dashboard" replace /> : <AuthForm />} 
          />
          
          {/* OAuth callback routes */}
          <Route 
            path="/auth/callback/:platform" 
            element={
              <ProtectedRoute>
                <Layout><SocialConnect /></Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <Layout><CreatePost /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/auto-reply" 
            element={
              <ProtectedRoute>
                <Layout><AutoReply /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Layout><Analytics /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/video-analytics" 
            element={
              <ProtectedRoute>
                <Layout><VideoAnalytics /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Layout><Settings /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/thread-builder" 
            element={
              <ProtectedRoute>
                <Layout><ThreadBuilder /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/engagement" 
            element={
              <ProtectedRoute>
                <Layout><EngagementBooster /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/video" 
            element={
              <ProtectedRoute>
                <Layout><VideoGenerator /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/calendar" 
            element={
              <ProtectedRoute>
                <Layout><Calendar /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teams" 
            element={
              <ProtectedRoute>
                <Layout><Teams /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/social-connect" 
            element={
              <ProtectedRoute>
                <Layout><SocialConnect /></Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect unmatched routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}