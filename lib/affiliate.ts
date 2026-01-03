/**
 * Affiliate tracking utilities for URL-based affiliate attribution
 * 
 * This module provides functions to extract, validate, and append affiliate IDs
 * to URLs for tracking affiliate-driven user actions throughout the application.
 */

/**
 * Special affiliate ID used when no affiliate attribution is present
 */
export const NO_AFFILIATE_ID = 'NO_AFFILIATE_ID';

/**
 * Extracts the affiliate_id parameter from the current URL
 * 
 * @returns The affiliate_id from the URL, or null if not present
 * 
 * Requirements: 2.3 - Read affiliate_id from current URL parameter
 */
export function getAffiliateIdFromURL(): string | null {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const url = new URL(window.location.href);
    const affiliateId = url.searchParams.get('affiliate_id');
    
    return affiliateId;
  } catch (error) {
    console.warn('Failed to extract affiliate_id from URL:', error);
    return null;
  }
}

/**
 * Validates whether an affiliate_id has a valid format
 * 
 * Valid affiliate IDs:
 * - Are non-empty strings
 * - Contain only alphanumeric characters, hyphens, and underscores
 * - Are between 1 and 100 characters long
 * - Special case: NO_AFFILIATE_ID is always valid
 * 
 * @param id - The affiliate ID to validate
 * @returns true if the ID format is valid, false otherwise
 * 
 * Requirements: 2.4 - Validate affiliate_id format
 */
export function isValidAffiliateId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }

  // NO_AFFILIATE_ID is always valid
  if (id === NO_AFFILIATE_ID) {
    return true;
  }

  // Check length constraints
  if (id.length < 1 || id.length > 100) {
    return false;
  }

  // Check format: alphanumeric, hyphens, and underscores only
  const validFormat = /^[a-zA-Z0-9_-]+$/;
  return validFormat.test(id);
}

/**
 * Gets the current affiliate_id from the URL, or returns NO_AFFILIATE_ID as default
 * 
 * This function ensures that all tracking events have an affiliate attribution,
 * even when no explicit affiliate_id is present in the URL.
 * 
 * @returns The current affiliate_id or NO_AFFILIATE_ID
 * 
 * Requirements: 2.5 - Associate events with NO_AFFILIATE_ID when no affiliate_id present
 */
export function getCurrentAffiliateId(): string {
  const affiliateId = getAffiliateIdFromURL();
  
  // If no affiliate_id in URL, return default
  if (!affiliateId) {
    return NO_AFFILIATE_ID;
  }

  // If affiliate_id is invalid format, return default
  if (!isValidAffiliateId(affiliateId)) {
    console.warn(`Invalid affiliate_id format: ${affiliateId}, using ${NO_AFFILIATE_ID}`);
    return NO_AFFILIATE_ID;
  }

  return affiliateId;
}

/**
 * Appends the affiliate_id parameter to a URL if one is present in the current context
 * 
 * This function preserves affiliate attribution across navigation by automatically
 * adding the affiliate_id parameter to internal links.
 * 
 * @param url - The URL to append the affiliate_id to
 * @returns The URL with affiliate_id appended, or the original URL if no affiliate_id present
 * 
 * Requirements: 2.1 - Preserve affiliate_id parameter in all internal navigation links
 * Requirements: 2.2 - Append affiliate_id parameter to destination URLs
 */
export function appendAffiliateId(url: string): string {
  if (!url) {
    return url;
  }

  // Don't append to external URLs
  try {
    const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    
    // Check if it's an external URL
    if (typeof window !== 'undefined' && urlObj.origin !== window.location.origin) {
      return url;
    }
  } catch (error) {
    // If URL parsing fails, return original URL
    console.warn('Failed to parse URL for affiliate_id appending:', error);
    return url;
  }

  const affiliateId = getAffiliateIdFromURL();
  
  // If no affiliate_id in current URL, return original URL
  if (!affiliateId) {
    return url;
  }

  // If affiliate_id is invalid, don't append it
  if (!isValidAffiliateId(affiliateId)) {
    return url;
  }

  try {
    // Parse the URL to append the parameter
    const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    
    // Only append if affiliate_id is not already present
    if (!urlObj.searchParams.has('affiliate_id')) {
      urlObj.searchParams.set('affiliate_id', affiliateId);
    }
    
    // Return the full URL if it's absolute, otherwise return pathname + search + hash
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return urlObj.toString();
    } else {
      return urlObj.pathname + urlObj.search + urlObj.hash;
    }
  } catch (error) {
    console.warn('Failed to append affiliate_id to URL:', error);
    return url;
  }
}
