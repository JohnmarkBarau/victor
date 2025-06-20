import { useState, useEffect } from 'react';

interface NetworkStatus {
  online: boolean;
  downlink?: number;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  rtt?: number;
  saveData?: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    online: navigator.onLine
  });

  useEffect(() => {
    // Update network status
    const updateNetworkStatus = () => {
      setStatus({
        online: navigator.onLine
      });
    };

    // Initial update
    updateNetworkStatus();

    // Event listeners for online/offline status
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Cleanup
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  return status;
}