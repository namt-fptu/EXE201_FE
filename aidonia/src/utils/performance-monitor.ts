"use client";

/**
 * ✅ PERFORMANCE: Performance Monitoring System
 * Tracks key performance metrics in development
 */

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  timestamp: number;
  props?: any;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private enabled = process.env.NODE_ENV === 'development';

  startTimer(componentName: string): () => void {
    if (!this.enabled) return () => {};
    
    const startTime = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime;
      this.recordMetric({
        componentName,
        renderTime,
        timestamp: Date.now()
      });
    };
  }

  recordMetric(metric: PerformanceMetrics): void {
    if (!this.enabled) return;
    
    this.metrics.push(metric);
    
    // Log slow renders (> 16ms for 60fps)
    if (metric.renderTime > 16) {
      console.warn(`⚠️ Slow render: ${metric.componentName} took ${metric.renderTime.toFixed(2)}ms`);
    }
    
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return this.metrics;
  }

  getSlowestComponents(limit: number = 10): PerformanceMetrics[] {
    return [...this.metrics]
      .sort((a, b) => b.renderTime - a.renderTime)
      .slice(0, limit);
  }

  getAverageRenderTime(componentName: string): number {
    const componentMetrics = this.metrics.filter(m => m.componentName === componentName);
    if (componentMetrics.length === 0) return 0;
    
    const total = componentMetrics.reduce((sum, m) => sum + m.renderTime, 0);
    return total / componentMetrics.length;
  }

  clear(): void {
    this.metrics = [];
  }

  // Generate performance report
  generateReport(): void {
    if (!this.enabled || this.metrics.length === 0) return;
    
    console.group('📊 Performance Report');
    console.table(this.getSlowestComponents());
    
    const avgRenderTime = this.metrics.reduce((sum, m) => sum + m.renderTime, 0) / this.metrics.length;
    console.log(`Average render time: ${avgRenderTime.toFixed(2)}ms`);
    
    const slowRenders = this.metrics.filter(m => m.renderTime > 16).length;
    console.log(`Slow renders (>16ms): ${slowRenders}/${this.metrics.length}`);
    
    console.groupEnd();
  }
}

export const perfMonitor = new PerformanceMonitor();

/**
 * React Hook for performance monitoring
 */
export const usePerformanceMonitor = (componentName: string) => {
  if (typeof window === 'undefined') return;
  
  // This would be used inside React components where hooks are available
  // For now, just record the component name
  perfMonitor.recordMetric({
    componentName,
    renderTime: 0, // Will be measured by the component itself
    timestamp: Date.now()
  });
};

/**
 * Simple performance wrapper function
 */
export const measurePerformance = (componentName: string, fn: () => void) => {
  const startTime = performance.now();
  fn();
  const renderTime = performance.now() - startTime;
  
  perfMonitor.recordMetric({
    componentName,
    renderTime,
    timestamp: Date.now()
  });
};

// Development helpers
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).perfMonitor = {
    report: () => perfMonitor.generateReport(),
    clear: () => perfMonitor.clear(),
    metrics: () => perfMonitor.getMetrics(),
    slowest: (limit?: number) => perfMonitor.getSlowestComponents(limit)
  };
}