import { useState, useEffect } from 'react';

interface UseImagePreloadOptions {
  onLoad?: () => void;
  onError?: (error: Error) => void;
  crossOrigin?: 'anonymous' | 'use-credentials';
}

export function useImagePreload(
  src: string | string[],
  options: UseImagePreloadOptions = {}
) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!src) {
      setLoaded(false);
      setError(null);
      return;
    }

    const sources = Array.isArray(src) ? src : [src];
    let unmounted = false;
    let loadedCount = 0;
    const errors: Error[] = [];

    sources.forEach((imgSrc) => {
      const img = new Image();
      
      if (options.crossOrigin) {
        img.crossOrigin = options.crossOrigin;
      }

      img.onload = () => {
        if (unmounted) return;
        
        loadedCount++;
        if (loadedCount === sources.length) {
          setLoaded(true);
          options.onLoad?.();
        }
      };

      img.onerror = () => {
        if (unmounted) return;
        
        const err = new Error(`Failed to load image: ${imgSrc}`);
        errors.push(err);
        
        if (errors.length === sources.length) {
          setError(errors[0]);
          options.onError?.(errors[0]);
        }
      };

      img.src = imgSrc;
    });

    return () => {
      unmounted = true;
    };
  }, [src, options.crossOrigin]);

  return { loaded, error };
}

// Preload multiple images in the background
export function preloadImages(sources: string[]): Promise<void[]> {
  return Promise.all(
    sources.map(
      (src) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
          img.src = src;
        })
    )
  );
}

// Preload critical images for a page
export function useCriticalImagesPreload(sources: string[]) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let unmounted = false;

    preloadImages(sources)
      .then(() => {
        if (!unmounted) {
          setLoaded(true);
        }
      })
      .catch((error) => {
        console.warn('Failed to preload critical images:', error);
        if (!unmounted) {
          setLoaded(true); // Still mark as loaded to not block rendering
        }
      });

    return () => {
      unmounted = true;
    };
  }, [sources]);

  return loaded;
}