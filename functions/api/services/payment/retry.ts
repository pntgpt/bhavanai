/**
 * Payment Retry API Endpoint
 * 
 * POST /api/services/payment/retry
 * Creates a new payment session for a failed service request
 * 
 * Allows users to retry payment for an existing service request
 * without having to re-enter all their information
 */

import { PaymentGatewayFactory } from '../../../lib/payment-gateway-factory';
import { getPaymentGatewayFromEnv } from '../../../lib/payment-config';

interface Env {
  DB: D1Database;
  PAYMENT_GATEWAY?: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
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
  status: string;
  created_at: number;
  updated_at: number;
}

interface Service {
  id: string;
  name: string;
  category: string;
}

interface ServiceTier {
  id: string;
  name: string;
  price: number;
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
    .prepare('SELECT id, name, category FROM services WHERE id = ?')
    .bind(serviceId)
    .first<Service>();

  return result;
}

/**
 * Get service tier by ID
 */
async function getServiceTierById(db: D1Database, tierId: string): Promise<ServiceTier | null> {
  const result = await db
    .prepare('SELECT id, name, price FROM service_tiers WHERE id = ?')
    .bind(tierId)
    .first<ServiceTier>();

  return result;
}

/**
 * POST /api/services/payment/retry
 * Create a new payment session for a failed service request
 */
async function handlePost(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as { referenceNumber?: string };
    const { referenceNumber } = body;

    // Validate input
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

    // Check if payment can be retried
    if (serviceRequest.payment_status === 'completed') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment already completed for this request' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
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

    // Build description
    const description = serviceTier
      ? `${service.name} - ${serviceTier.name}`
      : service.name;

    // Get payment gateway configuration from environment
    const paymentConfig = getPaymentGatewayFromEnv(env);
    
    if (!paymentConfig) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment gateway not configured' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize payment gateway
    const paymentGateway = PaymentGatewayFactory.create(paymentConfig);

    // Create payment intent
    const paymentIntent = await paymentGateway.createPaymentIntent({
      amount: serviceRequest.payment_amount,
      currency: serviceRequest.payment_currency,
      customerEmail: serviceRequest.customer_email,
      customerName: serviceRequest.customer_name,
      description,
      metadata: {
        reference_number: serviceRequest.reference_number,
        service_id: serviceRequest.service_id,
        service_tier_id: serviceRequest.service_tier_id || '',
        service_category: service.category,
      },
    });

    // Construct payment URL based on gateway type
    let paymentUrl: string;
    if (paymentIntent.gateway === 'mock') {
      // For mock gateway, redirect to mock payment page
      paymentUrl = `/services/mock-payment?clientSecret=${encodeURIComponent(paymentIntent.clientSecret)}`;
    } else {
      // For real gateways, this would be the gateway's payment page URL
      // For now, we'll return the client secret and let the frontend handle it
      paymentUrl = `/services/payment?clientSecret=${encodeURIComponent(paymentIntent.clientSecret)}&gateway=${paymentIntent.gateway}`;
    }

    // Return payment intent details
    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl,
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
    console.error('POST /api/services/payment/retry error:', error);

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to create payment intent' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Main handler for /api/services/payment/retry
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
