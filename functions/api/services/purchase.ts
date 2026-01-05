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
 */
function validatePurchaseRequest(data: any): { valid: boolean; error?: string } {
  if (!data.serviceId) {
    return { valid: false, error: 'serviceId is required' };
  }

  if (!data.customer) {
    return { valid: false, error: 'customer information is required' };
  }

  const { fullName, email, phone, requirements } = data.customer;

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
    return { valid: false, error: 'customer.fullName is required' };
  }

  if (!email || typeof email !== 'string' || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return { valid: false, error: 'valid customer.email is required' };
  }

  if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
    return { valid: false, error: 'customer.phone is required' };
  }

  if (!requirements || typeof requirements !== 'string' || requirements.trim().length === 0) {
    return { valid: false, error: 'customer.requirements is required' };
  }

  return { valid: true };
}

/**
 * Get service by ID
 */
async function getServiceById(db: D1Database, serviceId: string): Promise<Service | null> {
  const result = await db
    .prepare('SELECT * FROM services WHERE id = ? AND is_active = 1')
    .bind(serviceId)
    .first<Service>();

  return result;
}

/**
 * Get service tier by ID
 */
async function getServiceTierById(db: D1Database, tierId: string): Promise<ServiceTier | null> {
  const result = await db
    .prepare('SELECT * FROM service_tiers WHERE id = ? AND is_active = 1')
    .bind(tierId)
    .first<ServiceTier>();

  return result;
}

/**
 * Validate affiliate code and get affiliate ID
 */
async function validateAffiliateCode(db: D1Database, affiliateCode: string): Promise<string | null> {
  const result = await db
    .prepare('SELECT id FROM affiliates WHERE id = ? AND status = ?')
    .bind(affiliateCode, 'active')
    .first<{ id: string }>();

  return result?.id || null;
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
 * Create a pending service request record
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
}

/**
 * POST /api/services/purchase
 * Create a payment intent for service purchase
 */
async function handlePost(request: Request, env: Env): Promise<Response> {
  try {
    // Parse request body
    const data: PurchaseRequest = await request.json();

    // Validate request data
    const validation = validatePurchaseRequest(data);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ success: false, error: validation.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get service details
    const service = await getServiceById(env.DB, data.serviceId);
    if (!service) {
      return new Response(
        JSON.stringify({ success: false, error: 'Service not found or inactive' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Determine price (from tier or base price)
    let amount = service.base_price;
    let currency = service.currency;
    let serviceTier: ServiceTier | null = null;

    if (data.serviceTierId) {
      serviceTier = await getServiceTierById(env.DB, data.serviceTierId);
      if (!serviceTier) {
        return new Response(
          JSON.stringify({ success: false, error: 'Service tier not found or inactive' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Verify tier belongs to service
      if (serviceTier.service_id !== service.id) {
        return new Response(
          JSON.stringify({ success: false, error: 'Service tier does not belong to the specified service' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
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
        throw new Error('No payment gateway configured');
      }
    } catch (error) {
      console.error('Failed to load payment gateway configuration:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment gateway not configured. Please contact support.' 
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
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

    // Create payment intent
    const paymentIntent = await paymentGateway.createPaymentIntent({
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
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('POST /api/services/purchase error:', error);

    // Handle payment gateway errors
    if (error instanceof PaymentGatewayError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to create payment intent. Please try again.',
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
 * Main handler for /api/services/purchase
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

  // Add CORS headers to response
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
