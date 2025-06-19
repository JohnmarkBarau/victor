import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LazyImage } from './LazyImage';
import { cn } from '../../lib/utils';

interface ImageCarouselProps {
  images: {
    src: string;
    alt: string;
  }[];
  className?: string;
  aspectRatio?: 'square' | '16/9' | '4/3' | '3/2' | 'auto';
  showDots?: boolean;
  showArrows?: boolean;
  autoPlay?: boolean;
  interval?: number;
}

export function ImageCarousel({
  images,
  className,
  aspectRatio = '16/9',
  showDots = true,
  showArrows = true,
  autoPlay = false,
  interval = 5000
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play functionality
  React.useEffect(() => {
    if (!autoPlay) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);
    
    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className={cn('relative overflow-hidden rounded-lg', className)}>
      {/* Images */}
      <div className="relative">
        {images.map((image, index) => (
          <div
            key={index}
            className={cn(
              'transition-opacity duration-500 absolute inset-0',
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            )}
          >
            <LazyImage
              src={image.src}
              alt={image.alt}
              aspectRatio={aspectRatio}
              objectFit="cover"
              className="w-full h-full"
              priority={index === 0 || index === currentIndex}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                index === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/80'
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}