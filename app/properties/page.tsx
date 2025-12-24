'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import PropertyCard from '@/components/ui/PropertyCard';
import Button from '@/components/ui/Button';
import { getPropertyTypes, filterProperties, mapDbPropertyToFrontend } from '@/lib/properties';
import { Property, PropertyType } from '@/types';

/**
 * Properties listing page with filtering capabilities
 * 
 * Features:
 * - Grid layout of property cards
 * - Filter by city, price range, property type, and bedrooms
 * - Responsive design for mobile and desktop
 * - Shows count of available properties
 * - Mobile-friendly filter drawer
 * - Fetches only approved properties from D1 database
 * - Loads images from R2 storage
 * 
 * Requirements: 24.4, 24.5 - Only approved properties visible on public page
 */

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<{
    city: string;
    priceRange: { min: number; max: number };
    propertyType: string;
    minBedrooms: string;
  }>({
    city: '',
    priceRange: { min: 0, max: 20000000 },
    propertyType: '',
    minBedrooms: '',
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const propertyTypes = getPropertyTypes();

  /**
   * Fetch approved properties from the API
   */
  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/properties/public');
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch properties');
        }
        
        // Map database properties to frontend format
        const mappedProperties = data.properties.map(mapDbPropertyToFrontend);
        setProperties(mappedProperties);
      } catch (err: any) {
        console.error('Error fetching properties:', err);
        setError(err.message || 'Failed to load properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProperties();
  }, []);

  /**
   * Get unique cities from loaded properties
   */
  const cities = useMemo(() => {
    const citySet = new Set(properties.map(p => p.city));
    return Array.from(citySet).sort();
  }, [properties]);

  /**
   * Filter properties based on current filter state
   */
  const filteredProperties = useMemo(() => {
    return filterProperties(properties, {
      city: filters.city || undefined,
      priceRange: filters.priceRange,
      propertyType: filters.propertyType as PropertyType || undefined,
      minBedrooms: filters.minBedrooms ? parseInt(filters.minBedrooms) : undefined,
    });
  }, [properties, filters]);

  /**
   * Reset all filters
   */
  const resetFilters = () => {
    setFilters({
      city: '',
      priceRange: { min: 0, max: 20000000 },
      propertyType: '',
      minBedrooms: '',
    });
  };

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = filters.city || filters.propertyType || filters.minBedrooms;

  /**
   * Format price in Lakhs
   */
  const formatPriceInLakhs = (price: number): string => {
    return `₹${(price / 100000).toFixed(0)}L`;
  };

  /**
   * Render filter controls
   */
  const FilterControls = () => (
    <div className="space-y-4">
      {/* City Filter */}
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
          City
        </label>
        <select
          id="city"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Cities</option>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Property Type Filter */}
      <div>
        <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
          Property Type
        </label>
        <select
          id="propertyType"
          value={filters.propertyType}
          onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Types</option>
          {propertyTypes.map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Bedrooms Filter */}
      <div>
        <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
          Minimum Bedrooms
        </label>
        <select
          id="bedrooms"
          value={filters.minBedrooms}
          onChange={(e) => setFilters({ ...filters, minBedrooms: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </div>

      {/* Price Range Filter */}
      <div>
        <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">
          Price Range: {formatPriceInLakhs(filters.priceRange.min)} - {formatPriceInLakhs(filters.priceRange.max)}
        </label>
        <input
          type="range"
          id="priceRange"
          min="0"
          max="20000000"
          step="500000"
          value={filters.priceRange.max}
          onChange={(e) => setFilters({
            ...filters,
            priceRange: { min: 0, max: parseInt(e.target.value) }
          })}
          className="w-full"
        />
      </div>

      {/* Reset Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={resetFilters}
          className="w-full"
        >
          Reset Filters
        </Button>
      )}
    </div>
  );

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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading properties...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 mb-4">{error}</p>
            <Button
              variant="primary"
              size="md"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Properties Content */}
        {!loading && !error && (
          <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Filters
              </h2>
              <FilterControls />
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowMobileFilters(true)}
              className="w-full"
            >
              <Filter size={20} className="mr-2" />
              Filters {hasActiveFilters && `(${Object.values(filters).filter(v => v && v !== '').length})`}
            </Button>
          </div>

          {/* Mobile Filters Drawer */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={() => setShowMobileFilters(false)}
              />

              {/* Drawer */}
              <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Filters
                  </h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close filters"
                  >
                    <X size={24} />
                  </button>
                </div>
                <FilterControls />
                <div className="mt-6">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Properties Grid */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
              </p>
            </div>

            {/* Properties Grid */}
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-600 text-lg mb-4">
                  No properties match your filters
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
          </div>
        )}
      </div>
    </div>
  );
}
