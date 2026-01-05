/**
 * Payment Gateway Adapter Interface
 * 
 * This module provides a pluggable architecture for integrating multiple payment providers.
 * It defines the core interfaces and types for payment processing, webhook handling, and refunds.
 */

/**
 * Parameters required to create a payment intent
 */
export interface PaymentIntentParams {
  /** Amount in the smallest currency unit (e.g., paise for INR, cents for USD) */
  amount: number;
  /** ISO 4217 currency code (e.g., 'INR', 'USD') */
  currency: string;
  /** Customer's email address */
  customerEmail: string;
  /** Customer's full name */
  customerName: string;
  /** Description of the payment */
  description: string;
  /** Additional metadata to attach to the payment */
  metadata: Record<string, string>;
}

/**
 * Payment intent created by the gateway
 */
export interface PaymentIntent {
  /** Client secret or token for frontend payment processing */
  clientSecret: string;
  /** Amount in the smallest currency unit */
  amount: number;
  /** ISO 4217 currency code */
  currency: string;
  /** Payment gateway identifier */
  gateway: string;
  /** Additional gateway-specific data */
  metadata?: Record<string, any>;
}

/**
 * Result of processing a payment webhook
 */
export interface PaymentWebhookResult {
  /** Unique transaction identifier from the payment gateway */
  transactionId: string;
  /** Payment status */
  status: 'success' | 'failed' | 'pending' | 'refunded';
  /** Amount in the smallest currency unit */
  amount: number;
  /** ISO 4217 currency code */
  currency: string;
  /** Metadata attached to the payment */
  metadata: Record<string, string>;
  /** Raw webhook payload for debugging */
  rawPayload?: any;
}

/**
 * Result of a refund operation
 */
export interface RefundResult {
  /** Unique refund identifier */
  refundId: string;
  /** Refunded amount in the smallest currency unit */
  amount: number;
  /** Refund status */
  status: 'success' | 'failed' | 'pending';
  /** Additional information about the refund */
  message?: string;
}

/**
 * Payment Gateway Adapter Interface
 * 
 * All payment gateway implementations must implement this interface to ensure
 * consistent behavior across different payment providers.
 */
export interface PaymentGatewayAdapter {
  /**
   * Create a payment intent for the specified amount
   * 
   * @param params - Payment intent parameters
   * @returns Promise resolving to a payment intent
   * @throws Error if payment intent creation fails
   */
  createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntent>;

  /**
   * Verify the authenticity of a webhook payload
   * 
   * @param payload - Raw webhook payload
   * @param signature - Webhook signature from the gateway
   * @returns true if the webhook is authentic, false otherwise
   */
  verifyWebhook(payload: any, signature: string): boolean;

  /**
   * Process a webhook payload and extract payment information
   * 
   * @param payload - Verified webhook payload
   * @returns Promise resolving to payment webhook result
   * @throws Error if webhook processing fails
   */
  processWebhook(payload: any): Promise<PaymentWebhookResult>;

  /**
   * Refund a payment transaction
   * 
   * @param transactionId - Transaction identifier to refund
   * @param amount - Optional partial refund amount (full refund if not specified)
   * @returns Promise resolving to refund result
   * @throws Error if refund fails
   */
  refund(transactionId: string, amount?: number): Promise<RefundResult>;

  /**
   * Get the gateway identifier
   * 
   * @returns Gateway name (e.g., 'razorpay', 'stripe')
   */
  getGatewayName(): string;
}

/**
 * Configuration for a payment gateway
 */
export interface PaymentGatewayConfig {
  /** Payment provider identifier */
  provider: 'razorpay' | 'stripe' | 'paypal' | 'mock';
  /** API key for the payment gateway */
  apiKey: string;
  /** API secret for the payment gateway */
  apiSecret: string;
  /** Webhook secret for signature verification */
  webhookSecret: string;
  /** Operating mode */
  mode: 'test' | 'live';
  /** Additional provider-specific configuration */
  additionalConfig?: Record<string, any>;
}

/**
 * Payment Gateway Error
 * 
 * Custom error class for payment gateway operations
 */
export class PaymentGatewayError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly gatewayName: string,
    public readonly originalError?: any
  ) {
    super(message);
    this.name = 'PaymentGatewayError';
  }
}
