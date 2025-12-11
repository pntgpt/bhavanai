/**
 * UTM Parameter Utilities
 * 
 * Provides functions for extracting, storing, and retrieving UTM parameters
 * from URLs. UTM parameters are used for marketing attribution and tracking
 * campaign performance.
 * 
 * These utilities ensure UTM parameters are preserved throughout the user
 * session and included in form submissions for proper attribution.
 */

import { UTMParams } from '@/types';

/**
 * Session storage key for UTM parameters
 */
const UTM_STORAGE_KEY = 'bhavan_utm_params';

/**
 * Extracts UTM parameters from a URL string or URLSearchParams object
 * 
 * @param url - URL string or URLSearchParams object to extract from
 * @returns UTMParams object with extracted parameters
 */
export function extractUTMParams(url: string | URLSearchParams): UTMParams {
  let searchParams: URLSearchParams;

  if (typeof url === 'string') {
    try {
      const urlObj = new URL(url);
      searchParams = urlObj.searchParams;
    } catch {
      // If URL parsing fails, try to parse as query string
      searchParams = new URLSearchParams(url);
    }
  } else {
    searchParams = url;
  }

  const utmParams: UTMParams = {};

  // Extract each UTM parameter if present
  const source = searchParams.get('utm_source');
  const medium = searchParams.get('utm_medium');
  const campaign = searchParams.get('utm_campaign');
  const term = searchParams.get('utm_term');
  const content = searchParams.get('utm_content');

  if (source) utmParams.source = source;
  if (medium) utmParams.medium = medium;
  if (campaign) utmParams.campaign = campaign;
  if (term) utmParams.term = term;
  if (content) utmParams.content = content;

  return utmParams;
}

/**
 * Extracts UTM parameters from the current window location
 * Only works in browser environment
 * 
 * @returns UTMParams object with extracted parameters, or empty object if not in browser
 */
export function extractUTMParamsFromWindow(): UTMParams {
  if (typeof window === 'undefined') {
    return {};
  }

  return extractUTMParams(window.location.search);
}

/**
 * Stores UTM parameters in session storage
 * This allows UTM parameters to persist across page navigations
 * 
 * @param utmParams - UTM parameters to store
 */
export function storeUTMParams(utmParams: UTMParams): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Only store if there are actual parameters
    if (Object.keys(utmParams).length > 0) {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmParams));
    }
  } catch (error) {
    // Silently fail if session storage is not available
    console.warn('Failed to store UTM parameters:', error);
  }
}

/**
 * Retrieves stored UTM parameters from session storage
 * 
 * @returns Stored UTM parameters, or empty object if none found
 */
export function getStoredUTMParams(): UTMParams {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as UTMParams;
    }
  } catch (error) {
    // Silently fail if session storage is not available or JSON is invalid
    console.warn('Failed to retrieve UTM parameters:', error);
  }

  return {};
}

/**
 * Clears stored UTM parameters from session storage
 * Useful for testing or when starting a new session
 */
export function clearStoredUTMParams(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.removeItem(UTM_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear UTM parameters:', error);
  }
}

/**
 * Gets current UTM parameters, preferring URL parameters over stored ones
 * This ensures the most recent UTM parameters are used
 * 
 * @returns Current UTM parameters from URL or session storage
 */
export function getCurrentUTMParams(): UTMParams {
  // First try to get from current URL
  const urlParams = extractUTMParamsFromWindow();
  
  // If URL has UTM params, store them and return
  if (Object.keys(urlParams).length > 0) {
    storeUTMParams(urlParams);
    return urlParams;
  }

  // Otherwise, return stored params
  return getStoredUTMParams();
}

/**
 * Checks if UTM parameters are present
 * 
 * @param utmParams - UTM parameters to check
 * @returns true if any UTM parameter is present, false otherwise
 */
export function hasUTMParams(utmParams: UTMParams): boolean {
  return Object.keys(utmParams).length > 0;
}

/**
 * Formats UTM parameters as a query string
 * Useful for appending to URLs
 * 
 * @param utmParams - UTM parameters to format
 * @returns Query string (without leading ?)
 */
export function formatUTMParamsAsQueryString(utmParams: UTMParams): string {
  const params = new URLSearchParams();

  if (utmParams.source) params.append('utm_source', utmParams.source);
  if (utmParams.medium) params.append('utm_medium', utmParams.medium);
  if (utmParams.campaign) params.append('utm_campaign', utmParams.campaign);
  if (utmParams.term) params.append('utm_term', utmParams.term);
  if (utmParams.content) params.append('utm_content', utmParams.content);

  return params.toString();
}

/**
 * Merges multiple UTM parameter objects
 * Later parameters override earlier ones
 * 
 * @param utmParamsArray - Array of UTM parameter objects to merge
 * @returns Merged UTM parameters
 */
export function mergeUTMParams(...utmParamsArray: UTMParams[]): UTMParams {
  return utmParamsArray.reduce((merged, current) => {
    return { ...merged, ...current };
  }, {} as UTMParams);
}
