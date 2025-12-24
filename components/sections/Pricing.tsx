'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { Check, Info } from 'lucide-react';

/**
 * Pricing Section Component
 * 
 * Displays the updated fee structure and business model for Bhavan.ai:
 * - 5% all-inclusive transaction fee (legal, SPV, broker agreements)
 * - Individual services at ₹3,000 each (CA, Legal, Property Manager)
 * - Marketplace transaction fees
 * - Clear note about 4-6% stamp duty exclusion
 * - Emphasis on "no hidden charges" messaging
 * - Clear, scannable format with context for when each fee applies
 * 
 * Provides complete transparency about costs involved in fractional home ownership
 * through the platform.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
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
    id: 'transaction',
    name: 'Transaction Fee',
    fee: '5% All-Inclusive',
    description: 'Complete service package with no hidden charges',
    features: [
      'Legal agreements and documentation',
      'SPV formation and registration',
      'Broker coordination and services',
      'KYC and credit verification',
      'Co-owner matching service',
    ],
    timing: 'Charged at property purchase',
    isFuture: false,
  },
  {
    id: 'individual',
    name: 'Individual Services',
    fee: '₹3,000 each',
    description: 'Optional standalone professional services',
    features: [
      'Chartered Accountant (CA) services',
      'Legal consultation and review',
      'Property Manager coordination',
      'Available separately or bundled',
      'Transparent, fixed pricing',
    ],
    timing: 'As needed, pay per service',
    isFuture: false,
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
              Complete Fee Transparency
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                • <strong>No hidden charges:</strong> Our 5% transaction fee is all-inclusive, covering legal, SPV, and broker services
              </p>
              <p>
                • <strong>Stamp duty separate:</strong> Government stamp duty (4-6% depending on state) is excluded and paid directly to authorities
              </p>
              <p>
                • <strong>No monthly fees:</strong> Pay only when you use the platform or marketplace
              </p>
              <p>
                • <strong>Transparent pricing:</strong> Individual services (CA, Legal, Property Manager) available at fixed ₹3,000 each
              </p>
              <p>
                • <strong>Fair and sustainable:</strong> Our fees are designed to provide exceptional value while maintaining quality service
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
