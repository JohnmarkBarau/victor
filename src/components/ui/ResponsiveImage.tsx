import React from 'react';
import { OptimizedImage } from './OptimizedImage';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  aspectRatio?: 'square' | '16/9' | '4/3' | '3/2' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  onLoad?: () => void;
  onError?: () => void;
}

export function ResponsiveImage({
  src,
  alt,
  sizes = {},
  priority = false,
  className,
  containerClassName,
  aspectRatio = 'auto',
  objectFit = 'cover',
  onLoad,
  onError,
}: ResponsiveImageProps) {
  // Default sizes if not provided
  const defaultSizes = {
    sm: sizes.sm || src,
    md: sizes.md || sizes.sm || src,
    lg: sizes.lg || sizes.md || sizes.sm || src,
    xl: sizes.xl || sizes.lg || sizes.md || sizes.sm || src,
  };

  // Generate srcSet for responsive images
  const srcSet = Object.entries(defaultSizes)
    .filter(([_, url]) => url)
    .map(([size, url]) => {
      const width = size === 'sm' ? 640 : size === 'md' ? 768 : size === 'lg' ? 1024 : 1280;
      return `${url} ${width}w`;
    })
    .join(', ');

  // Generate sizes attribute for responsive images
  const sizesAttr = '(max-width: 640px) 640px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1280px';

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      priority={priority}
      className={className}
      containerClassName={containerClassName}
      aspectRatio={aspectRatio}
      objectFit={objectFit}
      onLoad={onLoad}
      onError={onError}
      sizes={sizesAttr}
      {...(srcSet ? { srcSet } : {})}
    />
  );
}