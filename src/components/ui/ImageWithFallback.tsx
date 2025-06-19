import React, { useState } from 'react';
import { LazyImage } from './LazyImage';
import { cn } from '../../lib/utils';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: 'square' | '16/9' | '4/3' | '3/2' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
}

export function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  className,
  containerClassName,
  aspectRatio = 'auto',
  objectFit = 'cover',
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <LazyImage
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={cn(hasError ? 'opacity-80' : '', className)}
      containerClassName={containerClassName}
      aspectRatio={aspectRatio}
      objectFit={objectFit}
      {...props}
    />
  );
}