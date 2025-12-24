'use client';

import { lazy, Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Hero, HowItWorks } from '@/components/sections';

/**
 * Lazy-loaded sections for performance optimization
 * These sections are below the fold and can be loaded on demand
 * Implements code splitting to reduce initial bundle size
 * Requirements: 12.2, 12.4, 12.5
 */
const Features = lazy(() => import('@/components/sections/Features'));
const Marketplace = lazy(() => import('@/components/sections/Marketplace'));
const Pricing = lazy(() => import('@/components/sections/Pricing'));
const Team = lazy(() => import('@/components/sections/Team'));

/**
 * Loading fallback component for lazy-loaded sections
 * Provides smooth loading experience with skeleton UI
 */
const SectionLoader = () => (
  <div className="py-16 md:py-24 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
        <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto mb-12"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Homepage component
 * 
 * Main landing page for Bhavan.ai featuring:
 * - Hero section with headline and CTAs (Task 3) - Loaded immediately
 * - How It Works section with 4-step process (Task 3) - Loaded immediately
 * - Features section with platform capabilities (Task 4) - Lazy loaded
 * - Marketplace section with exit process (Task 4) - Lazy loaded
 * - Pricing section with fee structure (Task 4) - Lazy loaded
 * - Team section with founder information (Task 5) - Lazy loaded
 * 
 * Performance optimizations (Task 13):
 * - Code splitting for below-the-fold sections
 * - Lazy loading with Suspense boundaries
 * - Skeleton loading states for better UX
 * 
 * Note: Market & Validation and Roadmap sections removed per Task 22
 * 
 * Requirements: 1.1-1.5, 2.1-2.5, 3.1-3.5, 6.1-6.5, 7.1-7.5, 10.1-10.4, 12.2, 12.4, 12.5
 */
export default function Home() {
  return (
    <>
      <Header transparent />
      <main id="main-content">
        {/* Hero Section - Requirements 1.1-1.5 - Loaded immediately for LCP */}
        <Hero />
        
        {/* How It Works Section - Requirements 2.1-2.5 - Loaded immediately as it's above fold */}
        <HowItWorks />
        
        {/* Below-the-fold sections - Lazy loaded for performance - Requirements 12.4, 12.5 */}
        <Suspense fallback={<SectionLoader />}>
          {/* Features Section - Requirements 3.1-3.5 */}
          <Features />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          {/* Marketplace Section - Requirements 6.1-6.5 */}
          <Marketplace />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          {/* Pricing Section - Requirements 7.1-7.5 */}
          <Pricing />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          {/* Team Section - Requirements 10.1-10.4 */}
          <Team />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
