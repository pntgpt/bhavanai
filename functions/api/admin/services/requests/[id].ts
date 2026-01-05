/**
 * Admin Service Request Update API Endpoint
 * Handles updating individual service requests
 * 
 * PATCH: Update service request status or assigned provider
 * 
 * Requirements: 8.4, 9.4
 */

import { requireRole } from '../../../../lib/auth';
import { createEmailService } from '../../../../lib/email';
import { createNotificationService } from '../../../../lib/notification';

interface Env {
  DB: D1Database;
  EMAIL_PROVIDER?: string;
  EMAIL_API_KEY?: string;
  EMAIL_DOMAIN?: string;
  EMAIL_FROM_ADDRESS?: string;
  EMAIL_FROM_NAME?: string;
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

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface UpdateRequestBody {
  status?: 'payment_confirmed' | 'pending_contact' | 'team_assigned' | 'in_progress' | 'completed' | 'cancelled';
  assignedProviderId?: string;
  notes?: string;
}

/**
 * Validate status transition
 * Ensures status changes follow valid workflow
 */
function isValidStatusTransition(oldStatus: string, newStatus: string): boolean {
  const validTransitions: Record<string, string[]> = {
    payment_confirmed: ['pending_contact', 'cancelled'],
    pending_contact: ['team_assigned', 'cancelled'],
    team_assigned: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [], // Terminal state
    cancelled: [], // Terminal state
  };

  return validTransitions[oldStatus]?.includes(newStatus) || false;
}

/**
 * Get status change message for customer notification
 */
function getStatusChangeMessage(newStatus: string): string {
  const messages: Record<string, string> = {
    payment_confirmed: 'Your payment has been confirmed and your service request is being processed.',
    pending_contact: 'Your service request is pending contact from our team.',
    team_assigned: 'A team member has been assigned to your service request and will contact you shortly.',
    in_progress: 'Your service request is now in progress. Our team is working on it.',
    completed: 'Your service request has been completed. Thank you for choosing Bhavan.ai!',
    cancelled: 'Your service request has been cancelled. If you have any questions, please contact us.',
  };

  return messages[newStatus] || 'Your service request status has been updated.';
}

/**
 * Get estimated next step for status
 */
function getEstimatedNextStep(newStatus: string): string {
  const nextSteps: Record<string, string> = {
    payment_confirmed: 'Our team will review your request and assign it to a specialist within 24 hours.',
    pending_contact: 'Our team will reach out to you within 24-48 hours.',
    team_assigned: 'Your assigned team member will contact you within 24-48 hours to discuss your requirements.',
    in_progress: 'We will keep you updated on the progress. Expected completion time will be communicated by your assigned team member.',
    completed: 'If you need any further assistance, please don\'t hesitate to contact us.',
    cancelled: 'If this was done in error, please contact our support team with your reference number.',
  };

  return nextSteps[newStatus] || 'We will keep you updated on any changes.';
}

/**
 * Create status history record
 */
async function createStatusHistory(
  db: D1Database,
  serviceRequestId: string,
  oldStatus: string | null,
  newStatus: string,
  changedByUserId: string,
  notes: string | null
): Promise<void> {
  const historyId = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(`
      INSERT INTO service_request_status_history (
        id, service_request_id, old_status, new_status, 
        changed_by_user_id, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(historyId, serviceRequestId, oldStatus, newStatus, changedByUserId, notes, now)
    .run();
}

/**
 * PATCH /api/admin/services/requests/:id
 * Update service request status or assigned provider
 */
async function handlePatch(
  request: Request,
  env: Env,
  requestId: string
): Promise<Response> {
  try {
    // Require admin role
    const user = await requireRole(request, env.DB, ['admin']);

    // Parse request body
    let body: UpdateRequestBody;
    try {
      body = await request.json();
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid JSON in request body',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate that at least one field is being updated
    if (!body.status && !body.assignedProviderId && body.notes === undefined) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'At least one field (status, assignedProviderId, or notes) must be provided',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get existing service request
    const existingRequest = await env.DB
      .prepare('SELECT * FROM service_requests WHERE id = ?')
      .bind(requestId)
      .first<ServiceRequest>();

    if (!existingRequest) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Service request not found',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate status transition if status is being updated
    if (body.status && body.status !== existingRequest.status) {
      if (!isValidStatusTransition(existingRequest.status, body.status)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Invalid status transition from ${existingRequest.status} to ${body.status}`,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Validate assigned provider if being updated
    if (body.assignedProviderId) {
      const provider = await env.DB
        .prepare('SELECT id, role, status FROM users WHERE id = ?')
        .bind(body.assignedProviderId)
        .first<{ id: string; role: string; status: string }>();

      if (!provider) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Assigned provider not found',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      if (provider.status !== 'active') {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Assigned provider is not active',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Validate provider role (should be ca, lawyer, or admin)
      if (!['ca', 'lawyer', 'admin'].includes(provider.role)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Assigned user is not a valid service provider',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const bindings: any[] = [];

    if (body.status) {
      updates.push('status = ?');
      bindings.push(body.status);
    }

    if (body.assignedProviderId !== undefined) {
      updates.push('assigned_provider_id = ?');
      bindings.push(body.assignedProviderId);
    }

    if (body.notes !== undefined) {
      updates.push('notes = ?');
      bindings.push(body.notes);
    }

    // Always update the updated_at timestamp
    const now = Math.floor(Date.now() / 1000);
    updates.push('updated_at = ?');
    bindings.push(now);

    // Add the request ID for the WHERE clause
    bindings.push(requestId);

    // Update the service request
    const updateQuery = `
      UPDATE service_requests 
      SET ${updates.join(', ')}
      WHERE id = ?
    `;

    await env.DB.prepare(updateQuery).bind(...bindings).run();

    // Create status history record if status changed
    if (body.status && body.status !== existingRequest.status) {
      await createStatusHistory(
        env.DB,
        requestId,
        existingRequest.status,
        body.status,
        user.id,
        body.notes || null
      );
    }

    // Get updated service request with service details
    const updatedRequest = await env.DB
      .prepare(`
        SELECT 
          sr.*,
          s.name as service_name,
          s.description as service_description,
          s.category as service_category
        FROM service_requests sr
        JOIN services s ON sr.service_id = s.id
        WHERE sr.id = ?
      `)
      .bind(requestId)
      .first<ServiceRequest & { service_name: string; service_description: string; service_category: string }>();

    if (!updatedRequest) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to retrieve updated service request',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Trigger notifications if status changed
    if (body.status && body.status !== existingRequest.status) {
      try {
        const emailService = createEmailService(env);
        const notificationService = createNotificationService(emailService, env.DB);

        const service: Service = {
          id: updatedRequest.service_id,
          name: updatedRequest.service_name,
          description: updatedRequest.service_description,
          category: updatedRequest.service_category,
        };

        // Notify customer about status change
        await notificationService.notifyCustomer(
          updatedRequest,
          service,
          'status_updated',
          {
            oldStatus: existingRequest.status,
            message: getStatusChangeMessage(body.status),
            estimatedNextStep: getEstimatedNextStep(body.status),
          }
        );

        // If team was assigned, send team_assigned notification
        if (body.status === 'team_assigned' || body.assignedProviderId) {
          await notificationService.notifyCustomer(
            updatedRequest,
            service,
            'team_assigned'
          );
        }

        // If completed, send completion notification
        if (body.status === 'completed') {
          await notificationService.notifyCustomer(
            updatedRequest,
            service,
            'completed',
            {
              oldStatus: existingRequest.status,
            }
          );
        }
      } catch (notificationError) {
        // Log notification error but don't fail the request
        console.error('Failed to send status change notification:', notificationError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        request: updatedRequest,
        updated: true,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('PATCH /api/admin/services/requests/:id error:', error);

    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: error.message.includes('Unauthorized') ? 401 : 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Main handler for /api/admin/services/requests/:id
 */
export async function onRequest(context: {
  request: Request;
  env: Env;
  params: { id: string };
}): Promise<Response> {
  const { request, env, params } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  let response: Response;

  switch (request.method) {
    case 'PATCH':
      response = await handlePatch(request, env, params.id);
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
