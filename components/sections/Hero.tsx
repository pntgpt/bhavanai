'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import SignupForm from '@/components/forms/SignupForm';
import { trackCTAClick } from '@/lib/analytics';

/**
 * Hero Section Component
 * 
 * The main hero section for the homepage featuring:
 * - Headline emphasizing wealth building opportunity starting from ₹5.5 Lakhs
 * - Subheadline explaining the value proposition
 * - Primary "Signup Now" CTA button to open signup modal
 * - Pricing context message (free now or later ₹9,999)
 * - Full-viewport height with gradient background
 * - Responsive layout for mobile and desktop
 * 
 * Requirements: 1.1, 1.3
 */

export interface HeroProps {
  headline?: string;
  subheadline?: string;
  primaryCTAText?: string;
  pricingContext?: string;
}

const Hero: React.FC<HeroProps> = ({
  headline = "Want to be wealthy? Starting from rupees 5.5 Lakhs",
  subheadline = "Build wealth through fractional home ownership. Start your journey to financial freedom with as little as ₹5.5 Lakhs.",
  primaryCTAText = "Signup Now",
  pricingContext = "Free now or later ₹9,999",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Open signup modal
   * Implements requirement 1.4
   */
  const handleGetEarlyAccess = () => {
    // Track CTA click
    trackCTAClick('hero_signup_now', primaryCTAText);
    setIsModalOpen(true);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-gray-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        {/* Headline - Requirement 1.1 */}
        <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-gray-900 mb-6 leading-tight">
          {headline}
        </h1>

        {/* Subheadline - Requirement 1.2 */}
        <p className="font-sans text-lg sm:text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          {subheadline}
        </p>

        {/* CTAs - Requirement 1.3 */}
        <div className="flex flex-col items-center gap-4 justify-center">
          {/* Primary CTA - Requirement 1.4 */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleGetEarlyAccess}
            ariaLabel="Sign up now for Bhavan.ai"
            className="w-full sm:w-auto"
          >
            {primaryCTAText}
          </Button>

          {/* Pricing context with strikethrough design */}
          <div className="flex items-center gap-2 text-base font-sans">
            <span className="text-gray-400 line-through decoration-2">₹9,999</span>
            <span className="text-primary-600 font-semibold text-lg">FREE</span>
            <span className="text-gray-500 text-sm">for early adopters</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 animate-bounce">
          <svg
            className="w-6 h-6 mx-auto text-gray-400"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Signup Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Signup Now"
      >
        <SignupForm 
          inline={true}
          onSuccess={() => {
            // Keep modal open to show success message
            // User can close it manually or click to sign up another person
          }}
        />
      </Modal>
    </section>
  );
};

export default Hero;
