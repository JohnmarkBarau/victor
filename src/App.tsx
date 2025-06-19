import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AuthForm } from './components/auth/AuthForm';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { useAuthStore } from './store/authStore';

// Lazy load pages for better performance
const Landing = React.lazy(() => import('./pages/Landing'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const CreatePost = React.lazy(() => import('./pages/CreatePost'));
const AutoReply = React.lazy(() => import('./pages/AutoReply'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const VideoAnalytics = React.lazy(() => import('./pages/VideoAnalytics'));
const Settings = React.lazy(() => import('./pages/Settings'));
const ThreadBuilder = React.lazy(() => import('./pages/ThreadBuilder'));
const EngagementBooster = React.lazy(() => import('./pages/EngagementBooster'));
const VideoGenerator = React.lazy(() => import('./pages/VideoGenerator'));
const Calendar = React.lazy(() => import('./pages/Calendar'));
const Pricing = React.lazy(() => import('./pages/Pricing'));
const Teams = React.lazy(() => import('./pages/Teams'));
const SocialConnect = React.lazy(() => import('./pages/SocialConnect'));

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

  if (loading) {
    return <PageLoadingFallback />;
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
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
          
          {/* Redirect unmatched routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}