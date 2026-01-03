/**
 * Admin affiliate events API endpoint
 * Returns tracking events for a specific affiliate with filtering and pagination
 * Requirements: 5.3 (chronological order), 5.4 (breakdown by type), 5.5 (date filtering)
 */

import { requireRole } from '../../../../lib/auth';
import {
  getAffiliateById,
  getTrackingEvents,
} from '../../../../lib/db';

interface Env {
  DB: D1Database;
}

/**
 * GET /api/admin/affiliates/[id]/events
 * Get tracking events for a specific affiliate
 * Query parameters:
 *   - event_type: Filter by event type (optional)
 *   - start_date: Unix timestamp (optional) - filter events from this date
 *   - end_date: Unix timestamp (optional) - filter events until this date
 *   - limit: Number of events to return (optional, default 50)
 *   - offset: Pagination offset (optional, default 0)
 * 
 * Returns:
 *   - events: Array of tracking events ordered by created_at DESC (Requirement 5.3)
 *   - total: Total count of events matching filters
 */
export async function onRequestGet(context: {
  request: Request;
  env: Env;
  params: { id: string };
}) {
  const { request, env, params } = context;

  try {
    // Require admin role
    await requireRole(request, env.DB, ['admin']);

    const affiliateId = params.id;

    // Check if affiliate exists
    const affiliate = await getAffiliateById(env.DB, affiliateId);
    if (!affiliate) {
      return new Response(JSON.stringify({ error: 'Affiliate not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const eventTypeParam = url.searchParams.get('event_type');
    const startDateParam = url.searchParams.get('start_date');
    const endDateParam = url.searchParams.get('end_date');
    const limitParam = url.searchParams.get('limit');
    const offsetParam = url.searchParams.get('offset');

    // Validate event type (Requirement 5.4 - breakdown by type)
    let eventType: 'signup' | 'property_contact' | 'payment' | undefined;
    if (eventTypeParam) {
      if (!['signup', 'property_contact', 'payment'].includes(eventTypeParam)) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid event_type. Must be one of: signup, property_contact, payment' 
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      eventType = eventTypeParam as 'signup' | 'property_contact' | 'payment';
    }

    // Validate and parse date parameters (Requirement 5.5 - date filtering)
    let startDate: number | undefined;
    let endDate: number | undefined;

    if (startDateParam) {
      startDate = parseInt(startDateParam, 10);
      if (isNaN(startDate) || startDate < 0) {
        return new Response(
          JSON.stringify({ error: 'Invalid start_date parameter. Must be a valid Unix timestamp.' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    if (endDateParam) {
      endDate = parseInt(endDateParam, 10);
      if (isNaN(endDate) || endDate < 0) {
        return new Response(
          JSON.stringify({ error: 'Invalid end_date parameter. Must be a valid Unix timestamp.' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Validate that end_date is not before start_date
    if (startDate !== undefined && endDate !== undefined && endDate < startDate) {
      return new Response(
        JSON.stringify({ error: 'end_date must be greater than or equal to start_date' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse pagination parameters
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return new Response(
        JSON.stringify({ error: 'Invalid limit parameter. Must be between 1 and 100.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (isNaN(offset) || offset < 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid offset parameter. Must be a non-negative integer.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get tracking events with filters (Requirement 5.3 - chronological order)
    const events = await getTrackingEvents(env.DB, {
      affiliate_id: affiliateId,
      event_type: eventType,
      start_date: startDate,
      end_date: endDate,
      limit,
      offset,
    });

    // Get total count without pagination for UI
    const allEvents = await getTrackingEvents(env.DB, {
      affiliate_id: affiliateId,
      event_type: eventType,
      start_date: startDate,
      end_date: endDate,
    });

    // Return events and metadata
    return new Response(
      JSON.stringify({
        events,
        total: allEvents.length,
        limit,
        offset,
        filters: {
          event_type: eventType || null,
          start_date: startDate || null,
          end_date: endDate || null,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Get affiliate events error:', error);

    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.message.includes('Unauthorized') ? 401 : 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Failed to fetch affiliate events' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
