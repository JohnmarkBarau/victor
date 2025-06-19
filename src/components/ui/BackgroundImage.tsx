import React from 'react';
import { cn } from '../../lib/utils';

interface BackgroundImageProps {
  src: string;
  alt?: string;
  children: React.ReactNode;
  className?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  priority?: boolean;
}

export function BackgroundImage({
  src,
  alt = '',
  children,
  className,
  overlayColor = 'black',
  overlayOpacity = 0.5,
  priority = false,
}: BackgroundImageProps) {
  return (
    <div 
      className={cn(
        'relative bg-cover bg-center bg-no-repeat',
        className
      )}
      style={{ backgroundImage: `url(${src})` }}
      role="img"
      aria-label={alt}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Hidden image for SEO and priority loading */}
      <img 
        src={src} 
        alt={alt} 
        className="hidden" 
        loading={priority ? 'eager' : 'lazy'} 
      />
    </div>
  );
}