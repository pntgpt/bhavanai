/**
 * Affiliate Link Generator Component
 * 
 * Provides a UI tool for generating trackable affiliate links with:
 * - Multiple landing page options
 * - Automatic affiliate_id parameter appending
 * - Copy-to-clipboard functionality
 * - Link preview
 * 
 * Requirements: 7.1 (link generator tool), 7.2 (append affiliate_id),
 *               7.3 (different landing pages), 7.4 (display complete URL)
 */

'use client';

import { useState } from 'react';
import Button from '../ui/Button';

interface AffiliateLinkGeneratorProps {
  affiliateId: string;
}

/**
 * Landing page options for affiliate link generation
 * Each option represents a different entry point for affiliate traffic
 */
const LANDING_PAGES = [
  { value: '/', label: 'Home Page', description: 'Main landing page' },
  { value: '/properties', label: 'Properties Listing', description: 'Browse all properties' },
  { value: '/signup', label: 'Signup Page', description: 'Direct to registration' },
  { value: '/faq', label: 'FAQ Page', description: 'Frequently asked questions' },
  { value: '/dashboard/broker/properties/new', label: 'List Property', description: 'For brokers to list properties' },
];

export default function AffiliateLinkGenerator({ affiliateId }: AffiliateLinkGeneratorProps) {
  const [selectedPage, setSelectedPage] = useState('/');
  const [copied, setCopied] = useState(false);

  /**
   * Generates the complete affiliate link with the affiliate_id parameter
   * 
   * Requirements: 7.2 - Append affiliate_id parameter to base URL
   */
  const generateLink = (): string => {
    // Get the base URL (use window.location.origin in browser, fallback for SSR)
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://bhavan.ai';

    // Create URL object with selected landing page
    const url = new URL(selectedPage, baseUrl);
    
    // Append affiliate_id parameter
    url.searchParams.set('affiliate_id', affiliateId);
    
    return url.toString();
  };

  /**
   * Copies the generated link to clipboard
   * 
   * Requirements: 7.4 - Display complete URL for copying
   */
  const handleCopyLink = async () => {
    const link = generateLink();
    
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Failed to copy link to clipboard');
    }
  };

  /**
   * Opens the generated link in a new tab for preview
   */
  const handlePreviewLink = () => {
    const link = generateLink();
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const generatedLink = generateLink();

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Affiliate Link Generator
        </h3>
        <p className="text-sm text-gray-600">
          Generate trackable links for this affiliate to share with different landing pages
        </p>
      </div>

      {/* Landing Page Selection - Requirement 7.3 */}
      <div className="mb-6">
        <label htmlFor="landingPage" className="block text-sm font-medium text-gray-700 mb-2">
          Select Landing Page
        </label>
        <select
          id="landingPage"
          value={selectedPage}
          onChange={(e) => setSelectedPage(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {LANDING_PAGES.map((page) => (
            <option key={page.value} value={page.value}>
              {page.label} - {page.description}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Choose the page where you want to direct affiliate traffic
        </p>
      </div>

      {/* Generated Link Display - Requirement 7.4 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Generated Link
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-50 border border-gray-300 rounded-md px-3 py-2 overflow-x-auto">
            <code className="text-sm text-gray-900 break-all">
              {generatedLink}
            </code>
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          This link includes the affiliate_id parameter for tracking
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={handleCopyLink}
          className="flex items-center gap-2"
        >
          {copied ? (
            <>
              <svg
                className="w-4 h-4"
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
              Copied!
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy Link
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          size="md"
          onClick={handlePreviewLink}
          className="flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          Preview Link
        </Button>
      </div>

      {/* Link Breakdown Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Link Components</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-gray-500 min-w-[100px]">Base URL:</span>
            <span className="text-gray-900 font-mono break-all">
              {typeof window !== 'undefined' ? window.location.origin : 'https://bhavan.ai'}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-500 min-w-[100px]">Landing Page:</span>
            <span className="text-gray-900 font-mono">{selectedPage}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-500 min-w-[100px]">Affiliate ID:</span>
            <span className="text-gray-900 font-mono break-all">{affiliateId}</span>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">How to Use</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Select the landing page where you want to direct traffic</li>
          <li>Copy the generated link and share it with your affiliate partner</li>
          <li>All user actions (signups, property contacts) will be tracked to this affiliate</li>
          <li>The affiliate_id parameter will persist as users navigate the site</li>
        </ul>
      </div>
    </div>
  );
}
