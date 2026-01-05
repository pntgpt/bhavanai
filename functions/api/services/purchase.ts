/**
 * Service Purchase API Endpoint
 * 
 * POST /api/services/purchase
 * Handles service purchase requests, creates payment intents, and preserves affiliate tracking
 * 
 * Requirements: 2.1, 2.2, 4.1, 10.1
 */

import { PaymentGatewayFactory } from '../../lib/payment-gateway-factory';
import { PaymentConfigService, getPaymentGatewayFromEnv } from '../../lib/payment-config';
import { PaymentGatewayError } from '../../lib/payment-gateway';
import {
  ValidationError,
  DatabaseError,
  NotFoundError,
  PaymentError,
  withDatabaseRetry,
  withNetworkRetry,
  withErrorHandling,
  generateRequestId,
  logError,
} from '../../lib/error-handling';

interface Env {
  DB: D1Database;
  PAYMENT_GATEWAY_PROVIDER?: string;
  PAYMENT_GATEWAY_API_KEY?: string;
  PAYMENT_GATEWAY_API_SECRET?: string;
  PAYMENT_GATEWAY_WEBHOOK_SECRET?: string;
  PAYMENT_GATEWAY_MODE?: string;
}

interface PurchaseRequest {
  serviceId: string;
  serviceTierId?: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    requirements: string;
  };
  affiliateCode?: string;
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

/**
 * Validate purchase request data
 * Requirement 11.1: Display clear error messages for validation errors
 */
function validatePurchaseRequest(data: any): void {
  const fields: Record<string, string> = {};

  if (!data.serviceId) {
    fields.serviceId = 'Service selection is required';
  }

  if (!data.customer) {
    throw new ValidationError('Customer information is required');
  }

  const { fullName, email, phone, requirements } = data.customer;

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
    fields.fullName = 'Full name is required';
  }

  if (!email || typeof email !== 'string' || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    fields.email = 'Valid email address is required';
  }

  if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
    fields.phone = 'Phone number is required';
  }

  if (!requirements || typeof requirements !== 'string' || requirements.trim().length === 0) {
    fields.requirements = 'Service requirements are required';
  }

  if (Object.keys(fields).length > 0) {
    throw new ValidationError('Please correct the following fields', fields);
  }
}

/**
 * Get service by ID with database retry
 * Requirement 11.2: Database error handling with retry option
 */
async function getServiceById(db: D1Database, serviceId: string): Promise<Service | null> {
  return await withDatabaseRetry(async () => {
    const result = await db
      .prepare('SELECT * FROM services WHERE id = ? AND is_active = 1')
      .bind(serviceId)
      .first<Service>();

    return result;
  }, { operation: 'getServiceById', serviceId });
}

/**
 * Get service tier by ID with database retry
 * Requirement 11.2: Database error handling with retry option
 */
async function getServiceTierById(db: D1Database, tierId: string): Promise<ServiceTier | null> {
  return await withDatabaseRetry(async () => {
    const result = await db
      .prepare('SELECT * FROM service_tiers WHERE id = ? AND is_active = 1')
      .bind(tierId)
      .first<ServiceTier>();

    return result;
  }, { operation: 'getServiceTierById', tierId });
}

/**
 * Validate affiliate code and get affiliate ID with database retry
 * Requirement 11.2: Database error handling with retry option
 */
async function validateAffiliateCode(db: D1Database, affiliateCode: string): Promise<string | null> {
  return await withDatabaseRetry(async () => {
    const result = await db
      .prepare('SELECT id FROM affiliates WHERE id = ? AND status = ?')
      .bind(affiliateCode, 'active')
      .first<{ id: string }>();

    return result?.id || null;
  }, { operation: 'validateAffiliateCode', affiliateCode });
}

/**
 * Generate unique reference number for service request
 */
function generateReferenceNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SR-${timestamp}-${random}`;
}

/**
 * Create a pending service request record with database retry
 * Requirement 11.2: Database error handling with retry option
 */
async function createPendingServiceRequest(
  db: D1Database,
  data: {
    serviceId: string;
    serviceTierId?: string;
    customer: {
      fullName: string;
      email: string;
      phone: string;
      requirements: string;
    };
    paymentGateway: string;
    amount: number;
    currency: string;
    affiliateId?: string;
    affiliateCode?: string;
  }
): Promise<{ id: string; referenceNumber: string }> {
  return await withDatabaseRetry(async () => {
    const id = crypto.randomUUID();
    const referenceNumber = generateReferenceNumber();
    const now = Date.now();

    await db
      .prepare(`
        INSERT INTO service_requests (
          id, reference_number, service_id, service_tier_id,
          customer_name, customer_email, customer_phone, customer_requirements,
          payment_gateway, payment_amount, payment_currency, payment_status,
          status, affiliate_code, affiliate_id,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id,
        referenceNumber,
        data.serviceId,
        data.serviceTierId || null,
        data.customer.fullName,
        data.customer.email,
        data.customer.phone,
        data.customer.requirements,
        data.paymentGateway,
        data.amount,
        data.currency,
        'pending',
        'pending_contact',
        data.affiliateCode || null,
        data.affiliateId || null,
        now,
        now
      )
      .run();

    return { id, referenceNumber };
  }, { operation: 'createPendingServiceRequest', serviceId: data.serviceId });
}

/**
 * POST /api/services/purchase
 * Create a payment intent for service purchase
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */
async function handlePost(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  try {
    // Parse request body
    const data: PurchaseRequest = await request.json();

    // Validate request data (throws ValidationError if invalid)
    validatePurchaseRequest(data);

    // Get service details
    const service = await getServiceById(env.DB, data.serviceId);
    if (!service) {
      throw new NotFoundError('Service', data.serviceId);
    }

    // Determine price (from tier or base price)
    let amount = service.base_price;
    let currency = service.currency;
    let serviceTier: ServiceTier | null = null;

    if (data.serviceTierId) {
      serviceTier = await getServiceTierById(env.DB, data.serviceTierId);
      if (!serviceTier) {
        throw new NotFoundError('Service tier', data.serviceTierId);
      }

      // Verify tier belongs to service
      if (serviceTier.service_id !== service.id) {
        throw new ValidationError('Service tier does not belong to the specified service');
      }

      amount = serviceTier.price;
    }

    // Validate and get affiliate ID if affiliate code provided
    let affiliateId: string | null = null;
    if (data.affiliateCode) {
      affiliateId = await validateAffiliateCode(env.DB, data.affiliateCode);
      // If affiliate code is invalid or inactive, we still proceed but don't track it
    }

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
        throw new PaymentError('Payment gateway not configured. Please contact support.');
      }
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        {
          request: { method: request.method, url: request.url, requestId },
          additional: { operation: 'loadPaymentConfig' },
        }
      );
      throw new PaymentError('Payment gateway not configured. Please contact support.');
    }

    // Create payment gateway adapter
    const paymentGateway = PaymentGatewayFactory.create(paymentConfig);

    // Create pending service request
    const serviceRequest = await createPendingServiceRequest(env.DB, {
      serviceId: service.id,
      serviceTierId: serviceTier?.id,
      customer: data.customer,
      paymentGateway: paymentGateway.getGatewayName(),
      amount,
      currency,
      affiliateId: affiliateId || undefined,
      affiliateCode: data.affiliateCode,
    });

    // Create payment intent with network retry
    const paymentIntent = await withNetworkRetry(
      async () => {
        return await paymentGateway.createPaymentIntent({
          amount,
          currency,
          customerEmail: data.customer.email,
          customerName: data.customer.fullName,
          description: `${service.name}${serviceTier ? ` - ${serviceTier.name}` : ''}`,
          metadata: {
            service_request_id: serviceRequest.id,
            reference_number: serviceRequest.referenceNumber,
            service_id: service.id,
            service_tier_id: serviceTier?.id || '',
            affiliate_id: affiliateId || '',
            affiliate_code: data.affiliateCode || '',
          },
        });
      },
      { operation: 'createPaymentIntent', serviceRequestId: serviceRequest.id }
    );

    // Return payment intent to client
    return new Response(
      JSON.stringify({
        success: true,
        requestId: serviceRequest.id,
        referenceNumber: serviceRequest.referenceNumber,
        paymentIntent: {
          clientSecret: paymentIntent.clientSecret,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          gateway: paymentIntent.gateway,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
      }
    );
  } catch (error: any) {
    // Handle payment gateway errors
    if (error instanceof PaymentGatewayError) {
      const paymentError = new PaymentError(
        'Failed to create payment intent. Please try again.',
        error.code
      );
      logError(paymentError, {
        request: { method: request.method, url: request.url, requestId },
        additional: { originalError: error.message },
      });
      throw paymentError;
    }

    // Re-throw our custom errors
    if (error instanceof ValidationError || 
        error instanceof NotFoundError || 
        error instanceof PaymentError ||
        error instanceof DatabaseError) {
      throw error;
    }

    // Wrap unknown errors
    logError(
      error instanceof Error ? error : new Error(String(error)),
      {
        request: { method: request.method, url: request.url, requestId },
      }
    );
    throw error;
  }
}

/**
 * Main handler for /api/services/purchase
 * Wrapped with error handling middleware
 */
export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Wrap handler with error handling
  const handler = withErrorHandling(async (req: Request, environment: Env) => {
    switch (req.method) {
      case 'POST':
        return await handlePost(req, environment);
      default:
        throw new ValidationError('Method not allowed');
    }
  });

  const response = await handler(request, env, context);

  // Add CORS headers to response
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
