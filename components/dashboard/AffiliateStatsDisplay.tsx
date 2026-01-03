'use client';

/**
 * Affiliate Statistics Display Component
 * 
 * Displays comprehensive affiliate performance metrics including:
 * - Summary cards with event counts by type
 * - Date range filtering
 * - Chronological event log with pagination
 * - Breakdown by event type
 * 
 * Requirements: 5.1 (total signups), 5.2 (total contacts), 5.3 (chronological order),
 *               5.4 (breakdown by type), 5.5 (date filtering)
 */

import { useState, useEffect } from 'react';
import Button from '../ui/Button';

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

interface TrackingEvent {
  id: string;
  affiliate_id: string;
  event_type: 'signup' | 'property_contact' | 'payment';
  user_id: string | null;
  property_id: string | null;
  metadata: string | null;
  created_at: number;
}

interface AffiliateStatsDisplayProps {
  affiliate: Affiliate;
  stats: Stats;
  filters: {
    start_date: number | null;
    end_date: number | null;
  };
  onFilterChange: (startDate?: number, endDate?: number) => void;
}

export default function AffiliateStatsDisplay({
  affiliate,
  stats,
  filters,
  onFilterChange,
}: AffiliateStatsDisplayProps) {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  
  // Date filter states
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const [filterError, setFilterError] = useState<string | null>(null);

  /**
   * Fetch tracking events for this affiliate
   */
  const fetchEvents = async () => {
    setEventsLoading(true);
    setEventsError(null);

    try {
      let url = `/api/admin/affiliates/${affiliate.id}/events?limit=50`;
      
      if (eventTypeFilter !== 'all') {
        url += `&event_type=${eventTypeFilter}`;
      }
      
      if (filters.start_date) {
        url += `&start_date=${filters.start_date}`;
      }
      
      if (filters.end_date) {
        url += `&end_date=${filters.end_date}`;
      }

      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (err: any) {
      setEventsError(err.message);
      console.error('Error fetching events:', err);
    } finally {
      setEventsLoading(false);
    }
  };

  // Fetch events when filters change
  useEffect(() => {
    fetchEvents();
  }, [affiliate.id, eventTypeFilter, filters.start_date, filters.end_date]);

  /**
   * Handle date filter application
   */
  const handleApplyDateFilter = () => {
    setFilterError(null);

    let startTimestamp: number | undefined;
    let endTimestamp: number | undefined;

    if (startDateInput) {
      const startDate = new Date(startDateInput);
      if (isNaN(startDate.getTime())) {
        setFilterError('Invalid start date');
        return;
      }
      startTimestamp = Math.floor(startDate.getTime());
    }

    if (endDateInput) {
      const endDate = new Date(endDateInput);
      if (isNaN(endDate.getTime())) {
        setFilterError('Invalid end date');
        return;
      }
      // Set to end of day
      endDate.setHours(23, 59, 59, 999);
      endTimestamp = Math.floor(endDate.getTime());
    }

    if (startTimestamp && endTimestamp && endTimestamp < startTimestamp) {
      setFilterError('End date must be after start date');
      return;
    }

    onFilterChange(startTimestamp, endTimestamp);
  };

  /**
   * Clear date filters
   */
  const handleClearDateFilter = () => {
    setStartDateInput('');
    setEndDateInput('');
    setFilterError(null);
    onFilterChange();
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
   * Format event type for display
   */
  const formatEventType = (type: string) => {
    switch (type) {
      case 'signup':
        return 'User Signup';
      case 'property_contact':
        return 'Property Contact';
      case 'payment':
        return 'Payment';
      default:
        return type;
    }
  };

  /**
   * Get event type badge color
   */
  const getEventTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'signup':
        return 'bg-green-100 text-green-800';
      case 'property_contact':
        return 'bg-blue-100 text-blue-800';
      case 'payment':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Affiliate Info Card */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{affiliate.name}</h2>
            {affiliate.description && (
              <p className="text-gray-600 mb-3">{affiliate.description}</p>
            )}
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-500">Affiliate ID:</span>{' '}
                <span className="font-mono font-medium">{affiliate.id}</span>
              </div>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  affiliate.status
                )}`}
              >
                {affiliate.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Date Range Filter</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDateInput}
              onChange={(e) => setStartDateInput(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDateInput}
              onChange={(e) => setEndDateInput(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end gap-2">
            <Button variant="primary" size="md" onClick={handleApplyDateFilter}>
              Apply Filter
            </Button>
            <Button variant="outline" size="md" onClick={handleClearDateFilter}>
              Clear
            </Button>
          </div>
        </div>
        {filterError && (
          <p className="mt-2 text-sm text-red-600">{filterError}</p>
        )}
        {(filters.start_date || filters.end_date) && (
          <div className="mt-3 text-sm text-gray-600">
            <span className="font-medium">Active filters:</span>{' '}
            {filters.start_date && (
              <span>From {formatDate(filters.start_date)}</span>
            )}
            {filters.start_date && filters.end_date && <span> </span>}
            {filters.end_date && (
              <span>To {formatDate(filters.end_date)}</span>
            )}
          </div>
        )}
      </div>

      {/* Stats Summary Cards - Requirements 5.1, 5.2, 5.4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Events */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_events}</p>
            </div>
            <div className="bg-gray-100 rounded-full p-3">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Signups - Requirement 5.1 */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Signups</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.total_signups}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Property Contacts - Requirement 5.2 */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Property Contacts</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total_contacts}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Payments */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.total_payments}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Event Log - Requirements 5.3 (chronological order), 5.4 (breakdown by type) */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Event Log</h3>
            <div className="flex items-center gap-2">
              <label htmlFor="eventTypeFilter" className="text-sm font-medium text-gray-700">
                Filter by type:
              </label>
              <select
                id="eventTypeFilter"
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Events</option>
                <option value="signup">Signups</option>
                <option value="property_contact">Property Contacts</option>
                <option value="payment">Payments</option>
              </select>
            </div>
          </div>
        </div>

        {eventsLoading ? (
          <div className="px-6 py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        ) : eventsError ? (
          <div className="px-6 py-8">
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              <p className="font-medium">Error loading events</p>
              <p className="text-sm mt-1">{eventsError}</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <p className="text-lg font-medium mb-2">No events found</p>
            <p className="text-sm">
              {eventTypeFilter !== 'all'
                ? `No ${formatEventType(eventTypeFilter).toLowerCase()} events for this affiliate`
                : 'This affiliate has no tracking events yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeBadgeColor(
                          event.event_type
                        )}`}
                      >
                        {formatEventType(event.event_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(event.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      {event.user_id ? (
                        <span className="truncate max-w-xs inline-block" title={event.user_id}>
                          {event.user_id.substring(0, 8)}...
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      {event.property_id ? (
                        <span className="truncate max-w-xs inline-block" title={event.property_id}>
                          {event.property_id.substring(0, 8)}...
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400">
                      <span className="truncate max-w-xs inline-block" title={event.id}>
                        {event.id.substring(0, 8)}...
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
