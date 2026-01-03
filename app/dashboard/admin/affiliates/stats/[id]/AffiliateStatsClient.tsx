/**
 * Affiliate Statistics Dashboard Client Component
 * 
 * Displays comprehensive performance metrics for a specific affiliate including:
 * - Event counts by type (signups, property contacts, payments)
 * - Date range filtering
 * - Chronological event log
 * 
 * Requirements: 5.1 (total signups), 5.2 (total contacts), 5.3 (chronological order),
 *               5.4 (breakdown by type), 5.5 (date filtering)
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AffiliateStatsDisplay from '@/components/dashboard/AffiliateStatsDisplay';

interface Affiliate {
  id: string;
  name: string;
  description: string | null;
  status: 'active' | 'inactive';
}

interface Stats {
  total_signups: number;
  total_contacts: number;
  total_payments: number;
  total_events: number;
}

interface StatsResponse {
  affiliate: Affiliate;
  stats: Stats;
  filters: {
    start_date: number | null;
    end_date: number | null;
  };
}

export default function AffiliateStatsClient() {
  const [affiliateId, setAffiliateId] = useState<string | null>(null);
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extract affiliate ID from the current URL path
    // URL format: /dashboard/admin/affiliates/stats/[id]
    const path = window.location.pathname;
    const matches = path.match(/\/dashboard\/admin\/affiliates\/stats\/([^\/]+)/);
    const id = matches ? matches[1] : null;

    setAffiliateId(id);

    if (!id) {
      setError('No affiliate ID found in URL');
      setLoading(false);
      return;
    }

    // Fetch stats with the extracted ID
    fetchStats(id);
  }, []); // Run once on mount

  /**
   * Fetch affiliate statistics
   */
  const fetchStats = async (id: string, startDate?: number, endDate?: number) => {
    setLoading(true);
    setError(null);

    try {
      let url = `/api/admin/affiliates/${id}/stats`;
      const params = new URLSearchParams();
      
      if (startDate) {
        params.append('start_date', startDate.toString());
      }
      if (endDate) {
        params.append('end_date', endDate.toString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch affiliate statistics');
      }

      const statsData = await response.json();
      setData(statsData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching affiliate stats:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle filter changes - refetch with new date range
   */
  const handleFilterChange = (startDate?: number, endDate?: number) => {
    if (affiliateId) {
      fetchStats(affiliateId, startDate, endDate);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading affiliate statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          <p className="font-medium">Error loading statistics</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => affiliateId && fetchStats(affiliateId)}
            className="mt-3 text-sm font-medium text-red-900 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          <p className="font-medium">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/dashboard/admin/affiliates"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Affiliates
          </Link>
        </div>
        <h1 className="font-serif font-bold text-4xl text-gray-900 mb-2">
          Affiliate Statistics
        </h1>
        <p className="font-sans text-gray-600">
          Performance metrics and event tracking for {data.affiliate.name}
        </p>
      </div>

      {/* Stats Display Component */}
      <AffiliateStatsDisplay
        affiliate={data.affiliate}
        stats={data.stats}
        filters={data.filters}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}
