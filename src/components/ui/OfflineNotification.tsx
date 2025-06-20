import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface OfflineNotificationProps {
  className?: string;
  message?: string;
  showRefresh?: boolean;
}

export function OfflineNotification({
  className = '',
  message = 'You are currently offline. Some features may be limited.',
  showRefresh = true
}: OfflineNotificationProps) {
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className={`bg-yellow-50 border-l-4 border-yellow-400 p-4 ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <WifiOff className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            {message}
          </p>
        </div>
        {showRefresh && (
          <div className="ml-auto pl-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-1 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}