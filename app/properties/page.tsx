'use client';

import { useEffect, useState } from 'react';
import { MapPin, Home, Users } from 'lucide-react';
import { mapDbPropertyToFrontend } from '@/lib/properties';
import { Property } from '@/types';
import { appendAffiliateId } from '@/lib/affiliate';
import Link from 'next/link';

/**
 * Properties listing page
 * Fetches and displays approved properties from the database
 * 
 * Requirements: 24.4, 24.5 - Only approved properties visible on public page
 */
export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/properties/public')
      .then(response => response.json())
      .then(data => {
        if (data.success && data.properties) {
          const mapped = data.properties.map(mapDbPropertyToFrontend);
          setProperties(mapped);
        } else {
          setError(data.error || 'Failed to load properties');
        }
      })
      .catch(err => {
        console.error('Error fetching properties:', err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /**
   * Format price in Indian Rupees with Lakhs notation
   */
  const formatPrice = (price: number): string => {
    const lakhs = price / 100000;
    return `₹${lakhs.toFixed(2)}L`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Available Properties
          </h1>
          <p className="text-lg text-gray-600">
            Discover co-ownership opportunities in prime locations
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading properties...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Properties Grid */}
        {!loading && !error && (
          <div>
            <p className="text-gray-600 mb-6">
              {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
            </p>

            {properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map(property => (
                  <Link 
                    key={property.id} 
                    href={appendAffiliateId(`/properties/${property.id}/`)}
                    className="block"
                  >
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Property Image */}
                      <div className="relative w-full h-48 bg-gray-200">
                        {property.images && property.images.length > 0 ? (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home size={48} className="text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Available
                          </span>
                        </div>
                      </div>

                      {/* Property Details */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin size={16} className="mr-1" />
                          <span>{property.location}, {property.city}</span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900">
                          {property.title}
                        </h3>

                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatPrice(property.price)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatPrice(property.pricePerShare)}/share
                          </p>
                        </div>

                        <div className="flex items-center text-sm text-gray-700 bg-gray-50 rounded px-2 py-1">
                          <Users size={16} className="mr-1" />
                          <span>
                            {property.availableSlots} of {property.totalCoOwnerSlots} slots available
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Home size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">
                  No properties available at the moment
                </p>
                <p className="text-gray-500 mt-2">
                  Check back soon for new listings
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
