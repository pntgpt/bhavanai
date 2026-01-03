/**
 * Admin Affiliate Management Page
 * 
 * Provides interface for administrators to create, view, edit, and deactivate
 * affiliate partners. Displays all affiliates with their metadata and status.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.5
 */

'use client';

import { useState, useEffect } from 'react';
import AffiliateManagementTable from '@/components/dashboard/AffiliateManagementTable';

interface Affiliate {
  id: string;
  name: string;
  description: string | null;
  status: 'active' | 'inactive';
  created_at: number;
  updated_at: number;
}

export default function AffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all affiliates from the API
   */
  const fetchAffiliates = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/affiliates', {
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch affiliates');
      }

      const data = await response.json();
      setAffiliates(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching affiliates:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch affiliates on mount
  useEffect(() => {
    fetchAffiliates();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading affiliates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          <p className="font-medium">Error loading affiliates</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchAffiliates}
            className="mt-3 text-sm font-medium text-red-900 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-serif font-bold text-4xl text-gray-900 mb-2">
          Affiliate Management
        </h1>
        <p className="font-sans text-gray-600">
          Create and manage affiliate partners to track referrals, signups, and conversions.
        </p>
      </div>

      {/* Affiliate Management Table */}
      <AffiliateManagementTable 
        affiliates={affiliates} 
        onRefresh={fetchAffiliates} 
      />

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">About Affiliate Tracking</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            Affiliates are partners who promote Bhavan.ai and drive traffic to the platform. 
            Each affiliate receives a unique ID that can be used in tracking links.
          </p>
          <p>
            When users access the site via an affiliate link (e.g., <code className="bg-blue-100 px-1 rounded">?affiliate_id=ABC123</code>), 
            their actions (signups, property contacts) are attributed to that affiliate.
          </p>
          <p>
            <strong>Active affiliates</strong> can receive new tracking events. 
            <strong> Inactive affiliates</strong> will not receive new tracking events, but historical data is preserved.
          </p>
        </div>
      </div>
    </div>
  );
}
