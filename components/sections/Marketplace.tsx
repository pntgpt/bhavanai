'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { ArrowRightLeft, TrendingUp, Clock } from 'lucide-react';

/**
 * Marketplace Section Component
 * 
 * Explains the exit process and marketplace functionality:
 * - How the exit process works
 * - Trading fees structure
 * - Mockup of a listing card showing shares for sale
 * - Liquidity options available to co-owners
 * - Timeline and process for selling shares
 * 
 * Provides transparency about the secondary market and exit options
 * for co-owners who need liquidity.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

export interface FeeStructure {
  platformFee: string;
  transactionFee: string;
}

export interface ListingCard {
  shares: number;
  pricePerShare: number;
  seller: string;
  propertyAddress: string;
}

export interface MarketplaceProps {
  exitProcess?: string[];
  fees?: FeeStructure;
  mockListing?: ListingCard;
}

const defaultExitProcess = [
  'List your shares on the marketplace with your desired price',
  'Buyers browse available shares and make offers',
  'Accept an offer and initiate the transfer process',
  'Complete KYC verification for the new co-owner',
  'Transfer shares through the SPV with legal documentation',
  'Receive payment via secure escrow within 5-7 business days',
];

const defaultFees: FeeStructure = {
  platformFee: '2% of transaction value',
  transactionFee: '1% processing fee',
};

const defaultMockListing: ListingCard = {
  shares: 2,
  pricePerShare: 1250000,
  seller: 'Anonymous Seller',
  propertyAddress: '3BHK, Whitefield, Bangalore',
};

const Marketplace: React.FC<MarketplaceProps> = ({
  exitProcess = defaultExitProcess,
  fees = defaultFees,
  mockListing = defaultMockListing,
}) => {
  /**
   * Format currency in Indian Rupees
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-4xl md:text-5xl text-gray-900 mb-4">
            Exit Marketplace
          </h2>
          <p className="font-sans text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Flexible liquidity options when you need to sell your shares
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Exit Process - Requirements 6.1, 6.5 */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                <ArrowRightLeft className="w-6 h-6 text-primary-600" aria-hidden="true" />
              </div>
              <h3 className="font-serif font-semibold text-2xl text-gray-900">
                How Exit Works
              </h3>
            </div>
            
            <ol className="space-y-4">
              {exitProcess.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="font-sans text-gray-700 leading-relaxed pt-1">
                    {step}
                  </p>
                </li>
              ))}
            </ol>

            {/* Timeline - Requirement 6.5 */}
            <div className="mt-6 flex items-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
              <Clock className="w-5 h-5 text-primary-600 mr-2 flex-shrink-0" aria-hidden="true" />
              <span>
                <strong>Typical timeline:</strong> 5-7 business days from offer acceptance to payment
              </span>
            </div>
          </div>

          {/* Fee Structure - Requirement 6.2 */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                <TrendingUp className="w-6 h-6 text-primary-600" aria-hidden="true" />
              </div>
              <h3 className="font-serif font-semibold text-2xl text-gray-900">
                Trading Fees
              </h3>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-sans font-medium text-gray-900">Platform Fee</span>
                  <span className="font-sans font-semibold text-primary-600">{fees.platformFee}</span>
                </div>
                <p className="text-sm text-gray-600">
                  Covers marketplace operations and legal documentation
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-sans font-medium text-gray-900">Transaction Fee</span>
                  <span className="font-sans font-semibold text-primary-600">{fees.transactionFee}</span>
                </div>
                <p className="text-sm text-gray-600">
                  Payment processing and escrow services
                </p>
              </div>
            </div>

            {/* Liquidity Note - Requirement 6.4 */}
            <div className="bg-primary-50 border border-primary-200 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong className="text-primary-900">Liquidity options:</strong> Sell partial or full shares, 
                set your own price, or accept offers from interested buyers. No lock-in period required.
              </p>
            </div>
          </div>
        </div>

        {/* Mock Listing Card - Requirement 6.3 */}
        <div className="max-w-2xl mx-auto">
          <h3 className="font-serif font-semibold text-xl text-gray-900 mb-4 text-center">
            Example Listing
          </h3>
          <Card variant="listing" className="shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-serif font-semibold text-lg text-gray-900 mb-1">
                  {mockListing.propertyAddress}
                </h4>
                <p className="text-sm text-gray-600">
                  Listed by {mockListing.seller}
                </p>
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                Available
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">Shares Available</p>
                <p className="font-sans font-bold text-2xl text-gray-900">
                  {mockListing.shares}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Price per Share</p>
                <p className="font-sans font-bold text-2xl text-primary-600">
                  {formatCurrency(mockListing.pricePerShare)}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total Value</span>
                <span className="font-sans font-bold text-lg text-gray-900">
                  {formatCurrency(mockListing.shares * mockListing.pricePerShare)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Marketplace;
