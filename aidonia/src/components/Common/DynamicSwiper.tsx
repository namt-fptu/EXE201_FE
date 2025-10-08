"use client";

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// ✅ PERFORMANCE: Dynamic imports for heavy Swiper components
// This reduces initial bundle size and improves First Paint

const SwiperCore = dynamic(
  () => import('swiper/react').then(mod => ({ default: mod.Swiper })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }
);

const SwiperSlideCore = dynamic(
  () => import('swiper/react').then(mod => ({ default: mod.SwiperSlide })),
  { ssr: false }
);

// CSS imports are handled via CSS-in-JS for better performance
const loadSwiperStyles = () => {
  if (typeof window !== 'undefined' && !document.querySelector('[data-swiper-styles]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/path/to/swiper-bundle.min.css'; // Will be handled via CDN or local file
    link.setAttribute('data-swiper-styles', 'true');
    document.head.appendChild(link);
  }
};

// Enhanced Swiper wrapper with automatic style loading
export const DynamicSwiper: ComponentType<any> = (props) => {
  // Load styles on first use only
  loadSwiperStyles();

  return <SwiperCore {...props} />;
};

export const DynamicSwiperSlide: ComponentType<any> = (props) => {
  return <SwiperSlideCore {...props} />;
};

// Export Swiper modules dynamically
export const loadSwiperModules = async () => {
  const { Autoplay, Navigation, Pagination } = await import('swiper/modules');
  return { Autoplay, Navigation, Pagination };
};

// Default export for backward compatibility
export default DynamicSwiper;