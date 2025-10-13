"use client";

import dynamic from 'next/dynamic';
import { ComponentType, Suspense, useState, useEffect } from 'react';

/**
 * ✅ PERFORMANCE: Lazy Loading System
 * Automatically creates optimized lazy-loaded components with loading states
 */

interface LazyComponentOptions {
  fallback?: ComponentType | null;
  ssr?: boolean;
  loading?: ComponentType;
}

// Default loading component
const DefaultLoading = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
  </div>
);

// Card loading skeleton
const CardLoading = () => (
  <div className="animate-pulse">
    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

// Chart loading skeleton
const ChartLoading = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-gray-200 rounded-lg"></div>
  </div>
);

/**
 * Create lazy component with optimized loading
 */
export const createLazyComponent = (
  importFn: () => Promise<any>,
  options: LazyComponentOptions = {}
) => {
  const {
    ssr = false,
    loading: LoadingComponent = DefaultLoading,
    fallback = null
  } = options;

  const LazyComponent = dynamic(importFn, {
    ssr,
    loading: () => <LoadingComponent />,
  });

  return (props: any) => {
    const FallbackComponent = fallback;
    return (
      <Suspense fallback={FallbackComponent ? <FallbackComponent /> : <LoadingComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
};

// Pre-configured lazy components for common use cases

// Chart Components - Lazy load heavy chart libraries
export const LazyUsedDevicesChart = createLazyComponent(
  () => import('@/components/admin/Charts/used-devices').then(mod => ({ default: mod.UsedDevices })),
  { loading: () => <ChartLoading />, ssr: false }
);

export const LazyCampaignVisitorsChart = createLazyComponent(
  () => import('@/components/admin/Charts/campaign-visitors').then(mod => ({ default: mod.CampaignVisitors })),
  { loading: () => <ChartLoading />, ssr: false }
);

export const LazyPaymentsOverviewChart = createLazyComponent(
  () => import('@/components/admin/Charts/payments-overview').catch(() => 
    Promise.resolve({ default: () => <div>Chart not available</div> })
  ),
  { loading: () => <ChartLoading />, ssr: false }
);

export const LazyWeeksProfitChart = createLazyComponent(
  () => import('@/components/admin/Charts/weeks-profit').catch(() => 
    Promise.resolve({ default: () => <div>Chart not available</div> })
  ),
  { loading: () => <ChartLoading />, ssr: false }
);

// UI Components - Common components with fallbacks
export const LazyProductItem = createLazyComponent(
  () => import('@/components/Common/ProductItem').catch(() => 
    Promise.resolve({ default: () => <CardLoading /> })
  ),
  { loading: () => <CardLoading />, ssr: false }
);

export const LazySwiper = createLazyComponent(
  () => import('@/components/Common/DynamicSwiper').catch(() => 
    Promise.resolve({ default: () => <DefaultLoading /> })
  ),
  { loading: () => <DefaultLoading />, ssr: false }
);

// Heavy Admin Components - Only load when needed
export const LazyAdminSettings = createLazyComponent(
  () => import('@/app/admin/pages/settings/page').catch(() => 
    Promise.resolve({ default: () => <div className="p-4">Settings unavailable</div> })
  ),
  { loading: () => <DefaultLoading />, ssr: false }
);

// ApexCharts - Heavy library, lazy load
export const LazyApexChart = createLazyComponent(
  () => import('react-apexcharts').catch(() => 
    Promise.resolve({ default: () => <ChartLoading /> })
  ),
  { loading: () => <ChartLoading />, ssr: false }
);

// Utility functions for lazy loading
export const preloadComponent = (importFn: () => Promise<any>) => {
  if (typeof window !== 'undefined') {
    // Preload on idle or after user interaction
    const preload = () => importFn().catch(() => {});
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(preload);
    } else {
      setTimeout(preload, 100);
    }
  }
};

// Lazy load on intersection (when component comes into view)
export const createIntersectionLazyComponent = (
  importFn: () => Promise<any>,
  options: LazyComponentOptions & { rootMargin?: string } = {}
) => {
  const {
    ssr = false,
    loading: LoadingComponent = DefaultLoading,
    fallback = null,
    rootMargin = '50px'
  } = options;

  return (props: any) => {
    const [shouldLoad, setShouldLoad] = useState(false);
    const [ref, setRef] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
      if (!ref || shouldLoad) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        },
        { rootMargin }
      );

      observer.observe(ref);
      return () => observer.disconnect();
    }, [ref, shouldLoad, rootMargin]);

    if (!shouldLoad) {
      return (
        <div ref={setRef} className="min-h-[200px] flex items-center justify-center">
          <LoadingComponent />
        </div>
      );
    }

    const LazyComponent = dynamic(importFn, {
      ssr,
      loading: () => <LoadingComponent />,
    });

    const FallbackComponent = fallback;
    return (
      <Suspense fallback={FallbackComponent ? <FallbackComponent /> : <LoadingComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
};

// Preload critical components on app start
export const preloadCriticalComponents = () => {
  if (typeof window !== 'undefined') {
    // Preload charts for admin users
    const userRole = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').role : null;
    
    if (userRole === 'admin') {
      preloadComponent(() => import('@/components/admin/Charts/campaign-visitors'));
      preloadComponent(() => import('@/components/admin/Charts/used-devices'));
    }
    
    // Preload common components
    preloadComponent(() => import('@/components/Common/DynamicSwiper'));
  }
};

// Component registry for dynamic loading
export const ComponentRegistry = {
  // Charts
  'campaign-visitors': LazyCampaignVisitorsChart,
  'used-devices': LazyUsedDevicesChart,
  'payments-overview': LazyPaymentsOverviewChart,
  'weeks-profit': LazyWeeksProfitChart,
  
  // UI Components
  'product-item': LazyProductItem,
  'swiper': LazySwiper,
  'apex-chart': LazyApexChart,
  
  // Admin
  'admin-settings': LazyAdminSettings,
} as const;

export type ComponentName = keyof typeof ComponentRegistry;

// Dynamic component loader by name
export const getDynamicComponent = (name: ComponentName) => {
  return ComponentRegistry[name] || (() => <div>Component not found: {name}</div>);
};

// Export loading components for direct use
export { 
  DefaultLoading, 
  CardLoading, 
  ChartLoading
};