import React, { Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingSpinner } from './LoadingSpinner';

interface LazyRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export function LazyRoute({ 
  children, 
  fallback,
  errorFallback 
}: LazyRouteProps) {
  const defaultFallback = (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}