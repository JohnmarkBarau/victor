// Generate a low-quality image placeholder
export function generateBlurPlaceholder(width = 10, height = 10, color = '#e5e7eb'): string {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  // Get the canvas context
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Fill with color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  // Convert to base64
  return canvas.toDataURL('image/jpeg', 0.1);
}

// Check if an image exists
export async function checkImageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Get image dimensions
export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
    };
    img.src = url;
  });
}

// Calculate aspect ratio
export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
}

// Convert image to WebP if supported
export function getOptimizedImageFormat(url: string): string {
  // Check if browser supports WebP
  const supportsWebP = document.createElement('canvas')
    .toDataURL('image/webp')
    .indexOf('data:image/webp') === 0;
  
  if (supportsWebP && !url.includes('.webp') && !url.includes('.gif') && !url.includes('.svg')) {
    // For external services that support WebP conversion via URL parameters
    if (url.includes('cloudinary.com')) {
      return url.replace(/\.(jpe?g|png)/, '.webp');
    }
    
    // For other URLs, we can't convert them client-side
    return url;
  }
  
  return url;
}

// Get appropriate image size based on viewport
export function getResponsiveImageSize(
  originalWidth: number,
  originalHeight: number,
  containerWidth: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  
  // Calculate new dimensions while maintaining aspect ratio
  let newWidth = Math.min(originalWidth, containerWidth);
  let newHeight = newWidth / aspectRatio;
  
  return { width: Math.round(newWidth), height: Math.round(newHeight) };
}

// Generate srcset for responsive images
export function generateSrcSet(
  src: string,
  widths: number[] = [640, 768, 1024, 1280, 1536]
): string {
  return widths
    .map((width) => {
      // For Cloudinary
      if (src.includes('cloudinary.com')) {
        return `${src.replace(/\/upload\//, `/upload/w_${width}/`)} ${width}w`;
      }
      
      // For other services, you might need different URL patterns
      return `${src} ${width}w`;
    })
    .join(', ');
}