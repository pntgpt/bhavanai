'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import SignupForm from '@/components/forms/SignupForm';
import { trackCTAClick, trackScrollToSection } from '@/lib/analytics';

/**
 * Hero Section Component
 * 
 * The main hero section for the homepage featuring:
 * - Headline and subheadline explaining Bhavan.ai's value proposition
 * - Primary CTA button to open signup modal
 * - Secondary CTA link to scroll to How It Works section
 * - Full-viewport height with gradient background
 * - Responsive layout for mobile and desktop
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

export interface HeroProps {
  headline?: string;
  subheadline?: string;
  primaryCTAText?: string;
  secondaryCTAText?: string;
}

const Hero: React.FC<HeroProps> = ({
  headline = "Turn rent into home ownership. Co-own a home with 2–5 people via a compliant SPV",
  subheadline = "Match, form an SPV, pay the down payment collectively and move from rent to ownership.",
  primaryCTAText = "Get early access",
  secondaryCTAText = "How it works",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Smooth scroll to How It Works section
   * Implements requirement 1.5
   */
  const handleScrollToHowItWorks = () => {
    // Track CTA click
    trackCTAClick('hero_how_it_works', secondaryCTAText);
    trackScrollToSection('how-it-works');
    
    const howItWorksSection = document.getElementById('how-it-works');
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /**
   * Open signup modal
   * Implements requirement 1.4
   */
  const handleGetEarlyAccess = () => {
    // Track CTA click
    trackCTAClick('hero_get_early_access', primaryCTAText);
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
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Primary CTA - Requirement 1.4 */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleGetEarlyAccess}
            ariaLabel="Get early access to Bhavan.ai"
            className="w-full sm:w-auto"
          >
            {primaryCTAText}
          </Button>

          {/* Secondary CTA - Requirement 1.5 */}
          <Button
            variant="outline"
            size="lg"
            onClick={handleScrollToHowItWorks}
            ariaLabel="Scroll to How it works section"
            className="w-full sm:w-auto"
          >
            {secondaryCTAText}
          </Button>
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
        title="Get Early Access"
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
