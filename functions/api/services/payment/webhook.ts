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
import { createEmailService } from '../../../lib/email';
import { createNotificationService } from '../../../lib/notification';
import {
  getCommissionConfig,
  calculateCommission,
  createAffiliateCommission,
  getCommissionByServiceRequestId,
  updateCommissionStatus,
} from '../../../lib/db';
import {
  DatabaseError,
  PaymentError,
  withDatabaseRetry,
  withErrorHandling,
  generateRequestId,
  logError,
} from '../../../lib/error-handling';

interface Env {
  DB: D1Database;
  PAYMENT_GATEWAY_PROVIDER?: string;
  PAYMENT_GATEWAY_API_KEY?: string;
  PAYMENT_GATEWAY_API_SECRET?: string;
  PAYMENT_GATEWAY_WEBHOOK_SECRET?: string;
  PAYMENT_GATEWAY_MODE?: string;
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
 * Get service request by ID with database retry
 * Requirement 11.2: Database error handling with retry option
 */
async function getServiceRequestById(db: D1Database, requestId: string): Promise<ServiceRequest | null> {
  return await withDatabaseRetry(async () => {
    const result = await db
      .prepare('SELECT * FROM service_requests WHERE id = ?')
      .bind(requestId)
      .first<ServiceRequest>();

    return result;
  }, { operation: 'getServiceRequestById', requestId });
}

/**
 * Update service request with payment information with database retry
 * Requirement 11.2: Database error handling with retry option
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
  await withDatabaseRetry(async () => {
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
  }, { operation: 'updateServiceRequestPayment', requestId });
}

/**
 * Create status history record with database retry
 * Requirement 11.2: Database error handling with retry option
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
  await withDatabaseRetry(async () => {
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
  }, { operation: 'createStatusHistory', serviceRequestId: data.serviceRequestId });
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
 * Get service by ID
 */
async function getServiceById(db: D1Database, serviceId: string): Promise<{ id: string; name: string; description: string; category: string } | null> {
  const result = await db
    .prepare('SELECT id, name, description, category FROM services WHERE id = ?')
    .bind(serviceId)
    .first<{ id: string; name: string; description: string; category: string }>();

  return result;
}

/**
 * Process successful payment
 */
async function processPaymentSuccess(
  db: D1Database,
  env: Env,
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

  // Get service information first
  const service = await getServiceById(db, serviceRequest.service_id);
  if (!service) {
    console.error('Service not found:', serviceRequest.service_id);
    return;
  }

  // Create affiliate tracking event if applicable
  if (serviceRequest.affiliate_id) {
    await createAffiliateTrackingEvent(db, {
      affiliateId: serviceRequest.affiliate_id,
      serviceRequestId: serviceRequest.id,
      amount: serviceRequest.payment_amount,
      currency: serviceRequest.payment_currency,
    });

    // Calculate and create commission record (Requirements 10.3)
    try {
      const commissionConfig = await getCommissionConfig(
        db,
        service.category as 'ca' | 'legal' | 'other'
      );

      if (commissionConfig) {
        const commissionAmount = calculateCommission(
          commissionConfig,
          serviceRequest.payment_amount
        );

        await createAffiliateCommission(db, {
          affiliateId: serviceRequest.affiliate_id,
          serviceRequestId: serviceRequest.id,
          commissionAmount,
          commissionCurrency: serviceRequest.payment_currency,
          serviceAmount: serviceRequest.payment_amount,
          serviceCurrency: serviceRequest.payment_currency,
          notes: `Commission for ${service.name} purchase`,
        });

        console.log(
          `Created commission record: ${commissionAmount} ${serviceRequest.payment_currency} for affiliate ${serviceRequest.affiliate_id}`
        );
      } else {
        console.warn(
          `No commission configuration found for service category: ${service.category}`
        );
      }
    } catch (error) {
      console.error('Error creating commission record:', error);
      // Don't block the flow if commission creation fails
    }
  }

  // Create email and notification services
  const emailService = createEmailService(env);
  const notificationService = createNotificationService(emailService, db);

  // Send confirmation email to customer
  try {
    const confirmationResult = await emailService.sendConfirmationEmail({
      to: serviceRequest.customer_email,
      customerName: serviceRequest.customer_name,
      referenceNumber: serviceRequest.reference_number,
      serviceName: service.name,
      serviceDescription: service.description,
      amount: serviceRequest.payment_amount,
      currency: serviceRequest.payment_currency,
      estimatedContact: 'within 24-48 hours',
    });

    if (!confirmationResult.sent) {
      console.error('Failed to send confirmation email:', confirmationResult.error);
      // Log failure for admin review but don't block the flow
    } else {
      console.log('Confirmation email sent successfully:', confirmationResult.messageId);
    }
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }

  // Send notification to service provider
  try {
    await notificationService.notifyProvider(serviceRequest, service);
  } catch (error) {
    console.error('Error sending provider notification:', error);
  }
}

/**
 * Process payment refund
 * Handles commission adjustments on refunds (Requirement 10.5)
 */
async function processPaymentRefund(
  db: D1Database,
  env: Env,
  serviceRequest: ServiceRequest,
  transactionId: string
): Promise<void> {
  const oldStatus = serviceRequest.status;
  const newStatus = 'cancelled';

  // Update service request with refund status
  await updateServiceRequestPayment(db, serviceRequest.id, {
    transactionId,
    paymentStatus: 'refunded',
    status: newStatus,
  });

  // Create status history record
  await createStatusHistory(db, {
    serviceRequestId: serviceRequest.id,
    oldStatus,
    newStatus,
    notes: 'Payment refunded',
  });

  // Cancel affiliate commission if applicable (Requirement 10.5)
  if (serviceRequest.affiliate_id) {
    try {
      const commission = await getCommissionByServiceRequestId(db, serviceRequest.id);
      
      if (commission) {
        await updateCommissionStatus(
          db,
          commission.id,
          'cancelled',
          'Commission cancelled due to payment refund'
        );

        console.log(
          `Cancelled commission ${commission.id} for refunded service request ${serviceRequest.id}`
        );
      }
    } catch (error) {
      console.error('Error cancelling commission on refund:', error);
      // Don't block the flow if commission cancellation fails
    }
  }

  // Get service information
  const service = await getServiceById(db, serviceRequest.service_id);
  if (!service) {
    console.error('Service not found:', serviceRequest.service_id);
    return;
  }

  // Create email service
  const emailService = createEmailService(env);

  // Send refund notification email to customer
  try {
    const statusUpdateResult = await emailService.sendStatusUpdateEmail({
      to: serviceRequest.customer_email,
      customerName: serviceRequest.customer_name,
      referenceNumber: serviceRequest.reference_number,
      serviceName: service.name,
      oldStatus,
      newStatus,
      message: 'Your payment has been refunded. The refund should appear in your account within 5-7 business days.',
      estimatedNextStep: 'If you have any questions, please contact our support team.',
    });

    if (!statusUpdateResult.sent) {
      console.error('Failed to send refund notification email:', statusUpdateResult.error);
    } else {
      console.log('Refund notification email sent successfully:', statusUpdateResult.messageId);
    }
  } catch (error) {
    console.error('Error sending refund notification email:', error);
  }
}

/**
 * Process failed payment
 */
async function processPaymentFailure(
  db: D1Database,
  env: Env,
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

  // Get service information
  const service = await getServiceById(db, serviceRequest.service_id);
  if (!service) {
    console.error('Service not found:', serviceRequest.service_id);
    return;
  }

  // Create email service
  const emailService = createEmailService(env);

  // Send payment failed email to customer
  try {
    const statusUpdateResult = await emailService.sendStatusUpdateEmail({
      to: serviceRequest.customer_email,
      customerName: serviceRequest.customer_name,
      referenceNumber: serviceRequest.reference_number,
      serviceName: service.name,
      oldStatus,
      newStatus,
      message: 'Unfortunately, your payment could not be processed. Please try again or contact our support team for assistance.',
      estimatedNextStep: 'You can retry the payment or contact us for alternative payment options.',
    });

    if (!statusUpdateResult.sent) {
      console.error('Failed to send payment failure email:', statusUpdateResult.error);
    } else {
      console.log('Payment failure email sent successfully:', statusUpdateResult.messageId);
    }
  } catch (error) {
    console.error('Error sending payment failure email:', error);
  }
}

/**
 * POST /api/services/payment/webhook
 * Process payment gateway webhooks
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */
async function handlePost(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  try {
    // Get webhook signature from headers
    const signature = request.headers.get('x-razorpay-signature') || 
                     request.headers.get('stripe-signature') ||
                     request.headers.get('x-webhook-signature') || '';

    if (!signature) {
      logError(new Error('Webhook signature missing'), {
        request: { method: request.method, url: request.url, requestId },
      });
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
        throw new PaymentError('Payment gateway not configured');
      }
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        {
          request: { method: request.method, url: request.url, requestId },
          additional: { operation: 'loadPaymentConfig' },
        }
      );
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
      logError(new Error('Invalid webhook signature'), {
        request: { method: request.method, url: request.url, requestId },
        additional: { payloadKeys: payload && typeof payload === 'object' ? Object.keys(payload) : [] },
      });
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
      await processPaymentSuccess(env.DB, env, serviceRequest, webhookResult.transactionId);
    } else if (webhookResult.status === 'failed') {
      await processPaymentFailure(env.DB, env, serviceRequest, webhookResult.transactionId);
    } else if (webhookResult.status === 'refunded') {
      await processPaymentRefund(env.DB, env, serviceRequest, webhookResult.transactionId);
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
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        } 
      }
    );
  } catch (error: any) {
    // Handle payment gateway errors
    if (error instanceof PaymentGatewayError) {
      const paymentError = new PaymentError(
        'Failed to process webhook',
        error.code
      );
      logError(paymentError, {
        request: { method: request.method, url: request.url, requestId },
        additional: { originalError: error.message },
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to process webhook',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Log and return generic error
    logError(
      error instanceof Error ? error : new Error(String(error)),
      {
        request: { method: request.method, url: request.url, requestId },
      }
    );

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
