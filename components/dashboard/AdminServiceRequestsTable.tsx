'use client';

/**
 * Admin Service Requests Table Component
 * Displays all service requests with filtering, status updates, and provider assignment
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { useState, useEffect, useMemo } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface ServiceRequest {
  id: string;
  reference_number: string;
  service_id: string;
  service_tier_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_requirements: string;
  payment_transaction_id: string | null;
  payment_gateway: string;
  payment_amount: number;
  payment_currency: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_completed_at: number | null;
  status: 'payment_confirmed' | 'pending_contact' | 'team_assigned' | 'in_progress' | 'completed' | 'cancelled';
  assigned_provider_id: string | null;
  affiliate_code: string | null;
  affiliate_id: string | null;
  notes: string | null;
  created_at: number;
  updated_at: number;
  service_name: string;
  service_category: string;
  assigned_provider_name: string | null;
}

interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  role: 'ca' | 'lawyer' | 'admin';
}

interface AdminServiceRequestsTableProps {
  onRefresh?: () => void;
}

export default function AdminServiceRequestsTable({ onRefresh }: AdminServiceRequestsTableProps) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter states
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const limit = 20;

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  // Form states
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNotes, setStatusNotes] = useState('');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');

  /**
   * Fetch service requests with filters
   */
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (serviceTypeFilter !== 'all') {
        params.append('serviceType', serviceTypeFilter);
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (providerFilter !== 'all') {
        params.append('assignedProvider', providerFilter);
      }

      // Add date range filter
      if (dateRangeFilter !== 'all') {
        const now = new Date();
        let startDate: Date;

        switch (dateRangeFilter) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            startDate = new Date(0);
        }

        params.append('startDate', startDate.toISOString());
      }

      const response = await fetch(`/api/admin/services/requests?${params.toString()}`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch service requests');
      }

      setRequests(data.requests || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalRequests(data.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch available service providers
   */
  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.users) {
        // Filter for active CA, lawyer, and admin users
        const serviceProviders = data.users.filter(
          (user: any) =>
            user.status === 'active' && ['ca', 'lawyer', 'admin'].includes(user.role)
        );
        setProviders(serviceProviders);
      }
    } catch (err) {
      console.error('Failed to fetch providers:', err);
    }
  };

  /**
   * Load data on mount and when filters change
   */
  useEffect(() => {
    fetchRequests();
  }, [currentPage, serviceTypeFilter, statusFilter, providerFilter, dateRangeFilter]);

  /**
   * Load providers on mount
   */
  useEffect(() => {
    fetchProviders();
  }, []);

  /**
   * Open detail modal
   */
  const openDetailModal = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  /**
   * Open status update modal
   */
  const openStatusModal = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setStatusNotes('');
    setShowStatusModal(true);
  };

  /**
   * Open provider assignment modal
   */
  const openAssignModal = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setSelectedProviderId(request.assigned_provider_id || '');
    setShowAssignModal(true);
  };

  /**
   * Handle status update
   */
  const handleStatusUpdate = async () => {
    if (!selectedRequest || !newStatus) return;

    if (newStatus === selectedRequest.status) {
      setError('Please select a different status');
      return;
    }

    setActionLoading(selectedRequest.id);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/services/requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: newStatus,
          notes: statusNotes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      setSuccess('Status updated successfully');
      setShowStatusModal(false);
      setSelectedRequest(null);
      fetchRequests();
      onRefresh?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Handle provider assignment
   */
  const handleProviderAssignment = async () => {
    if (!selectedRequest) return;

    if (selectedProviderId === selectedRequest.assigned_provider_id) {
      setError('Please select a different provider');
      return;
    }

    setActionLoading(selectedRequest.id);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/services/requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          assignedProviderId: selectedProviderId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign provider');
      }

      setSuccess('Provider assigned successfully');
      setShowAssignModal(false);
      setSelectedRequest(null);
      fetchRequests();
      onRefresh?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Format price for display
   */
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Format date for display
   */
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Get status badge color
   */
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      payment_confirmed: 'bg-blue-100 text-blue-800',
      pending_contact: 'bg-yellow-100 text-yellow-800',
      team_assigned: 'bg-purple-100 text-purple-800',
      in_progress: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Get payment status badge color
   */
  const getPaymentStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Get status label
   */
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      payment_confirmed: 'Payment Confirmed',
      pending_contact: 'Pending Contact',
      team_assigned: 'Team Assigned',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  /**
   * Get available status transitions
   */
  const getAvailableStatuses = (currentStatus: string): string[] => {
    const transitions: Record<string, string[]> = {
      payment_confirmed: ['pending_contact', 'cancelled'],
      pending_contact: ['team_assigned', 'cancelled'],
      team_assigned: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };
    return transitions[currentStatus] || [];
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Service Requests</h2>
        <Button variant="outline" size="md" onClick={fetchRequests} disabled={loading}>
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Service Type Filter */}
          <div>
            <label htmlFor="serviceTypeFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <select
              id="serviceTypeFilter"
              value={serviceTypeFilter}
              onChange={(e) => {
                setServiceTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Services</option>
              <option value="ca">CA Services</option>
              <option value="legal">Legal Services</option>
              <option value="other">Other Services</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="payment_confirmed">Payment Confirmed</option>
              <option value="pending_contact">Pending Contact</option>
              <option value="team_assigned">Team Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Provider Filter */}
          <div>
            <label htmlFor="providerFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Provider
            </label>
            <select
              id="providerFilter"
              value={providerFilter}
              onChange={(e) => {
                setProviderFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Providers</option>
              <option value="">Unassigned</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name} ({provider.role.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label htmlFor="dateRangeFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              id="dateRangeFilter"
              value={dateRangeFilter}
              onChange={(e) => {
                setDateRangeFilter(e.target.value);
                setCurrentPage(1);
              }}
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
          Showing {requests.length} of {totalRequests} service requests
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

      {/* Service Requests Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2">Loading service requests...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
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
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      No service requests found matching the selected filters
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.reference_number}
                        </div>
                        <div className="text-xs text-gray-500">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusBadge(
                              request.payment_status
                            )}`}
                          >
                            {request.payment_status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {request.customer_name}
                        </div>
                        <div className="text-sm text-gray-500">{request.customer_email}</div>
                        <div className="text-sm text-gray-500">{request.customer_phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.service_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.service_category.toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(request.payment_amount, request.payment_currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                            request.status
                          )}`}
                        >
                          {getStatusLabel(request.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.assigned_provider_name || (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => openDetailModal(request)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        {request.status !== 'completed' && request.status !== 'cancelled' && (
                          <>
                            <button
                              onClick={() => openStatusModal(request)}
                              disabled={actionLoading === request.id}
                              className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                            >
                              Update Status
                            </button>
                            <button
                              onClick={() => openAssignModal(request)}
                              disabled={actionLoading === request.id}
                              className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                            >
                              Assign
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Service Request Details"
      >
        {selectedRequest && (
          <div className="space-y-4">
            {/* Reference and Status */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b">
              <div>
                <p className="text-sm font-medium text-gray-500">Reference Number</p>
                <p className="text-lg font-bold text-gray-900">{selectedRequest.reference_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <span
                  className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadge(
                    selectedRequest.status
                  )}`}
                >
                  {getStatusLabel(selectedRequest.status)}
                </span>
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-2">Customer Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-sm text-gray-900">{selectedRequest.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{selectedRequest.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{selectedRequest.customer_phone}</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-500">Requirements</p>
                <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                  {selectedRequest.customer_requirements}
                </p>
              </div>
            </div>

            {/* Service Information */}
            <div className="pt-4 border-t">
              <h4 className="text-md font-semibold text-gray-900 mb-2">Service Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Service Name</p>
                  <p className="text-sm text-gray-900">{selectedRequest.service_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p className="text-sm text-gray-900">
                    {selectedRequest.service_category.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="pt-4 border-t">
              <h4 className="text-md font-semibold text-gray-900 mb-2">Payment Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="text-sm font-bold text-gray-900">
                    {formatPrice(selectedRequest.payment_amount, selectedRequest.payment_currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Status</p>
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusBadge(
                      selectedRequest.payment_status
                    )}`}
                  >
                    {selectedRequest.payment_status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Gateway</p>
                  <p className="text-sm text-gray-900">{selectedRequest.payment_gateway}</p>
                </div>
                {selectedRequest.payment_transaction_id && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                    <p className="text-sm text-gray-900 font-mono">
                      {selectedRequest.payment_transaction_id}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Assignment Information */}
            <div className="pt-4 border-t">
              <h4 className="text-md font-semibold text-gray-900 mb-2">Assignment</h4>
              <div>
                <p className="text-sm font-medium text-gray-500">Assigned Provider</p>
                <p className="text-sm text-gray-900">
                  {selectedRequest.assigned_provider_name || (
                    <span className="text-gray-400 italic">Not assigned yet</span>
                  )}
                </p>
              </div>
            </div>

            {/* Notes */}
            {selectedRequest.notes && (
              <div className="pt-4 border-t">
                <h4 className="text-md font-semibold text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedRequest.notes}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedRequest.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedRequest.updated_at)}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" size="md" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
              {selectedRequest.status !== 'completed' && selectedRequest.status !== 'cancelled' && (
                <>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setShowDetailModal(false);
                      openStatusModal(selectedRequest);
                    }}
                  >
                    Update Status
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setShowDetailModal(false);
                      openAssignModal(selectedRequest);
                    }}
                  >
                    Assign Provider
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Service Request Status"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Updating status for request: <strong>{selectedRequest.reference_number}</strong>
            </p>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Current Status</p>
              <span
                className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadge(
                  selectedRequest.status
                )}`}
              >
                {getStatusLabel(selectedRequest.status)}
              </span>
            </div>

            <div>
              <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 mb-2">
                New Status *
              </label>
              <select
                id="newStatus"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value={selectedRequest.status}>
                  {getStatusLabel(selectedRequest.status)} (Current)
                </option>
                {getAvailableStatuses(selectedRequest.status).map((status) => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Only valid status transitions are shown
              </p>
            </div>

            <div>
              <label htmlFor="statusNotes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="statusNotes"
                rows={3}
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Add any notes about this status change..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The customer will be automatically notified via email about
                this status change.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" size="md" onClick={() => setShowStatusModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleStatusUpdate}
                loading={actionLoading === selectedRequest.id}
                disabled={
                  actionLoading === selectedRequest.id || newStatus === selectedRequest.status
                }
              >
                Update Status
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Provider Assignment Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Service Provider"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Assigning provider for request: <strong>{selectedRequest.reference_number}</strong>
            </p>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Current Assignment</p>
              <p className="text-sm text-gray-900">
                {selectedRequest.assigned_provider_name || (
                  <span className="text-gray-400 italic">Not assigned</span>
                )}
              </p>
            </div>

            <div>
              <label
                htmlFor="selectedProvider"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Provider *
              </label>
              <select
                id="selectedProvider"
                value={selectedProviderId}
                onChange={(e) => setSelectedProviderId(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Unassigned</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name} - {provider.role.toUpperCase()} ({provider.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> If you assign a provider and the status is "pending_contact",
                it will be automatically updated to "team_assigned".
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" size="md" onClick={() => setShowAssignModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleProviderAssignment}
                loading={actionLoading === selectedRequest.id}
                disabled={
                  actionLoading === selectedRequest.id ||
                  selectedProviderId === selectedRequest.assigned_provider_id
                }
              >
                Assign Provider
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
