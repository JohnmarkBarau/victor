import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

interface ConnectionQualityIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function ConnectionQualityIndicator({
  className = '',
  showDetails = false
}: ConnectionQualityIndicatorProps) {
  const network = useNetworkStatus();

  // Determine connection quality
  const getConnectionQuality = () => {
    if (!network.online) return 'offline';
    
    if (!network.effectiveType) return 'unknown';
    
    switch (network.effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'poor';
      case '3g':
        return 'fair';
      case '4g':
        return 'good';
      default:
        return 'unknown';
    }
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
      case 'poor':
        return {
          icon: AlertCircle,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          label: 'Poor Connection'
        };
      case 'fair':
        return {
          icon: Wifi,
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-600',
          label: 'Fair Connection'
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
      {network.downlink && (
        <span className="text-xs">
          ({Math.round(network.downlink)} Mbps)
        </span>
      )}
    </div>
  );
}