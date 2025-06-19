import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Preload critical routes based on current location
export function useRoutePreloading() {
  const location = useLocation();

  useEffect(() => {
    const preloadRoutes = async () => {
      try {
        // Preload likely next routes based on current location
        switch (location.pathname) {
          case '/':
            // From landing, users likely go to auth or dashboard
            await Promise.all([
              import('../pages/Dashboard'),
              import('../components/auth/AuthForm')
            ]);
            break;
            
          case '/dashboard':
            // From dashboard, users likely go to create or analytics
            await Promise.all([
              import('../pages/CreatePost'),
              import('../pages/Analytics'),
              import('../pages/Calendar')
            ]);
            break;
            
          case '/create':
            // From create, users might check analytics or calendar
            await Promise.all([
              import('../pages/Analytics'),
              import('../pages/Calendar'),
              import('../pages/ThreadBuilder')
            ]);
            break;
            
          case '/analytics':
            // From analytics, users might go to video analytics or dashboard
            await Promise.all([
              import('../pages/VideoAnalytics'),
              import('../pages/Dashboard')
            ]);
            break;
            
          case '/teams':
            // From teams, users might go to create or settings
            await Promise.all([
              import('../pages/CreatePost'),
              import('../pages/Settings')
            ]);
            break;
            
          default:
            // Preload dashboard as it's the most common destination
            await import('../pages/Dashboard');
            break;
        }
      } catch (error) {
        console.warn('Route preloading failed:', error);
      }
    };

    // Preload after a delay to avoid blocking current page
    const timeoutId = setTimeout(preloadRoutes, 1000);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);
}

// Preload all routes for better UX (use sparingly)
export function usePreloadAllRoutes(enabled = false) {
  useEffect(() => {
    if (!enabled) return;

    const preloadAll = async () => {
      try {
        await Promise.all([
          import('../pages/Dashboard'),
          import('../pages/CreatePost'),
          import('../pages/Analytics'),
          import('../pages/VideoAnalytics'),
          import('../pages/Settings'),
          import('../pages/Teams'),
          import('../pages/Calendar'),
          import('../pages/ThreadBuilder'),
          import('../pages/VideoGenerator'),
          import('../pages/EngagementBooster'),
          import('../pages/AutoReply'),
          import('../pages/SocialConnect')
        ]);
        console.log('All routes preloaded successfully');
      } catch (error) {
        console.warn('Failed to preload all routes:', error);
      }
    };

    // Preload after page is fully loaded
    const timeoutId = setTimeout(preloadAll, 3000);

    return () => clearTimeout(timeoutId);
  }, [enabled]);
}