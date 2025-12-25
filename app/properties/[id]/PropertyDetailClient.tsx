'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Home,
  Bed,
  Bath,
  Users,
  CheckCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Property } from '@/types';
import { getPropertyInquiryMessage, openWhatsApp } from '@/lib/whatsapp';

/**
 * Property Detail Client Component
 * 
 * Client-side component that handles all interactive features:
 * - Image gallery navigation from R2 storage
 * - WhatsApp contact button
 * - Back navigation
 * 
 * Requirements: 24.4 - Display property data from D1 database with R2 images
 */

interface PropertyDetailClientProps {
  property: Property;
  propertyId: string;
}

export default function PropertyDetailClient({ property, propertyId }: PropertyDetailClientProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  /**
   * Navigate to previous image in gallery
   */
  const previousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  /**
   * Navigate to next image in gallery
   */
  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  /**
   * Format price in Indian Rupees with Lakhs/Crores notation
   */
  const formatPrice = (price: number): string => {
    if (price >= 10000000) {
      const crores = price / 10000000;
      return `₹${crores.toFixed(2)} Cr`;
    }
    const lakhs = price / 100000;
    return `₹${lakhs.toFixed(2)} L`;
  };

  /**
   * Handle WhatsApp contact button click
   */
  const handleContactClick = () => {
    const message = getPropertyInquiryMessage(
      propertyId,
      property.address,
      formatPrice(property.price)
    );
    
    openWhatsApp(message);
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status: string): string => {
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
   * Get status label
   */
  const getStatusLabel = (status: string): string => {
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

  /**
   * Get image URL from R2 storage
   * Handles both local development URLs (/images/key) and production R2 URLs
   */
  const getImageUrl = (imageUrl: string): string => {
    // Images can be either local URLs or full R2 public URLs
    return imageUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/properties')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Back to properties"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span>Back to Properties</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card variant="default" className="p-0 overflow-hidden">
              <div className="relative w-full h-96 bg-gray-200">
                {property.images && property.images.length > 0 ? (
                  <>
                    <img
                      src={getImageUrl(property.images[currentImageIndex])}
                      alt={`${property.title} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Image Navigation */}
                    {property.images.length > 1 && (
                      <>
                        <button
                          onClick={previousImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                          aria-label="Previous image"
                        >
                          <ChevronLeft size={24} className="text-gray-900" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                          aria-label="Next image"
                        >
                          <ChevronRight size={24} className="text-gray-900" />
                        </button>
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {property.images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home size={64} className="text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Thumbnail Strip */}
              {property.images && property.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? 'border-primary-600'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      aria-label={`View image ${index + 1}`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Property Description */}
            <Card variant="default">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About This Property
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {property.description}
              </p>
            </Card>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card variant="default">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center text-gray-700"
                    >
                      <CheckCircle size={20} className="text-green-600 mr-2 flex-shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Neighborhood Info */}
            <Card variant="default">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Neighborhood
              </h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin size={20} className="text-primary-600 mr-2 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p className="text-gray-600">{property.address}</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {property.location} is a prime location in {property.city} with excellent connectivity,
                  nearby amenities, and a vibrant community. Perfect for professionals and families alike.
                </p>
              </div>
            </Card>

            {/* Investment Details */}
            <Card variant="default">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Investment Details
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Property Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(property.price)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Price Per Share</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {formatPrice(property.pricePerShare)}
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What's Included
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <CheckCircle size={18} className="text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Legal SPV formation and documentation</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={18} className="text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Property management services</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={18} className="text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Exit marketplace access</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={18} className="text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Transparent 5% transaction fee (inclusive of all legal and broker costs)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Sticky Summary Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card variant="default">
                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(property.status)}`}>
                    {getStatusLabel(property.status)}
                  </span>
                  {property.featured && (
                    <span className="inline-block ml-2 px-3 py-1 rounded-full text-sm font-medium bg-primary-600 text-white">
                      Featured
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h1>

                {/* Location */}
                <div className="flex items-center text-gray-600 mb-6">
                  <MapPin size={18} className="mr-1" />
                  <span>{property.location}, {property.city}</span>
                </div>

                {/* Price */}
                <div className="bg-primary-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Starting from</p>
                  <p className="text-3xl font-bold text-primary-600 mb-1">
                    {formatPrice(property.pricePerShare)}
                  </p>
                  <p className="text-sm text-gray-600">per co-owner share</p>
                </div>

                {/* Key Specs */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Bed size={24} className="mx-auto mb-1 text-gray-600" />
                    <p className="text-sm text-gray-600">Bedrooms</p>
                    <p className="font-semibold text-gray-900">{property.bedrooms}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Bath size={24} className="mx-auto mb-1 text-gray-600" />
                    <p className="text-sm text-gray-600">Bathrooms</p>
                    <p className="font-semibold text-gray-900">{property.bathrooms}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Home size={24} className="mx-auto mb-1 text-gray-600" />
                    <p className="text-sm text-gray-600">Size</p>
                    <p className="font-semibold text-gray-900">{property.size} sq ft</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Users size={24} className="mx-auto mb-1 text-gray-600" />
                    <p className="text-sm text-gray-600">Co-owners</p>
                    <p className="font-semibold text-gray-900">{property.totalCoOwnerSlots}</p>
                  </div>
                </div>

                {/* Availability */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Available Slots</span>
                    <span className="font-semibold text-gray-900">
                      {property.availableSlots} of {property.totalCoOwnerSlots}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(property.availableSlots / property.totalCoOwnerSlots) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Contact CTA */}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleContactClick}
                  className="w-full"
                  disabled={property.status === 'sold'}
                >
                  <MessageCircle size={20} className="mr-2" />
                  {property.status === 'sold' ? 'Sold Out' : 'Contact Us on WhatsApp'}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Get instant responses to your queries
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
