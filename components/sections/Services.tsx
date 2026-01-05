'use client';

import { useRouter } from 'next/navigation';
import { Service } from '@/types';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { appendAffiliateId } from '@/lib/affiliate';

/**
 * ServicesSection Component
 * 
 * Displays available professional services on the home page.
 * Allows customers to browse and select services for purchase.
 * 
 * Features:
 * - Service category display
 * - Service cards with pricing and features
 * - Navigation to purchase flow
 * - Analytics tracking for service selection
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.4
 * 
 * Properties validated:
 * - Property 1: Service card completeness
 * - Property 2: Price formatting consistency
 * - Property 3: Service tier display completeness
 * - Property 4: Service data preservation through navigation
 * - Property 5: Analytics tracking on service selection
 */

interface ServicesSectionProps {
  services?: Service[];
}

/**
 * Default services data
 * This will be replaced with API data in production
 * Based on seed data from migrations/002_seed_initial_services.sql
 */
const DEFAULT_SERVICES: Service[] = [
  {
    id: 'service_ca_001',
    name: 'Chartered Accountant Services',
    description: 'Professional CA services for property transactions, tax planning, and financial compliance. Our experienced chartered accountants provide comprehensive support for all your property-related financial needs, ensuring compliance with tax regulations and optimal financial structuring.',
    shortDescription: 'Expert CA services for property transactions and tax planning',
    category: 'ca',
    pricing: {
      amount: 15000,
      currency: 'INR',
      tiers: [
        {
          id: 'tier_ca_basic',
          name: 'Basic Consultation',
          price: 15000,
          features: [
            'Initial consultation (1 hour)',
            'Tax planning overview',
            'Document review',
            'Email support for 7 days',
          ],
        },
        {
          id: 'tier_ca_standard',
          name: 'Standard Package',
          price: 35000,
          features: [
            'Comprehensive consultation (3 hours)',
            'Detailed tax planning',
            'Complete documentation review',
            'GST and stamp duty calculation',
            'Email and phone support for 30 days',
            'One follow-up session',
          ],
        },
        {
          id: 'tier_ca_premium',
          name: 'Premium Package',
          price: 75000,
          features: [
            'Unlimited consultations for 90 days',
            'End-to-end transaction support',
            'Tax optimization strategies',
            'Complete compliance management',
            'Priority phone and email support',
            'Quarterly review meetings',
            'Capital gains tax filing assistance',
          ],
        },
      ],
    },
    features: [
      'Tax planning and compliance',
      'Property transaction support',
      'Financial structuring advice',
      'GST and stamp duty guidance',
      'Capital gains tax optimization',
      'Documentation review',
    ],
  },
  {
    id: 'service_legal_001',
    name: 'Legal Services for Property',
    description: 'Comprehensive legal services for property co-ownership, including agreement drafting, title verification, and legal compliance. Our experienced property lawyers ensure your co-ownership arrangement is legally sound and protects all parties involved.',
    shortDescription: 'Expert legal services for property co-ownership and transactions',
    category: 'legal',
    pricing: {
      amount: 25000,
      currency: 'INR',
      tiers: [
        {
          id: 'tier_legal_basic',
          name: 'Basic Legal Review',
          price: 25000,
          features: [
            'Document review (up to 10 pages)',
            'Basic title verification',
            'Legal consultation (1 hour)',
            'Email support for 7 days',
          ],
        },
        {
          id: 'tier_legal_standard',
          name: 'Standard Legal Package',
          price: 50000,
          features: [
            'Co-ownership agreement drafting',
            'Comprehensive title verification',
            'Legal consultation (3 hours)',
            'Contract review and negotiation',
            'Email and phone support for 30 days',
            'Registration guidance',
          ],
        },
        {
          id: 'tier_legal_premium',
          name: 'Premium Legal Package',
          price: 100000,
          features: [
            'Complete legal documentation',
            'Full due diligence and title search',
            'Unlimited consultations for 90 days',
            'End-to-end transaction support',
            'Dispute resolution assistance',
            'Priority support',
            'Court representation if needed',
            'Post-transaction support for 6 months',
          ],
        },
      ],
    },
    features: [
      'Co-ownership agreement drafting',
      'Title verification and due diligence',
      'Legal compliance review',
      'Contract negotiation support',
      'Dispute resolution guidance',
      'Registration assistance',
    ],
  },
];

/**
 * ServicesSection component
 * Main section for displaying professional services
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.4
 */
export default function ServicesSection({ services = DEFAULT_SERVICES }: ServicesSectionProps) {
  const router = useRouter();

  /**
   * Handles service purchase navigation
   * Preserves service data and affiliate tracking through navigation
   * 
   * Property 4: Service data preservation through navigation
   * For any service selection, when navigating to the purchase page, 
   * the service type and pricing information SHALL be preserved and accessible.
   * 
   * Requirements: 2.1, 2.2, Affiliate Tracking 2.1, 2.2
   */
  const handleBuyNow = (service: Service) => {
    // Navigate to purchase page with service ID
    // Service data will be fetched on the purchase page using the ID
    // Affiliate ID is automatically preserved via appendAffiliateId
    const purchaseUrl = appendAffiliateId(`/services/purchase?serviceId=${service.id}`);
    router.push(purchaseUrl);
  };

  /**
   * Property 1: Service card completeness
   * For any service, when rendered as a service card, the output SHALL contain 
   * the service name, brief description, pricing, and a "Buy Now" button.
   * 
   * Property 3: Service tier display completeness
   * For any service with multiple tiers, the rendered output SHALL include 
   * all tiers with their respective features and pricing.
   * 
   * Requirements: 1.1, 1.2, 1.4
   */
  return (
    <section
      id="services"
      className="py-16 md:py-24 bg-gray-50"
      aria-labelledby="services-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Requirement 1.1 */}
        <div className="text-center mb-12 md:mb-16">
          <h2
            id="services-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          >
            Professional Services
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Expert CA and legal services to support your property co-ownership journey. 
            Get professional guidance every step of the way.
          </p>
        </div>

        {/* Services Grid - Requirements 1.2, 1.3, 1.4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onBuyNow={handleBuyNow}
            />
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Need help choosing the right service?{' '}
            <a
              href="#contact"
              className="text-primary-600 hover:text-primary-700 font-medium underline"
            >
              Contact our team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
