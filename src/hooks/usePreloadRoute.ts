import { useEffect } from 'react';

// Hook to preload routes on hover or focus
export function usePreloadRoute(routePath: string, shouldPreload = true) {
  useEffect(() => {
    if (!shouldPreload) return;

    const preloadRoute = async () => {
      try {
        // Dynamically import the route component
        switch (routePath) {
          case '/dashboard':
            await import('../pages/Dashboard');
            break;
          case '/create':
            await import('../pages/CreatePost');
            break;
          case '/analytics':
            await import('../pages/Analytics');
            break;
          case '/video-analytics':
            await import('../pages/VideoAnalytics');
            break;
          case '/settings':
            await import('../pages/Settings');
            break;
          case '/teams':
            await import('../pages/Teams');
            break;
          case '/calendar':
            await import('../pages/Calendar');
            break;
          case '/video':
            await import('../pages/VideoGenerator');
            break;
          case '/thread-builder':
            await import('../pages/ThreadBuilder');
            break;
          case '/engagement':
            await import('../pages/EngagementBooster');
            break;
          case '/auto-reply':
            await import('../pages/AutoReply');
            break;
          case '/social-connect':
            await import('../pages/SocialConnect');
            break;
          default:
            break;
        }
      } catch (error) {
        console.warn(`Failed to preload route ${routePath}:`, error);
      }
    };

    // Preload after a short delay to avoid blocking initial render
    const timeoutId = setTimeout(preloadRoute, 100);

    return () => clearTimeout(timeoutId);
  }, [routePath, shouldPreload]);
}

// Hook to preload route on link hover
export function usePreloadOnHover() {
  const handleMouseEnter = (routePath: string) => {
    return async () => {
      try {
        switch (routePath) {
          case '/dashboard':
            await import('../pages/Dashboard');
            break;
          case '/create':
            await import('../pages/CreatePost');
            break;
          case '/analytics':
            await import('../pages/Analytics');
            break;
          case '/settings':
            await import('../pages/Settings');
            break;
          case '/teams':
            await import('../pages/Teams');
            break;
          // Add more routes as needed
        }
      } catch (error) {
        console.warn(`Failed to preload route ${routePath}:`, error);
      }
    };
  };

  return handleMouseEnter;
}