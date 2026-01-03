'use client';

/**
 * Affiliate Management Table Component
 * 
 * Displays all affiliates with actions for create, edit, and deactivate.
 * Provides comprehensive affiliate management interface for administrators.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.5
 */

import { useState } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface Affiliate {
  id: string;
  name: string;
  description: string | null;
  status: 'active' | 'inactive';
  created_at: number;
  updated_at: number;
}

interface AffiliateManagementTableProps {
  affiliates: Affiliate[];
  onRefresh: () => void;
}

export default function AffiliateManagementTable({ 
  affiliates, 
  onRefresh 
}: AffiliateManagementTableProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  
  // Form states
  const [createForm, setCreateForm] = useState({
    id: '',
    name: '',
    description: '',
  });
  
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
  });

  /**
   * Create a new affiliate
   */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!createForm.name.trim()) {
      setError('Affiliate name is required');
      return;
    }

    // Validate affiliate ID if provided
    if (createForm.id.trim()) {
      if (!/^[a-zA-Z0-9_-]+$/.test(createForm.id.trim())) {
        setError('Affiliate ID can only contain letters, numbers, hyphens, and underscores');
        return;
      }
      if (createForm.id.trim().length > 50) {
        setError('Affiliate ID must be 50 characters or less');
        return;
      }
    }

    setLoading('create');
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/affiliates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          id: createForm.id.trim() || undefined,
          name: createForm.name.trim(),
          description: createForm.description.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create affiliate');
      }

      setSuccess(`Affiliate "${data.name}" created successfully with ID: ${data.id}`);
      setShowCreateModal(false);
      setCreateForm({ id: '', name: '', description: '' });
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  /**
   * Open edit modal with affiliate data
   */
  const openEditModal = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setEditForm({
      name: affiliate.name,
      description: affiliate.description || '',
      status: affiliate.status,
    });
    setShowEditModal(true);
  };

  /**
   * Update an existing affiliate
   */
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAffiliate) return;

    // Validate form
    if (!editForm.name.trim()) {
      setError('Affiliate name is required');
      return;
    }

    setLoading(selectedAffiliate.id);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/affiliates/${selectedAffiliate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: editForm.name.trim(),
          description: editForm.description.trim() || undefined,
          status: editForm.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update affiliate');
      }

      setSuccess(`Affiliate "${data.name}" updated successfully`);
      setShowEditModal(false);
      setSelectedAffiliate(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  /**
   * Deactivate an affiliate
   */
  const handleDeactivate = async (affiliate: Affiliate) => {
    if (!confirm(`Are you sure you want to deactivate "${affiliate.name}"? New tracking events will not be associated with this affiliate.`)) {
      return;
    }

    setLoading(affiliate.id);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/affiliates/${affiliate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'inactive',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to deactivate affiliate');
      }

      setSuccess(`Affiliate "${affiliate.name}" deactivated successfully`);
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  /**
   * Reactivate an affiliate
   */
  const handleReactivate = async (affiliate: Affiliate) => {
    setLoading(affiliate.id);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/affiliates/${affiliate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'active',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reactivate affiliate');
      }

      setSuccess(`Affiliate "${affiliate.name}" reactivated successfully`);
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  /**
   * Delete an affiliate
   */
  const handleDelete = async (affiliate: Affiliate) => {
    if (!confirm(`Are you sure you want to delete "${affiliate.name}"? This action cannot be undone and will affect historical tracking data.`)) {
      return;
    }

    setLoading(affiliate.id);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/affiliates/${affiliate.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete affiliate');
      }

      setSuccess(`Affiliate "${affiliate.name}" deleted successfully`);
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
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
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter out NO_AFFILIATE_ID from display
  const displayAffiliates = affiliates.filter(a => a.id !== 'NO_AFFILIATE_ID');

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Affiliate Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage affiliate partners for tracking referrals and conversions
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setShowCreateModal(true)}
        >
          Create Affiliate
        </Button>
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

      {/* Affiliates Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Affiliate ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              {displayAffiliates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <p className="text-lg font-medium mb-2">No affiliates yet</p>
                      <p className="text-sm mb-4">Create your first affiliate to start tracking referrals</p>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowCreateModal(true)}
                      >
                        Create Affiliate
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                displayAffiliates.map((affiliate) => (
                  <tr key={affiliate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{affiliate.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{affiliate.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {affiliate.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          affiliate.status
                        )}`}
                      >
                        {affiliate.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(affiliate.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openEditModal(affiliate)}
                        disabled={loading === affiliate.id}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      >
                        Edit
                      </button>
                      {affiliate.status === 'active' ? (
                        <button
                          onClick={() => handleDeactivate(affiliate)}
                          disabled={loading === affiliate.id}
                          className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(affiliate)}
                          disabled={loading === affiliate.id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          Reactivate
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(affiliate)}
                        disabled={loading === affiliate.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        Delete
                      </button>
                      <a
                        href={`/dashboard/admin/affiliates/${affiliate.id}/stats`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Stats
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Affiliate Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Affiliate"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="createId" className="block text-sm font-medium text-gray-700">
              Affiliate ID (Optional)
            </label>
            <input
              type="text"
              id="createId"
              value={createForm.id}
              onChange={(e) => setCreateForm({ ...createForm, id: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono"
              placeholder="e.g., partner-agency-2024"
              maxLength={50}
              pattern="[a-zA-Z0-9_-]*"
            />
            <p className="mt-1 text-xs text-gray-500">
              Custom ID for the affiliate (letters, numbers, hyphens, underscores only). Leave blank to auto-generate.
            </p>
          </div>

          <div>
            <label htmlFor="createName" className="block text-sm font-medium text-gray-700">
              Affiliate Name *
            </label>
            <input
              type="text"
              id="createName"
              required
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Partner Marketing Agency"
              maxLength={100}
            />
            <p className="mt-1 text-xs text-gray-500">
              A descriptive name for the affiliate partner (1-100 characters)
            </p>
          </div>

          <div>
            <label htmlFor="createDescription" className="block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <textarea
              id="createDescription"
              rows={3}
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Additional details about this affiliate partnership..."
              maxLength={500}
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional notes about the affiliate relationship (max 500 characters)
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading === 'create'}
              disabled={loading === 'create'}
            >
              Create Affiliate
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Affiliate Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Affiliate"
      >
        {selectedAffiliate && (
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">
                Affiliate ID: <span className="font-mono font-medium">{selectedAffiliate.id}</span>
              </p>
            </div>

            <div>
              <label htmlFor="editName" className="block text-sm font-medium text-gray-700">
                Affiliate Name *
              </label>
              <input
                type="text"
                id="editName"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                id="editDescription"
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                maxLength={500}
              />
            </div>

            <div>
              <label htmlFor="editStatus" className="block text-sm font-medium text-gray-700">
                Status *
              </label>
              <select
                id="editStatus"
                required
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    status: e.target.value as 'active' | 'inactive',
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Inactive affiliates cannot receive new tracking events
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading === selectedAffiliate.id}
                disabled={loading === selectedAffiliate.id}
              >
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
