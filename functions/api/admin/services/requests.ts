/**
 * Admin Service Requests API Endpoint
 * Handles viewing and managing all service requests
 * 
 * GET: List all service requests with filtering and pagination
 */

import { requireRole } from '../../../lib/auth';

interface Env {
  DB: D1Database;
}

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
}

interface ServiceRequestWithDetails extends ServiceRequest {
  service_name: string;
  service_category: string;
  assigned_provider_name: string | null;
}

interface ServiceRequestFilters {
  serviceType?: string;
  status?: string;
  startDate?: number;
  endDate?: number;
  assignedProvider?: string;
  page?: number;
  limit?: number;
}

/**
 * Get service requests with filters and pagination
 */
async function getServiceRequests(
  db: D1Database,
  filters: ServiceRequestFilters
): Promise<{ requests: ServiceRequestWithDetails[]; total: number }> {
  const {
    serviceType,
    status,
    startDate,
    endDate,
    assignedProvider,
    page = 1,
    limit = 20,
  } = filters;

  // Build the WHERE clause dynamically
  const conditions: string[] = ['1=1'];
  const bindings: any[] = [];

  if (serviceType) {
    conditions.push('s.category = ?');
    bindings.push(serviceType);
  }

  if (status) {
    conditions.push('sr.status = ?');
    bindings.push(status);
  }

  if (startDate) {
    conditions.push('sr.created_at >= ?');
    bindings.push(startDate);
  }

  if (endDate) {
    conditions.push('sr.created_at <= ?');
    bindings.push(endDate);
  }

  if (assignedProvider) {
    conditions.push('sr.assigned_provider_id = ?');
    bindings.push(assignedProvider);
  }

  const whereClause = conditions.join(' AND ');

  // Get total count for pagination
  const countQuery = `
    SELECT COUNT(*) as total
    FROM service_requests sr
    JOIN services s ON sr.service_id = s.id
    WHERE ${whereClause}
  `;

  const countResult = await db
    .prepare(countQuery)
    .bind(...bindings)
    .first<{ total: number }>();

  const total = countResult?.total || 0;

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // Get paginated results with service and provider details
  const query = `
    SELECT 
      sr.*,
      s.name as service_name,
      s.category as service_category,
      u.name as assigned_provider_name
    FROM service_requests sr
    JOIN services s ON sr.service_id = s.id
    LEFT JOIN users u ON sr.assigned_provider_id = u.id
    WHERE ${whereClause}
    ORDER BY sr.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const result = await db
    .prepare(query)
    .bind(...bindings, limit, offset)
    .all<ServiceRequestWithDetails>();

  return {
    requests: result.results || [],
    total,
  };
}

/**
 * GET /api/admin/services/requests
 * Returns all service requests with filtering and pagination
 */
async function handleGet(request: Request, env: Env): Promise<Response> {
  try {
    await requireRole(request, env.DB, ['admin']);

    // Parse query parameters
    const url = new URL(request.url);
    const serviceType = url.searchParams.get('serviceType') || undefined;
    const status = url.searchParams.get('status') || undefined;
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const assignedProvider = url.searchParams.get('assignedProvider') || undefined;
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse date parameters
    const filters: ServiceRequestFilters = {
      serviceType,
      status,
      assignedProvider,
      page,
      limit,
    };

    if (startDate) {
      const startTimestamp = new Date(startDate).getTime() / 1000;
      if (!isNaN(startTimestamp)) {
        filters.startDate = Math.floor(startTimestamp);
      }
    }

    if (endDate) {
      const endTimestamp = new Date(endDate).getTime() / 1000;
      if (!isNaN(endTimestamp)) {
        filters.endDate = Math.floor(endTimestamp);
      }
    }

    // Get service requests with filters
    const { requests, total } = await getServiceRequests(env.DB, filters);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);

    return new Response(
      JSON.stringify({
        success: true,
        requests,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('GET /api/admin/services/requests error:', error);

    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: error.message.includes('Unauthorized') ? 401 : 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Main handler for /api/admin/services/requests
 */
export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  let response: Response;

  switch (request.method) {
    case 'GET':
      response = await handleGet(request, env);
      break;
    default:
      response = new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
  }

  // Add CORS headers to response
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
