import React from 'react';
import { Navigation } from './Navigation';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { OfflineIndicator } from '../ui/OfflineIndicator';
import { PWAInstallPrompt } from '../ui/PWAInstallPrompt';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <OfflineIndicator />
      <PWAInstallPrompt />
    </div>
  );
}