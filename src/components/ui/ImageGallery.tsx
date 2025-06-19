import React, { useState } from 'react';
import { LazyImage } from './LazyImage';
import { cn } from '../../lib/utils';

interface ImageGalleryProps {
  images: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }[];
  className?: string;
  itemClassName?: string;
  aspectRatio?: 'square' | '16/9' | '4/3' | '3/2' | 'auto';
  columns?: 1 | 2 | 3 | 4;
  gap?: 'none' | 'sm' | 'md' | 'lg';
  onImageClick?: (index: number) => void;
}

export function ImageGallery({
  images,
  className,
  itemClassName,
  aspectRatio = 'square',
  columns = 3,
  gap = 'md',
  onImageClick,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
    onImageClick?.(index);
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div
      className={cn(
        'grid',
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
    >
      {images.map((image, index) => (
        <div
          key={index}
          className={cn(
            'overflow-hidden rounded-lg cursor-pointer transition-transform hover:scale-[1.02]',
            itemClassName
          )}
          onClick={() => handleImageClick(index)}
        >
          <LazyImage
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            aspectRatio={aspectRatio}
            objectFit="cover"
            priority={index < 4} // Prioritize first 4 images
            className="transition-transform hover:scale-105"
          />
        </div>
      ))}
    </div>
  );
}