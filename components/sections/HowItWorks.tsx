'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  UserCheck, 
  Users, 
  FileText, 
  TrendingUp 
} from 'lucide-react';

/**
 * HowItWorks Section Component
 * 
 * Displays the 4-step process for co-owning a home through Bhavan.ai:
 * 1. KYC & credit check
 * 2. Matching 2-5 compatible buyers
 * 3. Digital SPV formation with collective down payment
 * 4. Exit via marketplace
 * 
 * Features:
 * - Four step cards with icons and descriptions
 * - Visual flow diagram connecting the steps
 * - "See eligibility" CTA button
 * - Responsive layout for mobile and desktop
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

export interface ProcessStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface HowItWorksProps {
  steps?: ProcessStep[];
}

const defaultSteps: ProcessStep[] = [
  {
    id: 1,
    title: 'KYC & Credit Check',
    description: 'Fast, secure onboarding with identity verification and credit assessment.',
    icon: UserCheck,
  },
  {
    id: 2,
    title: 'Match Compatible Co-owners',
    description: 'Connect with 2–5 compatible buyers who share your goals and preferences.',
    icon: Users,
  },
  {
    id: 3,
    title: 'Form SPV & Down Payment',
    description: 'We create the legal entity digitally and facilitate collective down payment.',
    icon: FileText,
  },
  {
    id: 4,
    title: 'Move In & Exit Options',
    description: 'Sell your shares on our marketplace whenever you need liquidity.',
    icon: TrendingUp,
  },
];

const HowItWorks: React.FC<HowItWorksProps> = ({ steps = defaultSteps }) => {
  const router = useRouter();

  /**
   * Navigate to eligibility checker
   * Implements requirement 2.5
   */
  const handleSeeEligibility = () => {
    router.push('/eligibility');
  };

  return (
    <section 
      id="how-it-works" 
      className="py-16 md:py-24 bg-white scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-4xl md:text-5xl text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="font-sans text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Four simple steps to turn your rent into home ownership
          </p>
        </div>

        {/* Step Cards - Requirements 2.1, 2.2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            
            return (
              <div key={step.id} className="relative">
                {/* Connector line for desktop - Requirement 2.3 */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary-300 to-primary-200 z-0" 
                       style={{ width: 'calc(100% - 2rem)' }}
                       aria-hidden="true"
                  />
                )}

                <Card variant="feature" hover className="h-full relative z-10">
                  {/* Step number badge */}
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.id}
                  </div>

                  {/* Icon - Requirement 2.2 */}
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary-600" aria-hidden="true" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif font-semibold text-xl text-gray-900 mb-3 text-center">
                    {step.title}
                  </h3>

                  {/* Description - Requirement 2.2 */}
                  <p className="font-sans text-gray-600 text-center leading-relaxed">
                    {step.description}
                  </p>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Mobile Flow Diagram - Requirement 2.3 */}
        <div className="lg:hidden flex justify-center mb-12" aria-hidden="true">
          <div className="flex flex-col items-center space-y-2">
            {steps.slice(0, -1).map((step) => (
              <div key={`arrow-${step.id}`} className="text-primary-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* CTA - Requirement 2.4, 2.5 */}
        <div className="text-center mt-12">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSeeEligibility}
            ariaLabel="Check your eligibility for Bhavan.ai"
          >
            See eligibility
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
