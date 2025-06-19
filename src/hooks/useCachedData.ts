import { useState, useEffect, useCallback } from 'react';
import { setWithExpiry, getWithExpiry } from '../utils/cacheUtils';

interface UseCachedDataOptions<T> {
  key: string;
  fetchData: () => Promise<T>;
  ttl?: number; // Time to live in milliseconds
  initialData?: T;
  onError?: (error: Error) => void;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
}

export function useCachedData<T>({
  key,
  fetchData,
  ttl = 1000 * 60 * 5, // 5 minutes default
  initialData,
  onError,
  revalidateOnFocus = true,
  revalidateOnReconnect = true
}: UseCachedDataOptions<T>) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Function to load data from cache or fetch from API
  const loadData = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to get data from cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = getWithExpiry(key);
        if (cachedData) {
          setData(cachedData);
          setIsLoading(false);
          setLastUpdated(new Date());
          return;
        }
      }

      // If no cached data or force refresh, fetch fresh data
      const freshData = await fetchData();
      setData(freshData);
      
      // Store in cache
      setWithExpiry(key, freshData, ttl);
      
      setLastUpdated(new Date());
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetchData, ttl, onError]);

  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set up event listeners for revalidation
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && revalidateOnFocus) {
        loadData();
      }
    };

    const handleOnline = () => {
      if (revalidateOnReconnect) {
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [loadData, revalidateOnFocus, revalidateOnReconnect]);

  // Function to manually refresh data
  const refresh = useCallback(() => loadData(true), [loadData]);

  return {
    data,
    isLoading,
    error,
    refresh,
    lastUpdated
  };
}