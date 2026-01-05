/**
 * Service Request Tracking API Endpoint
 * 
 * GET /api/services/requests/:referenceNumber
 * Fetches service request details by reference number and returns status timeline
 * 
 * Requirements: 9.2, 9.3, 9.5
 */

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
  payment_gateway: string;
  payment_amount: number;
  payment_currency: string;
  payment_status: string;
  payment_transaction_id: string | null;
  payment_completed_at: number | null;
  status: string;
  assigned_provider_id: string | null;
  affiliate_code: string | null;
  affiliate_id: string | null;
  notes: string | null;
  created_at: number;
  updated_at: number;
}

interface Service {
  id: string;
  name: string;
  description: string;
  short_description: string;
  category: string;
  base_price: number;
  currency: string;
  features: string;
  is_active: number;
}

interface ServiceTier {
  id: string;
  service_id: string;
  name: string;
  price: number;
  features: string;
  sort_order: number;
  is_active: number;
}

interface StatusHistory {
  id: string;
  service_request_id: string;
  old_status: string | null;
  new_status: string;
  changed_by_user_id: string | null;
  notes: string | null;
  created_at: number;
}

interface StatusTimeline {
  status: string;
  timestamp: number;
  description: string;
}

/**
 * Get service request by reference number
 */
async function getServiceRequestByReference(
  db: D1Database,
  referenceNumber: string
): Promise<ServiceRequest | null> {
  const result = await db
    .prepare('SELECT * FROM service_requests WHERE reference_number = ?')
    .bind(referenceNumber)
    .first<ServiceRequest>();

  return result;
}

/**
 * Get service by ID
 */
async function getServiceById(db: D1Database, serviceId: string): Promise<Service | null> {
  const result = await db
    .prepare('SELECT * FROM services WHERE id = ?')
    .bind(serviceId)
    .first<Service>();

  return result;
}

/**
 * Get service tier by ID
 */
async function getServiceTierById(db: D1Database, tierId: string): Promise<ServiceTier | null> {
  const result = await db
    .prepare('SELECT * FROM service_tiers WHERE id = ?')
    .bind(tierId)
    .first<ServiceTier>();

  return result;
}

/**
 * Get status history for a service request
 */
async function getStatusHistory(
  db: D1Database,
  serviceRequestId: string
): Promise<StatusHistory[]> {
  const result = await db
    .prepare(`
      SELECT * FROM service_request_status_history
      WHERE service_request_id = ?
      ORDER BY created_at ASC
    `)
    .bind(serviceRequestId)
    .all<StatusHistory>();

  return result.results || [];
}

/**
 * Map status to human-readable label
 */
function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    'pending_contact': 'Payment Confirmed',
    'payment_confirmed': 'Payment Confirmed',
    'team_assigned': 'Team Assigned',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
  };

  return statusLabels[status] || status;
}

/**
 * Get status description
 */
function getStatusDescription(status: string): string {
  const descriptions: Record<string, string> = {
    'pending_contact': 'Your payment has been confirmed. Our team will reach out to you shortly.',
    'payment_confirmed': 'Your payment has been confirmed. Our team will reach out to you shortly.',
    'team_assigned': 'A service provider has been assigned to your request.',
    'in_progress': 'Your service request is currently being processed.',
    'completed': 'Your service request has been completed.',
    'cancelled': 'Your service request has been cancelled.',
  };

  return descriptions[status] || 'Status updated';
}

/**
 * Get estimated next steps based on current status
 */
function getEstimatedNextSteps(status: string): string {
  const nextSteps: Record<string, string> = {
    'pending_contact': 'Our team will contact you within 24-48 hours to discuss your requirements and next steps.',
    'payment_confirmed': 'Our team will contact you within 24-48 hours to discuss your requirements and next steps.',
    'team_assigned': 'Your assigned service provider will reach out to you shortly to begin working on your request.',
    'in_progress': 'Your service provider is actively working on your request. They will keep you updated on progress.',
    'completed': 'Your service has been completed. If you have any questions, please contact our support team.',
    'cancelled': 'This request has been cancelled. If you believe this is an error, please contact our support team.',
  };

  return nextSteps[status] || 'Please check back later for updates.';
}

/**
 * Build status timeline from history
 */
function buildStatusTimeline(
  serviceRequest: ServiceRequest,
  statusHistory: StatusHistory[]
): StatusTimeline[] {
  const timeline: StatusTimeline[] = [];

  // Add creation event
  timeline.push({
    status: 'created',
    timestamp: serviceRequest.created_at,
    description: 'Service request created',
  });

  // Add status history events
  for (const history of statusHistory) {
    timeline.push({
      status: history.new_status,
      timestamp: history.created_at,
      description: history.notes || getStatusDescription(history.new_status),
    });
  }

  // If no history exists, add current status
  if (statusHistory.length === 0 && serviceRequest.status !== 'pending_contact') {
    timeline.push({
      status: serviceRequest.status,
      timestamp: serviceRequest.updated_at,
      description: getStatusDescription(serviceRequest.status),
    });
  }

  return timeline;
}

/**
 * GET /api/services/requests/:referenceNumber
 * Fetch service request details and status timeline
 */
async function handleGet(request: Request, env: Env): Promise<Response> {
  try {
    // Extract reference number from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const referenceNumber = pathParts[pathParts.length - 1];

    if (!referenceNumber) {
      return new Response(
        JSON.stringify({ success: false, error: 'Reference number is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get service request
    const serviceRequest = await getServiceRequestByReference(env.DB, referenceNumber);
    if (!serviceRequest) {
      return new Response(
        JSON.stringify({ success: false, error: 'Service request not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get service details
    const service = await getServiceById(env.DB, serviceRequest.service_id);
    if (!service) {
      return new Response(
        JSON.stringify({ success: false, error: 'Service not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get service tier if applicable
    let serviceTier: ServiceTier | null = null;
    if (serviceRequest.service_tier_id) {
      serviceTier = await getServiceTierById(env.DB, serviceRequest.service_tier_id);
    }

    // Get status history
    const statusHistory = await getStatusHistory(env.DB, serviceRequest.id);

    // Build status timeline
    const timeline = buildStatusTimeline(serviceRequest, statusHistory);

    // Get estimated next steps
    const estimatedNextStep = getEstimatedNextSteps(serviceRequest.status);

    // Build response
    const response = {
      success: true,
      request: {
        id: serviceRequest.id,
        referenceNumber: serviceRequest.reference_number,
        service: {
          id: service.id,
          name: service.name,
          description: service.description,
          category: service.category,
        },
        serviceTier: serviceTier ? {
          id: serviceTier.id,
          name: serviceTier.name,
          price: serviceTier.price,
        } : null,
        customer: {
          name: serviceRequest.customer_name,
          email: serviceRequest.customer_email,
          phone: serviceRequest.customer_phone,
        },
        payment: {
          amount: serviceRequest.payment_amount,
          currency: serviceRequest.payment_currency,
          status: serviceRequest.payment_status,
          transactionId: serviceRequest.payment_transaction_id,
          completedAt: serviceRequest.payment_completed_at,
        },
        status: serviceRequest.status,
        statusLabel: getStatusLabel(serviceRequest.status),
        createdAt: serviceRequest.created_at,
        updatedAt: serviceRequest.updated_at,
      },
      timeline: timeline.map(item => ({
        status: item.status,
        statusLabel: getStatusLabel(item.status),
        timestamp: item.timestamp,
        description: item.description,
      })),
      estimatedNextStep,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('GET /api/services/requests/:referenceNumber error:', error);

    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Main handler for /api/services/requests/:referenceNumber
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
      response = new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
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
