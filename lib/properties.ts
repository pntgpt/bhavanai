import { Property } from '@/types';

/**
 * Sample property data for initial launch
 * 
 * This data represents available properties for co-ownership
 * In production, this would be fetched from a database or CMS
 */

export const sampleProperties: Property[] = [
  {
    id: 'prop-001',
    title: 'Modern 3BHK in Whitefield',
    location: 'Whitefield',
    city: 'Bangalore',
    address: 'ITPL Main Road, Whitefield, Bangalore 560066',
    price: 8000000, // 80 Lakhs
    pricePerShare: 2000000, // 20 Lakhs per share
    size: 1450,
    bedrooms: 3,
    bathrooms: 2,
    propertyType: 'apartment',
    totalCoOwnerSlots: 4,
    availableSlots: 4,
    images: ['/images/properties/whitefield-1.jpg'],
    description: 'Spacious 3BHK apartment in the heart of Whitefield tech corridor. Close to major IT parks and excellent connectivity.',
    amenities: ['Gym', 'Swimming Pool', 'Parking', 'Security', 'Power Backup', 'Clubhouse'],
    status: 'available',
    featured: true,
  },
  {
    id: 'prop-002',
    title: 'Luxury 2BHK in Koramangala',
    location: 'Koramangala',
    city: 'Bangalore',
    address: '5th Block, Koramangala, Bangalore 560095',
    price: 12000000, // 1.2 Crores
    pricePerShare: 3000000, // 30 Lakhs per share
    size: 1200,
    bedrooms: 2,
    bathrooms: 2,
    propertyType: 'apartment',
    totalCoOwnerSlots: 4,
    availableSlots: 2,
    images: ['/images/properties/koramangala-1.jpg'],
    description: 'Premium 2BHK in the vibrant Koramangala neighborhood. Walking distance to cafes, restaurants, and shopping.',
    amenities: ['Gym', 'Parking', 'Security', 'Power Backup', 'Lift'],
    status: 'filling',
    featured: true,
  },
  {
    id: 'prop-003',
    title: 'Spacious 4BHK Villa in HSR Layout',
    location: 'HSR Layout',
    city: 'Bangalore',
    address: 'Sector 2, HSR Layout, Bangalore 560102',
    price: 15000000, // 1.5 Crores
    pricePerShare: 3000000, // 30 Lakhs per share
    size: 2200,
    bedrooms: 4,
    bathrooms: 3,
    propertyType: 'villa',
    totalCoOwnerSlots: 5,
    availableSlots: 5,
    images: ['/images/properties/hsr-1.jpg'],
    description: 'Beautiful independent villa with garden space. Perfect for families looking for more space and privacy.',
    amenities: ['Garden', 'Parking', 'Security', 'Power Backup', 'Terrace'],
    status: 'available',
  },
  {
    id: 'prop-004',
    title: 'Cozy 2BHK in Indiranagar',
    location: 'Indiranagar',
    city: 'Bangalore',
    address: '100 Feet Road, Indiranagar, Bangalore 560038',
    price: 10000000, // 1 Crore
    pricePerShare: 2500000, // 25 Lakhs per share
    size: 1100,
    bedrooms: 2,
    bathrooms: 2,
    propertyType: 'apartment',
    totalCoOwnerSlots: 4,
    availableSlots: 1,
    images: ['/images/properties/indiranagar-1.jpg'],
    description: 'Charming apartment in the heart of Indiranagar. Close to metro station and vibrant nightlife.',
    amenities: ['Gym', 'Parking', 'Security', 'Power Backup'],
    status: 'filling',
  },
  {
    id: 'prop-005',
    title: 'Premium 3BHK Penthouse in MG Road',
    location: 'MG Road',
    city: 'Bangalore',
    address: 'MG Road, Bangalore 560001',
    price: 18000000, // 1.8 Crores
    pricePerShare: 4500000, // 45 Lakhs per share
    size: 1800,
    bedrooms: 3,
    bathrooms: 3,
    propertyType: 'penthouse',
    totalCoOwnerSlots: 4,
    availableSlots: 3,
    images: ['/images/properties/mgroad-1.jpg'],
    description: 'Stunning penthouse with panoramic city views. Located in the prime business district with excellent connectivity.',
    amenities: ['Gym', 'Swimming Pool', 'Parking', 'Security', 'Power Backup', 'Clubhouse', 'Terrace'],
    status: 'available',
    featured: true,
  },
  {
    id: 'prop-006',
    title: 'Compact Studio in Electronic City',
    location: 'Electronic City',
    city: 'Bangalore',
    address: 'Phase 1, Electronic City, Bangalore 560100',
    price: 4000000, // 40 Lakhs
    pricePerShare: 1333333, // ~13.33 Lakhs per share
    size: 600,
    bedrooms: 1,
    bathrooms: 1,
    propertyType: 'studio',
    totalCoOwnerSlots: 3,
    availableSlots: 3,
    images: ['/images/properties/ecity-1.jpg'],
    description: 'Efficient studio apartment perfect for young professionals. Close to major tech parks in Electronic City.',
    amenities: ['Parking', 'Security', 'Power Backup', 'Lift'],
    status: 'available',
  },
  {
    id: 'prop-007',
    title: 'Elegant 3BHK in Jayanagar',
    location: 'Jayanagar',
    city: 'Bangalore',
    address: '4th Block, Jayanagar, Bangalore 560011',
    price: 9500000, // 95 Lakhs
    pricePerShare: 2375000, // ~23.75 Lakhs per share
    size: 1350,
    bedrooms: 3,
    bathrooms: 2,
    propertyType: 'apartment',
    totalCoOwnerSlots: 4,
    availableSlots: 0,
    images: ['/images/properties/jayanagar-1.jpg'],
    description: 'Classic apartment in the well-established Jayanagar neighborhood. Great for families with schools and parks nearby.',
    amenities: ['Parking', 'Security', 'Power Backup', 'Lift', 'Garden'],
    status: 'sold',
  },
  {
    id: 'prop-008',
    title: 'Modern 2BHK in Bellandur',
    location: 'Bellandur',
    city: 'Bangalore',
    address: 'Outer Ring Road, Bellandur, Bangalore 560103',
    price: 7500000, // 75 Lakhs
    pricePerShare: 1875000, // 18.75 Lakhs per share
    size: 1050,
    bedrooms: 2,
    bathrooms: 2,
    propertyType: 'apartment',
    totalCoOwnerSlots: 4,
    availableSlots: 4,
    images: ['/images/properties/bellandur-1.jpg'],
    description: 'Contemporary apartment with modern amenities. Excellent connectivity to ORR and tech parks.',
    amenities: ['Gym', 'Swimming Pool', 'Parking', 'Security', 'Power Backup', 'Clubhouse'],
    status: 'available',
  },
];

/**
 * Get all unique cities from properties
 */
export const getAvailableCities = (): string[] => {
  const cities = sampleProperties.map(p => p.city);
  return Array.from(new Set(cities)).sort();
};

/**
 * Get all property types
 */
export const getPropertyTypes = (): Property['propertyType'][] => {
  return ['apartment', 'villa', 'penthouse', 'studio'];
};

/**
 * Filter properties based on criteria
 */
export const filterProperties = (
  properties: Property[],
  filters: {
    city?: string;
    priceRange?: { min: number; max: number };
    propertyType?: Property['propertyType'];
    minBedrooms?: number;
  }
): Property[] => {
  return properties.filter(property => {
    // Filter by city
    if (filters.city && property.city !== filters.city) {
      return false;
    }

    // Filter by price range
    if (filters.priceRange) {
      if (property.price < filters.priceRange.min || property.price > filters.priceRange.max) {
        return false;
      }
    }

    // Filter by property type
    if (filters.propertyType && property.propertyType !== filters.propertyType) {
      return false;
    }

    // Filter by minimum bedrooms
    if (filters.minBedrooms && property.bedrooms < filters.minBedrooms) {
      return false;
    }

    return true;
  });
};

/**
 * Get property by ID
 */
export const getPropertyById = (id: string): Property | undefined => {
  return sampleProperties.find(p => p.id === id);
};
