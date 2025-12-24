'use client';

/**
 * All Properties Table Component
 * Displays all properties from all brokers with comprehensive management features
 * Allows admins to view, edit, and delete any property
 * Includes filters for status, broker, and date range
 * 
 * Requirements: 25.1, 25.2, 25.3, 25.4, 25.5
 */

import { useState, useMemo } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  co_owner_count: number;
  images: string; // JSON string array of R2 URLs
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  broker_id: string;
  broker_name: string;
  broker_email: string;
  created_at: number;
  updated_at: number;
}

interface AllPropertiesTableProps {
  properties: Property[];
  onRefresh: () => void;
}

export default function AllPropertiesTable({ properties, onRefresh }: AllPropertiesTableProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [brokerFilter, setBrokerFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    location: '',
    price: 0,
    co_owner_count: 2,
  });

  /**
   * Parse images from JSON string
   */
  const parseImages = (imagesJson: string): string[] => {
    try {
      return JSON.parse(imagesJson);
    } catch {
      return [];
    }
  };

  /**
   * Get unique brokers for filter dropdown
   */
  const uniqueBrokers = useMemo(() => {
    return Array.from(
      new Set(properties.map(p => JSON.stringify({ id: p.broker_id, name: p.broker_name })))
    ).map(str => JSON.parse(str));
  }, [properties]);

  /**
   * Filter properties based on selected filters
   */
  const filteredProperties = useMemo(() => {
    let filtered = properties;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Broker filter
    if (brokerFilter !== 'all') {
      filtered = filtered.filter(p => p.broker_id === brokerFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000;
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(p => now - p.created_at < dayInMs);
          break;
        case 'week':
          filtered = filtered.filter(p => now - p.created_at < 7 * dayInMs);
          break;
        case 'month':
          filtered = filtered.filter(p => now - p.created_at < 30 * dayInMs);
          break;
      }
    }

    return filtered;
  }, [properties, statusFilter, brokerFilter, dateFilter]);

  /**
   * Open view modal
   */
  const openViewModal = (property: Property) => {
    setSelectedProperty(property);
    setShowViewModal(true);
  };

  /**
   * Open edit modal
   */
  const openEditModal = (property: Property) => {
    setSelectedProperty(property);
    setEditForm({
      title: property.title,
      description: property.description,
      location: property.location,
      price: property.price,
      co_owner_count: property.co_owner_count,
    });
    setShowEditModal(true);
  };

  /**
   * Handle edit form submission
   */
  const handleEdit = async () => {
    if (!selectedProperty) return;

    // Validate form
    if (!editForm.title.trim() || !editForm.description.trim() || !editForm.location.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (editForm.price <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    if (editForm.co_owner_count < 2 || editForm.co_owner_count > 5) {
      setError('Co-owner count must be between 2 and 5');
      return;
    }

    setLoading(selectedProperty.id);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/properties/${selectedProperty.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update property');
      }

      setSuccess('Property updated successfully');
      setShowEditModal(false);
      setSelectedProperty(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  /**
   * Handle property deletion
   */
  const handleDelete = async (propertyId: string, propertyTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${propertyTitle}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(propertyId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete property');
      }

      setSuccess('Property deleted successfully');
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  /**
   * Format price for display
   */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  /**
   * Format date for display
   */
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Get status badge color
   */
  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Broker Filter */}
          <div>
            <label htmlFor="brokerFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Broker
            </label>
            <select
              id="brokerFilter"
              value={brokerFilter}
              onChange={(e) => setBrokerFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Brokers</option>
              {uniqueBrokers.map((broker) => (
                <option key={broker.id} value={broker.id}>
                  {broker.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              id="dateFilter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredProperties.length} of {properties.length} properties
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Properties Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Broker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No properties found matching the selected filters
                  </td>
                </tr>
              ) : (
                filteredProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16">
                          {parseImages(property.images)[0] ? (
                            <img
                              src={parseImages(property.images)[0]}
                              alt={property.title}
                              className="h-16 w-16 rounded object-cover"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{property.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{property.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{property.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatPrice(property.price)}</div>
                      <div className="text-xs text-gray-500">{property.co_owner_count} co-owners</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(property.status)}`}>
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{property.broker_name}</div>
                      <div className="text-sm text-gray-500">{property.broker_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(property.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openViewModal(property)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openEditModal(property)}
                        disabled={loading === property.id}
                        className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(property.id, property.title)}
                        disabled={loading === property.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Property Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Property Details"
      >
        {selectedProperty && (
          <div className="space-y-4">
            {/* Images */}
            {parseImages(selectedProperty.images).length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {parseImages(selectedProperty.images).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${selectedProperty.title} - Image ${index + 1}`}
                    className="w-full h-48 object-cover rounded"
                  />
                ))}
              </div>
            )}

            {/* Property Details */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedProperty.title}</h3>
              <p className="text-gray-600 mb-4">{selectedProperty.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-sm text-gray-900">{selectedProperty.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Price</p>
                  <p className="text-sm text-gray-900">{formatPrice(selectedProperty.price)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Co-owners</p>
                  <p className="text-sm text-gray-900">{selectedProperty.co_owner_count}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(selectedProperty.status)}`}>
                    {selectedProperty.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Broker</p>
                  <p className="text-sm text-gray-900">{selectedProperty.broker_name}</p>
                  <p className="text-xs text-gray-500">{selectedProperty.broker_email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedProperty.created_at)}</p>
                </div>
              </div>

              {selectedProperty.rejection_reason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                  <p className="text-sm text-red-700">{selectedProperty.rejection_reason}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedProperty);
                }}
              >
                Edit Property
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Property Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Property"
      >
        {selectedProperty && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Editing property: <strong>{selectedProperty.title}</strong>
            </p>
            <p className="text-sm text-yellow-600">
              Note: Editing a property will reset its status to pending and require re-approval.
            </p>

            {/* Edit Form */}
            <div className="space-y-4">
              <div>
                <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="editTitle"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="editDescription"
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="editLocation" className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  id="editLocation"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    id="editPrice"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label htmlFor="editCoOwners" className="block text-sm font-medium text-gray-700 mb-1">
                    Co-owners *
                  </label>
                  <select
                    id="editCoOwners"
                    value={editForm.co_owner_count}
                    onChange={(e) => setEditForm({ ...editForm, co_owner_count: Number(e.target.value) })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleEdit}
                loading={loading === selectedProperty.id}
                disabled={loading === selectedProperty.id}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
