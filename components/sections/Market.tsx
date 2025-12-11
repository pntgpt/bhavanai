'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { TrendingUp, Users, Home, Target } from 'lucide-react';

/**
 * Market & Validation Section Component
 * 
 * Displays market statistics, traction metrics, and validation data:
 * - Relevant market statistics about rental and home ownership market
 * - Early traction metrics or validation data points
 * - Sources cited for statistics where applicable
 * - Professional, credible format
 * - Connection between market data and Bhavan.ai's value proposition
 * 
 * Builds credibility with potential investors and partners by demonstrating
 * market opportunity and early validation.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.5
 */

export interface MarketStat {
  id: string;
  label: string;
  value: string;
  description: string;
  source?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface TractionMetric {
  id: string;
  label: string;
  value: string;
  description: string;
}

export interface MarketProps {
  marketStats?: MarketStat[];
  tractionMetrics?: TractionMetric[];
}

const defaultMarketStats: MarketStat[] = [
  {
    id: 'rental-market',
    label: 'Rental Market Size',
    value: '₹2.5 Lakh Cr',
    description: 'India\'s residential rental market is growing rapidly with increasing urbanization',
    source: 'ANAROCK Property Consultants, 2023',
    icon: Home,
  },
  {
    id: 'renters',
    label: 'Urban Renters',
    value: '50M+',
    description: 'Over 50 million households rent in urban India, many aspiring to own homes',
    source: 'Census of India, 2021',
    icon: Users,
  },
  {
    id: 'affordability',
    label: 'Affordability Gap',
    value: '8-10x',
    description: 'Average home prices are 8-10x annual household income in major cities',
    source: 'Knight Frank India, 2023',
    icon: TrendingUp,
  },
  {
    id: 'target-market',
    label: 'Target Demographic',
    value: '25-40 years',
    description: 'Young professionals with stable income seeking home ownership alternatives',
    icon: Target,
  },
];

const defaultTractionMetrics: TractionMetric[] = [
  {
    id: 'waitlist',
    label: 'Waitlist Signups',
    value: '500+',
    description: 'Early interest from potential co-owners across Bangalore, Mumbai, and Delhi',
  },
  {
    id: 'partnerships',
    label: 'NBFC Partnerships',
    value: '3',
    description: 'In discussions with leading NBFCs for financing partnerships',
  },
  {
    id: 'legal',
    label: 'Legal Framework',
    value: 'Validated',
    description: 'SPV structure reviewed and approved by legal experts',
  },
  {
    id: 'pilot',
    label: 'Pilot Program',
    value: 'Q2 2024',
    description: 'First cohort of co-owners launching in Bangalore',
  },
];

const Market: React.FC<MarketProps> = ({
  marketStats = defaultMarketStats,
  tractionMetrics = defaultTractionMetrics,
}) => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-4xl md:text-5xl text-gray-900 mb-4">
            Market Opportunity
          </h2>
          <p className="font-sans text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Addressing a massive market need with validated demand
          </p>
        </div>

        {/* Market Statistics - Requirements 8.1, 8.3, 8.5 */}
        <div className="mb-16">
          <h3 className="font-serif font-semibold text-2xl text-gray-900 mb-8 text-center">
            Market Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {marketStats.map((stat) => {
              const Icon = stat.icon;
              
              return (
                <Card key={stat.id} variant="default" className="text-center">
                  {/* Icon */}
                  <div className="mb-4 flex justify-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary-600" aria-hidden="true" />
                    </div>
                  </div>

                  {/* Label */}
                  <p className="font-sans text-sm font-medium text-gray-600 mb-2">
                    {stat.label}
                  </p>

                  {/* Value */}
                  <p className="font-sans font-bold text-3xl text-gray-900 mb-3">
                    {stat.value}
                  </p>

                  {/* Description */}
                  <p className="font-sans text-sm text-gray-600 leading-relaxed mb-3">
                    {stat.description}
                  </p>

                  {/* Source Citation - Requirement 8.3 */}
                  {stat.source && (
                    <p className="font-sans text-xs text-gray-500 italic border-t border-gray-200 pt-3">
                      Source: {stat.source}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Value Proposition Connection - Requirement 8.5 */}
        <div className="mb-16 max-w-4xl mx-auto">
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-8">
            <h3 className="font-serif font-semibold text-2xl text-gray-900 mb-4 text-center">
              Why Bhavan.ai?
            </h3>
            <p className="font-sans text-gray-700 leading-relaxed text-center mb-4">
              With millions of renters unable to afford homes individually and a massive affordability gap, 
              fractional ownership through compliant SPVs offers a practical path to home ownership. 
              Bhavan.ai makes this accessible, legal, and simple.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <p className="font-sans font-bold text-lg text-primary-600 mb-1">Lower Barrier</p>
                <p className="font-sans text-sm text-gray-600">Split down payment 2-5 ways</p>
              </div>
              <div className="text-center">
                <p className="font-sans font-bold text-lg text-primary-600 mb-1">Legal Safety</p>
                <p className="font-sans text-sm text-gray-600">Compliant SPV structure</p>
              </div>
              <div className="text-center">
                <p className="font-sans font-bold text-lg text-primary-600 mb-1">Exit Flexibility</p>
                <p className="font-sans text-sm text-gray-600">Sell shares anytime</p>
              </div>
            </div>
          </div>
        </div>

        {/* Traction Metrics - Requirement 8.2 */}
        <div>
          <h3 className="font-serif font-semibold text-2xl text-gray-900 mb-8 text-center">
            Early Traction
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tractionMetrics.map((metric) => (
              <div 
                key={metric.id} 
                className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center"
              >
                {/* Value */}
                <p className="font-sans font-bold text-4xl text-primary-600 mb-2">
                  {metric.value}
                </p>

                {/* Label */}
                <p className="font-sans font-semibold text-base text-gray-900 mb-2">
                  {metric.label}
                </p>

                {/* Description */}
                <p className="font-sans text-sm text-gray-600 leading-relaxed">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Market;
