// Performance monitoring utilities
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();

  static mark(name: string) {
    this.marks.set(name, performance.now());
    if (performance.mark) {
      performance.mark(name);
    }
  }

  static measure(name: string, startMark: string, endMark?: string) {
    const startTime = this.marks.get(startMark);
    const endTime = endMark ? this.marks.get(endMark) : performance.now();
    
    if (startTime && endTime) {
      const duration = endTime - startTime;
      console.log(`${name}: ${duration.toFixed(2)}ms`);
      
      if (performance.measure) {
        try {
          performance.measure(name, startMark, endMark);
        } catch (error) {
          console.warn('Performance measure failed:', error);
        }
      }
      
      return duration;
    }
    
    return 0;
  }

  static getEntries() {
    if (performance.getEntriesByType) {
      return performance.getEntriesByType('measure');
    }
    return [];
  }

  static clear() {
    this.marks.clear();
    if (performance.clearMarks) {
      performance.clearMarks();
    }
    if (performance.clearMeasures) {
      performance.clearMeasures();
    }
  }
}

// Route loading performance tracker
export function trackRouteLoad(routeName: string) {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    console.log(`Route ${routeName} loaded in ${loadTime.toFixed(2)}ms`);
    
    // Send to analytics if needed
    if (loadTime > 1000) {
      console.warn(`Slow route load detected: ${routeName} took ${loadTime.toFixed(2)}ms`);
    }
  };
}

// Bundle size analyzer
export function analyzeBundleSize() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      console.group('Bundle Performance Analysis');
      console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'ms');
      console.log('Load Complete:', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
      console.log('Total Load Time:', navigation.loadEventEnd - navigation.fetchStart, 'ms');
      console.groupEnd();
    }
  }
}

// Lazy loading performance tracker
export function trackLazyLoad(componentName: string) {
  const startTime = performance.now();
  
  return {
    onLoad: () => {
      const loadTime = performance.now() - startTime;
      console.log(`Lazy component ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
    },
    onError: (error: Error) => {
      const loadTime = performance.now() - startTime;
      console.error(`Lazy component ${componentName} failed to load after ${loadTime.toFixed(2)}ms:`, error);
    }
  };
}