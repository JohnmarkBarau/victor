import { lazy } from 'react';

// Utility function to create lazy imports with better error handling
export function createLazyImport<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallbackComponent?: T
) {
  const LazyComponent = lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.error('Failed to load component:', error);
      
      // Return fallback component if available
      if (fallbackComponent) {
        return { default: fallbackComponent };
      }
      
      // Return a generic error component
      return {
        default: () => (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Failed to load page
              </h2>
              <p className="text-gray-600 mb-4">
                Please refresh the page or try again later.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Refresh Page
              </button>
            </div>
          </div>
        ) as T
      };
    }
  });

  // Add display name for debugging
  LazyComponent.displayName = `LazyComponent(${importFn.toString().slice(0, 50)}...)`;

  return LazyComponent;
}

// Pre-configured lazy imports for common pages
export const LazyDashboard = createLazyImport(() => import('../pages/Dashboard'));
export const LazyCreatePost = createLazyImport(() => import('../pages/CreatePost'));
export const LazyAnalytics = createLazyImport(() => import('../pages/Analytics'));
export const LazySettings = createLazyImport(() => import('../pages/Settings'));
export const LazyTeams = createLazyImport(() => import('../pages/Teams'));