import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface ConnectionQualityIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function ConnectionQualityIndicator({
  className = '',
  showDetails = false
}: ConnectionQualityIndicatorProps) {
  const [online, setOnline] = React.useState(navigator.onLine);
  
  React.useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Determine connection quality
  const getConnectionQuality = () => {
    if (!online) return 'offline';
    return 'good';
  };

  const quality = getConnectionQuality();

  // Determine icon and colors based on connection quality
  const getIndicatorProps = () => {
    switch (quality) {
      case 'offline':
        return {
          icon: WifiOff,
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          label: 'Offline'
        };
      case 'good':
        return {
          icon: Wifi,
          bgColor: 'bg-green-50',
          textColor: 'text-green-600',
          label: 'Good Connection'
        };
      default:
        return {
          icon: Wifi,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          label: 'Unknown'
        };
    }
  };

  const { icon: Icon, bgColor, textColor, label } = getIndicatorProps();

  if (!showDetails) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <Icon className={`h-4 w-4 ${textColor}`} />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${bgColor} ${textColor} ${className}`}>
      <Icon className="h-4 w-4" />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}