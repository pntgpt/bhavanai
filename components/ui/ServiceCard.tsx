'use client';

import { Service } from '@/types';
import Button from './Button';
import { trackEvent } from '@/lib/analytics';

/**
 * ServiceCard Component
 * 
 * Displays a service offering with pricing, features, and a "Buy Now" button.
 * Implements requirements for service display and navigation.
 * 
 * Features:
 * - Service name and description display
 * - Pricing information with currency formatting
 * - Feature list display
 * - "Buy Now" button with navigation
 * - Analytics tracking for service selection
 * 
 * Requirements: 1.2, 1.3, 2.1, 2.4
 * 
 * @param service - Service data to display
 * @param onBuyNow - Callback function when "Buy Now" is clicked
 */
interface ServiceCardProps {
  service: Service;
  onBuyNow?: (service: Service) => void;
}

/**
 * Formats price with currency symbol
 * 
 * Property 2: Price formatting consistency
 * For any price amount and currency code, the formatted price string SHALL include the currency symbol.
 * 
 * @param amount - Price amount
 * @param currency - Currency code (e.g., 'INR', 'USD')
 * @returns Formatted price string with currency symbol
 */
function formatPrice(amount: number, currency: string): string {
  const currencySymbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };

  const symbol = currencySymbols[currency] || currency;
  
  // Format number with commas for Indian numbering system
  const formattedAmount = amount.toLocaleString('en-IN');
  
  return `${symbol}${formattedAmount}`;
}

/**
 * ServiceCard component
 * Displays a single service with all its details
 */
export function ServiceCard({ service, onBuyNow }: ServiceCardProps) {
  /**
   * Handles "Buy Now" button click
   * Tracks analytics event and calls onBuyNow callback
   * 
   * Property 5: Analytics tracking on service selection
   * For any service selection event, the analytics tracking function SHALL be called 
   * with the correct service identifier and event type.
   * 
   * Requirements: 2.1, 2.4
   */
  const handleBuyNow = () => {
    // Track service selection event
    trackEvent({
      eventName: 'service_selection',
      eventCategory: 'engagement',
      eventLabel: service.id,
      customParams: {
        service_id: service.id,
        service_name: service.name,
        service_category: service.category,
        service_price: service.pricing.amount,
      },
    });

    // Call the onBuyNow callback if provided
    if (onBuyNow) {
      onBuyNow(service);
    }
  };

  /**
   * Property 1: Service card completeness
   * For any service, when rendered as a service card, the output SHALL contain 
   * the service name, brief description, pricing, and a "Buy Now" button.
   * 
   * Requirements: 1.2
   */
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
      {/* Service Name - Requirement 1.2 */}
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        {service.name}
      </h3>

      {/* Service Description - Requirement 1.2 */}
      <p className="text-gray-600 mb-6 flex-grow">
        {service.shortDescription}
      </p>

      {/* Pricing Section - Requirements 1.2, 1.3 */}
      <div className="mb-6">
        <div className="text-3xl font-bold text-primary-600 mb-2">
          {formatPrice(service.pricing.amount, service.pricing.currency)}
        </div>
        {service.pricing.tiers && service.pricing.tiers.length > 0 && (
          <p className="text-sm text-gray-500">
            Starting from • Multiple tiers available
          </p>
        )}
      </div>

      {/* Features List - Requirement 1.2 */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
          Key Features
        </h4>
        <ul className="space-y-2">
          {service.features.slice(0, 4).map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg
                className="w-5 h-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        {service.features.length > 4 && (
          <p className="text-sm text-gray-500 mt-2 ml-7">
            +{service.features.length - 4} more features
          </p>
        )}
      </div>

      {/* Buy Now Button - Requirements 1.2, 2.1 */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleBuyNow}
        className="w-full"
        aria-label={`Buy ${service.name}`}
      >
        Buy Now
      </Button>
    </div>
  );
}
