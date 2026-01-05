'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Service } from '@/types';
import ServicePurchaseForm from '@/components/forms/ServicePurchaseForm';
import { getCurrentAffiliateId } from '@/lib/affiliate';

/**
 * ServicePurchasePage Component
 * 
 * Client component that handles the service purchase flow.
 * Fetches service details based on URL parameter and displays purchase form.
 * 
 * Requirements: 2.2, 2.3, 3.1
 */

// Default services data (same as in Services.tsx)
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

export default function ServicePurchasePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const serviceId = searchParams.get('serviceId');

    if (!serviceId) {
      setError('No service selected');
      setLoading(false);
      return;
    }

    // Find service from default data
    // In production, this would fetch from API
    const foundService = DEFAULT_SERVICES.find((s) => s.id === serviceId);

    if (!foundService) {
      setError('Service not found');
      setLoading(false);
      return;
    }

    setService(foundService);
    setLoading(false);
  }, [searchParams]);

  /**
   * Handle successful purchase
   * Navigate to confirmation page
   */
  const handlePurchaseSuccess = (referenceNumber: string) => {
    router.push(`/services/confirmation?ref=${referenceNumber}`);
  };

  /**
   * Handle purchase error
   */
  const handlePurchaseError = (error: string) => {
    // Error is handled within the form component
    console.error('Purchase error:', error);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested service could not be found.'}</p>
          <button
            onClick={() => router.push('/#services')}
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors"
          >
            Browse Services
          </button>
        </div>
      </div>
    );
  }

  // Get affiliate code from URL
  const affiliateCode = getCurrentAffiliateId();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Service Details Header - Requirement 2.3 */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {service.name}
          </h1>
          <p className="text-lg text-gray-600 mb-6">{service.description}</p>

          {/* Features */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What's Included</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {service.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Purchase Form - Requirements 3.1, 3.2, 3.3, 3.5, 4.1, 4.2 */}
        <ServicePurchaseForm
          service={service}
          affiliateCode={affiliateCode !== 'NO_AFFILIATE_ID' ? affiliateCode : undefined}
          onSuccess={handlePurchaseSuccess}
          onError={handlePurchaseError}
        />
      </div>
    </div>
  );
}
