'use client';

/**
 * Property Approval Table Component
 * Displays all pending properties with details and approval/rejection actions
 * Allows admins to preview properties, approve them, or reject them with a reason
 */

import { useState } from 'react';
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

interface PropertyApprovalTableProps {
  properties: Property[];
  onRefresh: () => void;
}

export default function PropertyApprovalTable({ properties, onRefresh }: PropertyApprovalTableProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [brokerFilter, setBrokerFilter] = useState<string>('all');

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
  const uniqueBrokers = Array.from(
    new Set(properties.map(p => JSON.stringify({ id: p.broker_id, name: p.broker_name })))
  ).map(str => JSON.parse(str));

  /**
   * Filter properties by broker
   */
  const filteredProperties = brokerFilter === 'all'
    ? properties
    : properties.filter(p => p.broker_id === brokerFilter);

  /**
   * Open property preview modal
   */
  const openPreview = (property: Property) => {
    setSelectedProperty(property);
    setShowPreviewModal(true);
  };

  /**
   * Open reject modal
   */
  const openRejectModal = (property: Property) => {
    setSelectedProperty(property);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  /**
   * Approve a property
   */
  const handleApprove = async (propertyId: string) => {
    if (!confirm('Are you sure you want to approve this property? It will be visible on the public listings page.')) {
      return;
    }

    setLoading(propertyId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/properties/${propertyId}/approve`, {
        method: 'PATCH',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve property');
      }

      setSuccess('Property approved successfully');
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  /**
   * Reject a property with reason
   */
  const handleReject = async () => {
    if (!selectedProperty) return;

    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    setLoading(selectedProperty.id);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/properties/${selectedProperty.id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reason: rejectionReason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject property');
      }

      setSuccess('Property rejected successfully');
      setShowRejectModal(false);
      setSelectedProperty(null);
      setRejectionReason('');
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

  return (
    <div className="space-y-4">
      {/* Header with Filter */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Property Approval</h2>
        <div className="flex items-center space-x-2">
          <label htmlFor="brokerFilter" className="text-sm font-medium text-gray-700">
            Filter by Broker:
          </label>
          <select
            id="brokerFilter"
            value={brokerFilter}
            onChange={(e) => setBrokerFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Brokers</option>
            {uniqueBrokers.map((broker) => (
              <option key={broker.id} value={broker.id}>
                {broker.name}
              </option>
            ))}
          </select>
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
                  Co-owners
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Broker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
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
                    No pending properties found
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{property.co_owner_count}</div>
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
                        onClick={() => openPreview(property)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleApprove(property.id)}
                        disabled={loading === property.id}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => openRejectModal(property)}
                        disabled={loading === property.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Property Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Property Preview"
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
                  <p className="text-sm font-medium text-gray-500">Broker</p>
                  <p className="text-sm text-gray-900">{selectedProperty.broker_name}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowPreviewModal(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setShowPreviewModal(false);
                  handleApprove(selectedProperty.id);
                }}
                loading={loading === selectedProperty.id}
                disabled={loading === selectedProperty.id}
              >
                Approve Property
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setShowPreviewModal(false);
                  openRejectModal(selectedProperty);
                }}
              >
                Reject Property
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Property Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Property"
      >
        {selectedProperty && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              You are about to reject the property: <strong>{selectedProperty.title}</strong>
            </p>
            <p className="text-sm text-gray-600">
              Please provide a reason for rejection. This will be visible to the broker.
            </p>

            <div>
              <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                id="rejectionReason"
                rows={4}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Images are not clear, property details are incomplete, location information is incorrect..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleReject}
                loading={loading === selectedProperty.id}
                disabled={loading === selectedProperty.id || !rejectionReason.trim()}
              >
                Reject Property
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
