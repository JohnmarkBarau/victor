/**
 * Utility functions for working with cache in the application
 */

// Cache keys
export const CACHE_KEYS = {
  POSTS: 'posts',
  COMMENTS: 'comments',
  ANALYTICS: 'analytics',
  USER_SETTINGS: 'user-settings',
  TEAMS: 'teams',
  SOCIAL_ACCOUNTS: 'social-accounts'
};

// Function to store data in localStorage with expiration
export function setWithExpiry(key: string, value: any, ttl: number) {
  const now = new Date();
  const item = {
    value,
    expiry: now.getTime() + ttl,
  };
  try {
    localStorage.setItem(key, JSON.stringify(item));
    return true;
  } catch (error) {
    console.error('Error storing data in localStorage:', error);
    return false;
  }
}

// Function to get data from localStorage with expiration check
export function getWithExpiry(key: string) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;
  
  try {
    const item = JSON.parse(itemStr);
    const now = new Date();
    
    // Compare the expiry time of the item with the current time
    if (now.getTime() > item.expiry) {
      // If the item is expired, remove it from localStorage
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (error) {
    console.error('Error parsing data from localStorage:', error);
    return null;
  }
}

// Function to clear all cached data
export function clearAllCaches() {
  try {
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing caches:', error);
    return false;
  }
}

// Function to clear a specific cache
export function clearCache(key: string) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error clearing cache for ${key}:`, error);
    return false;
  }
}

// Function to get the size of all cached data
export function getCacheSize(): number {
  let totalSize = 0;
  
  try {
    Object.values(CACHE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length;
      }
    });
    
    // Convert to KB
    return Math.round(totalSize / 1024);
  } catch (error) {
    console.error('Error calculating cache size:', error);
    return 0;
  }
}

// Function to check if IndexedDB is available
export function isIndexedDBAvailable(): boolean {
  return 'indexedDB' in window;
}

// Function to check if the Cache API is available
export function isCacheAPIAvailable(): boolean {
  return 'caches' in window;
}

// Function to check if the app is running in offline mode
export function isOfflineMode(): boolean {
  return !navigator.onLine;
}