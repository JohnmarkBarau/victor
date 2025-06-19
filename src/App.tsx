import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AuthForm } from './components/auth/AuthForm';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { useAuthStore } from './store/authStore';
import { useRoutePreloading } from './hooks/useRoutePreloading';
import { OfflineNotification } from './components/ui/OfflineNotification';

// Lazy load pages for better performance
const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const AutoReply = lazy(() => import('./pages/AutoReply'));
const Analytics = lazy(() => import('./pages/Analytics'));
const VideoAnalytics = lazy(() => import('./pages/VideoAnalytics'));
const Settings = lazy(() => import('./pages/Settings'));
const ThreadBuilder = lazy(() => import('./pages/ThreadBuilder'));
const EngagementBooster = lazy(() => import('./pages/EngagementBooster'));
const VideoGenerator = lazy(() => import('./pages/VideoGenerator'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Teams = lazy(() => import('./pages/Teams'));
const SocialConnect = lazy(() => import('./pages/SocialConnect'));

// Loading fallback component
function PageLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading page..." />
    </div>
  );
}

// Layout loading fallback for protected routes
function LayoutLoadingFallback() {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    </Layout>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <PageLoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LayoutLoadingFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  const { user, loading } = useAuthStore();
  
  // Preload routes based on current location
  useRoutePreloading();

  if (loading) {
    return <PageLoadingFallback />;
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <OfflineNotification className="sticky top-16 z-40 mx-auto max-w-7xl mt-2" />
        <Routes>
          {/* Public routes with lazy loading */}
          <Route 
            path="/" 
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <Landing />
              </Suspense>
            } 
          />
          <Route 
            path="/pricing" 
            element={
              <Suspense fallback={<PageLoadingFallback />}>
                <Pricing />
              </Suspense>
            } 
          />
          
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
                <Layout>
                  <SocialConnect />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Protected routes with lazy loading */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <Layout>
                  <CreatePost />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/auto-reply" 
            element={
              <ProtectedRoute>
                <Layout>
                  <AutoReply />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/video-analytics" 
            element={
              <ProtectedRoute>
                <Layout>
                  <VideoAnalytics />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/thread-builder" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ThreadBuilder />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/engagement" 
            element={
              <ProtectedRoute>
                <Layout>
                  <EngagementBooster />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/video" 
            element={
              <ProtectedRoute>
                <Layout>
                  <VideoGenerator />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/calendar" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Calendar />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teams" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Teams />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/social-connect" 
            element={
              <ProtectedRoute>
                <Layout>
                  <SocialConnect />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Offline fallback route */}
          <Route 
            path="/offline" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 max-w-md">
                  <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">You're Offline</h1>
                  <p className="text-gray-600 mb-6">
                    It looks like you're not connected to the internet. Some features may be limited.
                  </p>
                  <Button onClick={() => window.location.reload()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            } 
          />
          
          {/* Redirect unmatched routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}