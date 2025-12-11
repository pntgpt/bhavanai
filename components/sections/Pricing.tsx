'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { Check, Info } from 'lucide-react';

/**
 * Pricing Section Component
 * 
 * Displays the fee structure and business model for Bhavan.ai:
 * - Platform fees for using the service
 * - Marketplace transaction fees
 * - Future fees (registration, SPV management)
 * - Clear, scannable format with context for when each fee applies
 * 
 * Provides transparency about costs involved in fractional home ownership
 * through the platform.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.5
 */

export interface PricingItem {
  id: string;
  name: string;
  fee: string;
  description: string;
  features: string[];
  timing: string;
  isFuture?: boolean;
}

export interface PricingProps {
  pricingItems?: PricingItem[];
}

const defaultPricingItems: PricingItem[] = [
  {
    id: 'platform',
    name: 'Platform Fee',
    fee: '1.5% of property value',
    description: 'One-time fee for SPV formation, matching, and onboarding',
    features: [
      'KYC and credit verification',
      'Co-owner matching service',
      'Digital SPV creation',
      'Legal documentation',
      'Onboarding support',
    ],
    timing: 'Charged at SPV formation',
    isFuture: false,
  },
  {
    id: 'marketplace',
    name: 'Marketplace Fees',
    fee: '2% + 1% processing',
    description: 'Fees for buying or selling shares on the secondary market',
    features: [
      '2% platform fee on transaction',
      '1% payment processing fee',
      'Escrow services included',
      'Legal transfer documentation',
      'Buyer KYC verification',
    ],
    timing: 'Charged per transaction',
    isFuture: false,
  },
  {
    id: 'future',
    name: 'Future Fees',
    fee: 'Coming Soon',
    description: 'Additional services planned for comprehensive SPV management',
    features: [
      'Property registration assistance',
      'Annual SPV compliance management',
      'Tax filing support',
      'Property maintenance coordination',
      'Insurance management',
    ],
    timing: 'To be announced',
    isFuture: true,
  },
];

const Pricing: React.FC<PricingProps> = ({ pricingItems = defaultPricingItems }) => {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-4xl md:text-5xl text-gray-900 mb-4">
            Transparent Pricing
          </h2>
          <p className="font-sans text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Clear, straightforward fees with no hidden costs
          </p>
        </div>

        {/* Pricing Cards - Requirements 7.1, 7.2, 7.3, 7.5 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingItems.map((item) => (
            <Card 
              key={item.id} 
              variant="default" 
              className={`relative ${item.isFuture ? 'opacity-90' : ''}`}
            >
              {/* Future Badge */}
              {item.isFuture && (
                <div className="absolute top-4 right-4">
                  <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                    Coming Soon
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <h3 className="font-serif font-semibold text-2xl text-gray-900 mb-2">
                  {item.name}
                </h3>
                <div className="font-sans font-bold text-3xl text-primary-600 mb-3">
                  {item.fee}
                </div>
                <p className="font-sans text-sm text-gray-600">
                  {item.description}
                </p>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-6">
                {item.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check 
                      className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" 
                      aria-hidden="true" 
                    />
                    <span className="font-sans text-sm text-gray-700">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Timing Context - Requirement 7.5 */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-start">
                  <Info 
                    className="w-4 h-4 text-primary-600 mr-2 flex-shrink-0 mt-0.5" 
                    aria-hidden="true" 
                  />
                  <p className="font-sans text-xs text-gray-600">
                    <strong>When:</strong> {item.timing}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Additional Context */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-serif font-semibold text-lg text-gray-900 mb-3">
              Fee Transparency
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                • <strong>No hidden charges:</strong> All fees are disclosed upfront before any transaction
              </p>
              <p>
                • <strong>No monthly fees:</strong> Pay only when you use the platform or marketplace
              </p>
              <p>
                • <strong>Competitive rates:</strong> Our fees are designed to be fair and sustainable
              </p>
              <p>
                • <strong>Volume discounts:</strong> Special rates available for multiple property purchases
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
