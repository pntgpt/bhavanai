/**
 * Admin affiliate statistics API endpoint
 * Returns affiliate performance metrics with event counts
 * Requirements: 5.1 (total signups), 5.2 (total contacts), 5.4 (breakdown by type), 5.5 (date filtering)
 */

import { requireRole } from '../../../../lib/auth';
import {
  getAffiliateById,
  getAffiliateStats,
  getAffiliateCommissionSummary,
} from '../../../../lib/db';

interface Env {
  DB: D1Database;
}

/**
 * GET /api/admin/affiliates/[id]/stats
 * Get statistics for a specific affiliate
 * Query parameters:
 *   - start_date: Unix timestamp (optional) - filter events from this date
 *   - end_date: Unix timestamp (optional) - filter events until this date
 * 
 * Returns:
 *   - affiliate_id: The affiliate's unique identifier
 *   - total_signups: Count of signup events
 *   - total_contacts: Count of property_contact events
 *   - total_payments: Count of payment events
 *   - total_events: Total count of all events
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

    // Parse query parameters for date filtering
    const url = new URL(request.url);
    const startDateParam = url.searchParams.get('start_date');
    const endDateParam = url.searchParams.get('end_date');

    // Validate and parse date parameters
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

    // Validate that end_date is not before start_date (Requirement 5.5)
    if (startDate !== undefined && endDate !== undefined && endDate < startDate) {
      return new Response(
        JSON.stringify({ error: 'end_date must be greater than or equal to start_date' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get affiliate statistics with optional date filtering
    const stats = await getAffiliateStats(env.DB, affiliateId, {
      start_date: startDate,
      end_date: endDate,
    });

    // Get commission summary (Requirement 10.4)
    const commissionSummary = await getAffiliateCommissionSummary(env.DB, affiliateId, {
      start_date: startDate,
      end_date: endDate,
    });

    // Return statistics with affiliate information
    return new Response(
      JSON.stringify({
        affiliate: {
          id: affiliate.id,
          name: affiliate.name,
          description: affiliate.description,
          status: affiliate.status,
        },
        stats: {
          total_signups: stats.total_signups,
          total_contacts: stats.total_contacts,
          total_payments: stats.total_payments,
          total_events: stats.total_events,
        },
        commissions: {
          total_pending: commissionSummary.total_pending,
          total_approved: commissionSummary.total_approved,
          total_paid: commissionSummary.total_paid,
          total_cancelled: commissionSummary.total_cancelled,
          total_earned: commissionSummary.total_earned,
          currency: commissionSummary.currency,
        },
        filters: {
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
    console.error('Get affiliate stats error:', error);

    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.message.includes('Unauthorized') ? 401 : 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Failed to fetch affiliate statistics' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
