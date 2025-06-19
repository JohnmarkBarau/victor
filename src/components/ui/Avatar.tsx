import React from 'react';
import { User } from 'lucide-react';
import { LazyImage } from './LazyImage';
import { cn } from '../../lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

export function Avatar({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  className,
  status
}: AvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500'
  };

  return (
    <div className={cn('relative rounded-full overflow-hidden', sizeClasses[size], className)}>
      {src ? (
        <LazyImage
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          aspectRatio="square"
        />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          {fallback || <User className="w-1/2 h-1/2 text-gray-500" />}
        </div>
      )}
      
      {status && (
        <span className={cn(
          'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
          statusColors[status],
          size === 'xs' ? 'w-1.5 h-1.5' : 
          size === 'sm' ? 'w-2 h-2' : 
          size === 'md' ? 'w-2.5 h-2.5' : 
          size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
        )} />
      )}
    </div>
  );
}