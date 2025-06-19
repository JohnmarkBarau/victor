import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react', 'react-day-picker'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'framer-motion', '@radix-ui/react-dialog', '@radix-ui/react-tabs'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'supabase-vendor': ['@supabase/supabase-js'],
          
          // Feature chunks
          'analytics': [
            'src/pages/Analytics.tsx',
            'src/pages/VideoAnalytics.tsx',
            'src/hooks/useAnalytics.ts',
            'src/hooks/useVideoAnalytics.ts'
          ],
          'content': [
            'src/pages/CreatePost.tsx',
            'src/pages/ThreadBuilder.tsx',
            'src/pages/VideoGenerator.tsx',
            'src/components/video/TavusVideoGenerator.tsx'
          ],
          'team': [
            'src/pages/Teams.tsx',
            'src/hooks/useTeams.ts',
            'src/hooks/useTeamCollaboration.ts'
          ]
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  // Enable source maps for better debugging
  esbuild: {
    sourcemap: true,
  }
});