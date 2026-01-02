import { Property, BrokerProperty, PropertyType } from '@/types';

/**
 * Property utility functions
 * 
 * Provides helper functions for property data manipulation,
 * filtering, and mapping between database and frontend formats
 */

/**
 * Map database property format to frontend Property interface
 * Handles the conversion from D1 database structure to the frontend format
 * 
 * @param dbProperty - Property from D1 database
 * @returns Property in frontend format
 */
export function mapDbPropertyToFrontend(dbProperty: BrokerProperty): Property {
  // Parse images from JSON string
  const images = typeof dbProperty.images === 'string' 
    ? JSON.parse(dbProperty.images) 
    : dbProperty.images;

  // Calculate price per share
  const pricePerShare = dbProperty.price / dbProperty.co_owner_count;

  // Extract city from location (assuming format "Area, City")
  // If no comma, use the whole location as both area and city
  const locationParts = dbProperty.location.split(',').map(s => s.trim());
  const city = locationParts.length > 1 ? locationParts[locationParts.length - 1] : locationParts[0];
  const area = locationParts.length > 1 ? locationParts.slice(0, -1).join(', ') : '';

  return {
    id: dbProperty.id,
    title: dbProperty.title,
    location: area || city, // Use area if available, otherwise city
    city: city,
    address: dbProperty.location, // Full location as address
    price: dbProperty.price,
    pricePerShare: pricePerShare,
    size: 1200, // Default size - not in DB schema yet
    bedrooms: 2, // Default bedrooms - not in DB schema yet
    bathrooms: 2, // Default bathrooms - not in DB schema yet
    propertyType: 'apartment' as PropertyType, // Default type - not in DB schema yet
    totalCoOwnerSlots: dbProperty.co_owner_count,
    availableSlots: dbProperty.co_owner_count, // All slots available for approved properties
    images: images,
    description: dbProperty.description,
    amenities: [], // Not in DB schema yet
    status: 'available', // Approved properties are available
    featured: false, // Not in DB schema yet
  };
}

/**
 * Get all property types
 */
export const getPropertyTypes = (): PropertyType[] => {
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
    propertyType?: PropertyType;
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
 * Get property by ID (deprecated - use API instead)
 * Kept for backward compatibility
 */
export const getPropertyById = (id: string): Property | undefined => {
  console.warn('getPropertyById is deprecated. Use API endpoint /api/properties/[id] instead');
  return undefined;
};
