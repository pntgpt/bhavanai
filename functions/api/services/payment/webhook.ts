/**
 * Payment Webhook API Endpoint
 * 
 * POST /api/services/payment/webhook
 * Handles payment gateway webhooks for service purchases
 * Verifies webhook signatures, processes payment success/failure, creates service request records,
 * and triggers notifications
 * 
 * Requirements: 4.3, 4.4, 7.1, 7.2
 */

import { PaymentGatewayFactory } from '../../../lib/payment-gateway-factory';
import { PaymentConfigService, getPaymentGatewayFromEnv } from '../../../lib/payment-config';
import { PaymentGatewayError } from '../../../lib/payment-gateway';

interface Env {
  DB: D1Database;
  PAYMENT_GATEWAY_PROVIDER?: string;
  PAYMENT_GATEWAY_API_KEY?: string;
  PAYMENT_GATEWAY_API_SECRET?: string;
  PAYMENT_GATEWAY_WEBHOOK_SECRET?: string;
  PAYMENT_GATEWAY_MODE?: string;
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

/**
 * Get service request by ID
 */
async function getServiceRequestById(db: D1Database, requestId: string): Promise<ServiceRequest | null> {
  const result = await db
    .prepare('SELECT * FROM service_requests WHERE id = ?')
    .bind(requestId)
    .first<ServiceRequest>();

  return result;
}

/**
 * Update service request with payment information
 */
async function updateServiceRequestPayment(
  db: D1Database,
  requestId: string,
  data: {
    transactionId: string;
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    status: string;
  }
): Promise<void> {
  const now = Date.now();
  const paymentCompletedAt = data.paymentStatus === 'completed' ? now : null;

  await db
    .prepare(`
      UPDATE service_requests
      SET payment_transaction_id = ?,
          payment_status = ?,
          payment_completed_at = ?,
          status = ?,
          updated_at = ?
      WHERE id = ?
    `)
    .bind(
      data.transactionId,
      data.paymentStatus,
      paymentCompletedAt,
      data.status,
      now,
      requestId
    )
    .run();
}

/**
 * Create status history record
 */
async function createStatusHistory(
  db: D1Database,
  data: {
    serviceRequestId: string;
    oldStatus: string | null;
    newStatus: string;
    notes?: string;
  }
): Promise<void> {
  const id = crypto.randomUUID();
  const now = Date.now();

  await db
    .prepare(`
      INSERT INTO service_request_status_history (
        id, service_request_id, old_status, new_status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id,
      data.serviceRequestId,
      data.oldStatus,
      data.newStatus,
      data.notes || null,
      now
    )
    .run();
}

/**
 * Create affiliate tracking event for service purchase
 */
async function createAffiliateTrackingEvent(
  db: D1Database,
  data: {
    affiliateId: string;
    serviceRequestId: string;
    amount: number;
    currency: string;
  }
): Promise<void> {
  const id = crypto.randomUUID();
  const now = Date.now();

  await db
    .prepare(`
      INSERT INTO tracking_events (
        id, affiliate_id, event_type, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?)
    `)
    .bind(
      id,
      data.affiliateId,
      'payment',
      JSON.stringify({
        service_request_id: data.serviceRequestId,
        amount: data.amount,
        currency: data.currency,
        type: 'service_purchase',
      }),
      now
    )
    .run();
}

/**
 * Send email notification (placeholder - to be implemented with email service)
 */
async function sendEmailNotification(
  type: 'confirmation' | 'provider_notification' | 'payment_failed',
  data: {
    email: string;
    customerName: string;
    referenceNumber: string;
    serviceName?: string;
    amount?: number;
    currency?: string;
  }
): Promise<void> {
  // TODO: Implement email sending using email service
  // For now, just log the notification
  console.log(`[EMAIL] ${type} notification to ${data.email}:`, data);
}

/**
 * Send provider notification (placeholder - to be implemented with notification service)
 */
async function sendProviderNotification(serviceRequest: ServiceRequest): Promise<void> {
  // TODO: Implement provider notification
  // For now, just log the notification
  console.log('[NOTIFICATION] Provider notification for service request:', serviceRequest.reference_number);
}

/**
 * Process successful payment
 */
async function processPaymentSuccess(
  db: D1Database,
  serviceRequest: ServiceRequest,
  transactionId: string
): Promise<void> {
  const oldStatus = serviceRequest.status;
  const newStatus = 'payment_confirmed';

  // Update service request with payment information
  await updateServiceRequestPayment(db, serviceRequest.id, {
    transactionId,
    paymentStatus: 'completed',
    status: newStatus,
  });

  // Create status history record
  await createStatusHistory(db, {
    serviceRequestId: serviceRequest.id,
    oldStatus,
    newStatus,
    notes: 'Payment completed successfully',
  });

  // Create affiliate tracking event if applicable
  if (serviceRequest.affiliate_id) {
    await createAffiliateTrackingEvent(db, {
      affiliateId: serviceRequest.affiliate_id,
      serviceRequestId: serviceRequest.id,
      amount: serviceRequest.payment_amount,
      currency: serviceRequest.payment_currency,
    });
  }

  // Send confirmation email to customer
  await sendEmailNotification('confirmation', {
    email: serviceRequest.customer_email,
    customerName: serviceRequest.customer_name,
    referenceNumber: serviceRequest.reference_number,
    amount: serviceRequest.payment_amount,
    currency: serviceRequest.payment_currency,
  });

  // Send notification to service provider
  await sendProviderNotification(serviceRequest);
}

/**
 * Process failed payment
 */
async function processPaymentFailure(
  db: D1Database,
  serviceRequest: ServiceRequest,
  transactionId: string
): Promise<void> {
  const oldStatus = serviceRequest.status;
  const newStatus = 'cancelled';

  // Update service request with payment failure
  await updateServiceRequestPayment(db, serviceRequest.id, {
    transactionId,
    paymentStatus: 'failed',
    status: newStatus,
  });

  // Create status history record
  await createStatusHistory(db, {
    serviceRequestId: serviceRequest.id,
    oldStatus,
    newStatus,
    notes: 'Payment failed',
  });

  // Send payment failed email to customer
  await sendEmailNotification('payment_failed', {
    email: serviceRequest.customer_email,
    customerName: serviceRequest.customer_name,
    referenceNumber: serviceRequest.reference_number,
  });
}

/**
 * POST /api/services/payment/webhook
 * Process payment gateway webhooks
 */
async function handlePost(request: Request, env: Env): Promise<Response> {
  try {
    // Get webhook signature from headers
    const signature = request.headers.get('x-razorpay-signature') || 
                     request.headers.get('stripe-signature') ||
                     request.headers.get('x-webhook-signature') || '';

    if (!signature) {
      console.error('Webhook signature missing');
      return new Response(
        JSON.stringify({ success: false, error: 'Webhook signature missing' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse webhook payload
    const payload = await request.json();

    // Get payment gateway configuration
    let paymentConfig;
    try {
      // Try to get from database first
      const configService = new PaymentConfigService(env.DB);
      paymentConfig = await configService.getActiveConfig();

      // Fallback to environment variables if no database config
      if (!paymentConfig) {
        paymentConfig = getPaymentGatewayFromEnv(env);
      }

      if (!paymentConfig) {
        throw new Error('No payment gateway configured');
      }
    } catch (error) {
      console.error('Failed to load payment gateway configuration:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment gateway not configured' 
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create payment gateway adapter
    const paymentGateway = PaymentGatewayFactory.create(paymentConfig);

    // Verify webhook signature
    const isValid = paymentGateway.verifyWebhook(payload, signature);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid webhook signature' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Process webhook payload
    const webhookResult = await paymentGateway.processWebhook(payload);

    // Get service request from metadata
    const serviceRequestId = webhookResult.metadata.service_request_id;
    if (!serviceRequestId) {
      console.error('Service request ID not found in webhook metadata');
      return new Response(
        JSON.stringify({ 
          success: true, 
          received: true, 
          processed: false,
          message: 'Service request ID not found in metadata'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get service request
    const serviceRequest = await getServiceRequestById(env.DB, serviceRequestId);
    if (!serviceRequest) {
      console.error('Service request not found:', serviceRequestId);
      return new Response(
        JSON.stringify({ 
          success: true, 
          received: true, 
          processed: false,
          message: 'Service request not found'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if payment was already processed
    if (serviceRequest.payment_status === 'completed' || serviceRequest.payment_status === 'failed') {
      console.log('Payment already processed for service request:', serviceRequestId);
      return new Response(
        JSON.stringify({ 
          success: true, 
          received: true, 
          processed: false,
          message: 'Payment already processed'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Process based on payment status
    if (webhookResult.status === 'success') {
      await processPaymentSuccess(env.DB, serviceRequest, webhookResult.transactionId);
    } else if (webhookResult.status === 'failed') {
      await processPaymentFailure(env.DB, serviceRequest, webhookResult.transactionId);
    } else {
      // Pending status - just update transaction ID
      await updateServiceRequestPayment(env.DB, serviceRequest.id, {
        transactionId: webhookResult.transactionId,
        paymentStatus: 'pending',
        status: serviceRequest.status,
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        received: true, 
        processed: true 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('POST /api/services/payment/webhook error:', error);

    // Handle payment gateway errors
    if (error instanceof PaymentGatewayError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to process webhook',
          details: error.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Main handler for /api/services/payment/webhook
 */
export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // Webhooks should not have CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 405 });
  }

  let response: Response;

  switch (request.method) {
    case 'POST':
      response = await handlePost(request, env);
      break;
    default:
      response = new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
  }

  return response;
}
