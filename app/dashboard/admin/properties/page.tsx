/**
 * Admin All Properties Management Page
 * 
 * Displays all properties from all brokers regardless of status.
 * Allows admins to view, edit, and delete any property.
 * Includes filters for status, broker, and date.
 * 
 * Requirements: 25.1, 25.2, 25.3, 25.4, 25.5
 */

'use client';

import { useState, useEffect } from 'react';
import AllPropertiesTable from '@/components/dashboard/AllPropertiesTable';

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  co_owner_count: number;
  images: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  broker_id: string;
  broker_name: string;
  broker_email: string;
  created_at: number;
  updated_at: number;
}

export default function AllPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all properties from API
   */
  const fetchProperties = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/properties', {
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch properties');
      }

      setProperties(data.properties);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load properties on mount
   */
  useEffect(() => {
    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          <p className="font-medium">Error loading properties</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={fetchProperties}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-serif font-bold text-4xl text-gray-900 mb-2">
          All Properties
        </h1>
        <p className="font-sans text-gray-600">
          Manage all property listings across all brokers. Edit or delete any property regardless of status.
        </p>
      </div>

      {/* All Properties Table */}
      <AllPropertiesTable
        properties={properties}
        onRefresh={fetchProperties}
      />

      {/* Info Box */}
      {properties.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
          <p className="font-medium">No properties found</p>
          <p className="text-sm">Properties submitted by brokers will appear here.</p>
        </div>
      )}
    </div>
  );
}
