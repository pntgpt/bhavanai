'use client';

import { useEffect, useState } from 'react';
import PropertyDetailClient from './PropertyDetailClient';
import { Property, BrokerProperty } from '@/types';
import { mapDbPropertyToFrontend } from '@/lib/properties';
import { ArrowLeft, Home } from 'lucide-react';
import Button from '@/components/ui/Button';

/**
 * Property Detail Page Component (Client Component)
 * 
 * Fetches property data from D1 database via API on the client side.
 * Only shows approved properties to the public.
 * Extracts property ID from the current URL path for static export compatibility.
 * 
 * Requirements: 24.4 - Display approved properties on public pages
 */

export default function PropertyDetailPage() {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [propertyId, setPropertyId] = useState<string | null>(null);

  useEffect(() => {
    // Extract property ID from the current URL path
    // URL format: /properties/[id]
    const path = window.location.pathname;
    const matches = path.match(/\/properties\/([^\/]+)/);
    const id = matches ? matches[1] : null;

    setPropertyId(id);

    // Skip if no ID
    if (!id) {
      setLoading(false);
      setError(true);
      return;
    }

    /**
     * Fetch property data from API
     */
    async function fetchProperty() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(`/api/properties/${id}`);

        if (!response.ok) {
          setError(true);
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (!data.success || !data.property) {
          setError(true);
          setLoading(false);
          return;
        }

        // Map database property to frontend format
        const mappedProperty = mapDbPropertyToFrontend(data.property as BrokerProperty);
        setProperty(mappedProperty);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError(true);
        setLoading(false);
      }
    }

    fetchProperty();
  }, []); // Run once on mount

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  // Error state (404)
  if (error || !property || !propertyId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <Home size={64} className="mx-auto text-gray-400" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Property Not Found
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            The property you're looking for doesn't exist or is no longer available.
            It may have been removed or is pending approval.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/properties">
              <Button variant="primary" size="lg">
                <ArrowLeft size={20} className="mr-2" />
                View All Properties
              </Button>
            </a>

            <a href="/">
              <Button variant="outline" size="lg">
                <Home size={20} className="mr-2" />
                Go to Homepage
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <PropertyDetailClient property={property} propertyId={propertyId} />;
}
