import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';
import { PerformanceMonitor, analyzeBundleSize } from './utils/performance';

function AuthProvider() {
  const { setSession, setLoading } = useAuthStore();

  useEffect(() => {
    PerformanceMonitor.mark('auth-init-start');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      PerformanceMonitor.mark('auth-init-end');
      PerformanceMonitor.measure('Auth Initialization', 'auth-init-start', 'auth-init-end');
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  // Analyze bundle performance in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setTimeout(analyzeBundleSize, 1000);
    }
  }, []);

  return <App />;
}

// Performance monitoring
PerformanceMonitor.mark('app-start');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider />
  </StrictMode>
);

// Log when app is fully loaded
window.addEventListener('load', () => {
  PerformanceMonitor.mark('app-loaded');
  PerformanceMonitor.measure('Total App Load Time', 'app-start', 'app-loaded');
});