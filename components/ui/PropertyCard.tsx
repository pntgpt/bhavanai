'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Home, Users, Bed, Bath } from 'lucide-react';
import Card from './Card';
import { Property } from '@/types';

/**
 * PropertyCard component for displaying property listings
 * 
 * Shows key property information in a card format:
 * - Property image
 * - Location and title
 * - Price and co-owner slots
 * - Key specs (bedrooms, bathrooms, size)
 * - Status badge
 * 
 * Clicking the card navigates to the property detail page
 * 
 * Requirements: New Feature - Property Listings
 */

export interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  /**
   * Format price in Indian Rupees with Lakhs notation
   */
  const formatPrice = (price: number): string => {
    const lakhs = price / 100000;
    return `₹${lakhs.toFixed(2)}L`;
  };

  /**
   * Get status badge color based on property status
   */
  const getStatusColor = (status: Property['status']): string => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'filling':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get status label text
   */
  const getStatusLabel = (status: Property['status']): string => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'filling':
        return 'Filling Fast';
      case 'sold':
        return 'Sold Out';
      default:
        return status;
    }
  };

  return (
    <Link href={`/properties/${property.id}`}>
      <Card variant="listing" hover className="h-full">
        {/* Property Image */}
        <div className="relative w-full h-48 bg-gray-200 rounded-md overflow-hidden">
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
          
          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
              {getStatusLabel(property.status)}
            </span>
          </div>

          {/* Featured Badge */}
          {property.featured && (
            <div className="absolute top-2 left-2">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-600 text-white">
                Featured
              </span>
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="space-y-2">
          {/* Location */}
          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={16} className="mr-1" />
            <span>{property.location}, {property.city}</span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {property.title}
          </h3>

          {/* Price */}
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-bold text-primary-600">
                {formatPrice(property.price)}
              </p>
              <p className="text-sm text-gray-600">
                {formatPrice(property.pricePerShare)}/share
              </p>
            </div>
          </div>

          {/* Co-owner Slots */}
          <div className="flex items-center text-sm text-gray-700 bg-gray-50 rounded px-2 py-1">
            <Users size={16} className="mr-1" />
            <span>
              {property.availableSlots} of {property.totalCoOwnerSlots} slots available
            </span>
          </div>

          {/* Specs */}
          <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-200">
            <div className="flex items-center">
              <Bed size={16} className="mr-1" />
              <span>{property.bedrooms} Bed</span>
            </div>
            <div className="flex items-center">
              <Bath size={16} className="mr-1" />
              <span>{property.bathrooms} Bath</span>
            </div>
            <div className="flex items-center">
              <Home size={16} className="mr-1" />
              <span>{property.size} sq ft</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default PropertyCard;
