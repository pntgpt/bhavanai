'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { 
  Shield, 
  FileCheck, 
  Wallet, 
  Store, 
  Lock 
} from 'lucide-react';

/**
 * Features Section Component
 * 
 * Displays the key features and capabilities of the Bhavan.ai platform:
 * - KYC and credit scoring
 * - Digital SPV creation and legal compliance
 * - Collective down payment and NBFC financing
 * - Secondary market and exit marketplace
 * - Security, escrow, and document vault
 * 
 * Features a grid layout of feature cards with icons and descriptions.
 * Responsive design adapts from single column on mobile to multi-column on desktop.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface FeaturesProps {
  features?: Feature[];
}

const defaultFeatures: Feature[] = [
  {
    id: 'kyc',
    title: 'KYC & Credit Scoring',
    description: 'Fast, secure identity verification and comprehensive credit assessment to ensure qualified co-owners.',
    icon: FileCheck,
  },
  {
    id: 'spv',
    title: 'Digital SPV Creation',
    description: 'Legally compliant Special Purpose Vehicles created digitally, handling all paperwork and registration.',
    icon: Shield,
  },
  {
    id: 'financing',
    title: 'Collective Financing',
    description: 'Pool down payments with co-owners and access NBFC financing options tailored for fractional ownership.',
    icon: Wallet,
  },
  {
    id: 'marketplace',
    title: 'Exit Marketplace',
    description: 'Secondary market for selling your shares when you need liquidity, with transparent pricing and trading.',
    icon: Store,
  },
  {
    id: 'security',
    title: 'Security & Escrow',
    description: 'Bank-grade security with escrow services and encrypted document vault for all your ownership papers.',
    icon: Lock,
  },
];

const Features: React.FC<FeaturesProps> = ({ features = defaultFeatures }) => {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-4xl md:text-5xl text-gray-900 mb-4">
            Platform Features
          </h2>
          <p className="font-sans text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need for secure, compliant fractional home ownership
          </p>
        </div>

        {/* Feature Cards Grid - Requirements 3.1-3.5 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            
            return (
              <Card key={feature.id} variant="feature" hover>
                {/* Icon */}
                <div className="mb-4 flex justify-center">
                  <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-7 h-7 text-primary-600" aria-hidden="true" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-serif font-semibold text-xl text-gray-900 mb-3 text-center">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="font-sans text-gray-600 text-center leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
