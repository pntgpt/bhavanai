/**
 * Mock Payment Gateway Adapter
 * 
 * Provides a test payment gateway for development and testing.
 * Allows manual control of payment outcomes through an interactive UI.
 */

import {
  PaymentGatewayAdapter,
  PaymentIntentParams,
  PaymentIntent,
  PaymentWebhookResult,
  RefundResult,
  PaymentGatewayError,
} from './payment-gateway';

/**
 * Mock Payment Gateway Adapter
 * 
 * This adapter simulates payment processing for testing purposes.
 * It generates mock payment intents and allows manual control of payment outcomes.
 */
export class MockPaymentAdapter implements PaymentGatewayAdapter {
  private webhookSecret: string;
  private mode: 'test' | 'live';

  constructor(config: { webhookSecret: string; mode: 'test' | 'live' }) {
    this.webhookSecret = config.webhookSecret;
    this.mode = config.mode;
  }

  /**
   * Create a mock payment intent
   * 
   * Generates a mock payment intent with a special client secret that
   * redirects to a test payment page where the outcome can be controlled.
   */
  async createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntent> {
    try {
      // Generate a mock transaction ID
      const mockTransactionId = `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Create a mock client secret that encodes the payment information
      const paymentData = {
        transactionId: mockTransactionId,
        amount: params.amount,
        currency: params.currency,
        customerEmail: params.customerEmail,
        customerName: params.customerName,
        description: params.description,
        metadata: params.metadata,
        timestamp: Date.now(),
      };

      // Encode payment data in the client secret
      const clientSecret = `mock_secret_${btoa(JSON.stringify(paymentData))}`;

      return {
        clientSecret,
        amount: params.amount,
        currency: params.currency,
        gateway: 'mock',
        metadata: {
          transactionId: mockTransactionId,
          mode: this.mode,
        },
      };
    } catch (error) {
      throw new PaymentGatewayError(
        'Failed to create mock payment intent',
        'MOCK_INTENT_CREATION_FAILED',
        'mock',
        error
      );
    }
  }

  /**
   * Verify mock webhook signature
   * 
   * For mock payments, we use a simple signature verification.
   */
  verifyWebhook(payload: any, signature: string): boolean {
    try {
      // For mock payments, verify the signature matches our webhook secret
      const expectedSignature = this.generateSignature(payload);
      return signature === expectedSignature;
    } catch (error) {
      console.error('Mock webhook verification failed:', error);
      return false;
    }
  }

  /**
   * Process mock webhook payload
   * 
   * Extracts payment information from the mock webhook payload.
   */
  async processWebhook(payload: any): Promise<PaymentWebhookResult> {
    try {
      const { event, data } = payload;

      if (!event || !data) {
        throw new Error('Invalid mock webhook payload structure');
      }

      // Map mock event types to payment statuses
      let status: 'success' | 'failed' | 'pending' | 'refunded';
      switch (event) {
        case 'payment.success':
          status = 'success';
          break;
        case 'payment.failed':
          status = 'failed';
          break;
        case 'payment.refunded':
          status = 'refunded';
          break;
        case 'payment.pending':
          status = 'pending';
          break;
        default:
          throw new Error(`Unknown mock event type: ${event}`);
      }

      return {
        transactionId: data.transactionId,
        status,
        amount: data.amount,
        currency: data.currency,
        metadata: data.metadata || {},
        rawPayload: payload,
      };
    } catch (error) {
      throw new PaymentGatewayError(
        'Failed to process mock webhook',
        'MOCK_WEBHOOK_PROCESSING_FAILED',
        'mock',
        error
      );
    }
  }

  /**
   * Process mock refund
   * 
   * Simulates a refund operation.
   */
  async refund(transactionId: string, amount?: number): Promise<RefundResult> {
    try {
      // Generate a mock refund ID
      const refundId = `mock_refund_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      return {
        refundId,
        amount: amount || 0, // Full refund if amount not specified
        status: 'success',
        message: 'Mock refund processed successfully',
      };
    } catch (error) {
      throw new PaymentGatewayError(
        'Failed to process mock refund',
        'MOCK_REFUND_FAILED',
        'mock',
        error
      );
    }
  }

  /**
   * Get gateway name
   */
  getGatewayName(): string {
    return 'mock';
  }

  /**
   * Generate signature for webhook verification
   */
  private generateSignature(payload: any): string {
    // Simple signature generation for mock payments
    const payloadString = JSON.stringify(payload);
    return `mock_sig_${btoa(payloadString + this.webhookSecret).substring(0, 32)}`;
  }
}

/**
 * Helper function to decode mock client secret
 * 
 * Extracts payment data from the mock client secret.
 */
export function decodeMockClientSecret(clientSecret: string): any {
  try {
    if (!clientSecret.startsWith('mock_secret_')) {
      throw new Error('Invalid mock client secret format');
    }

    const encodedData = clientSecret.replace('mock_secret_', '');
    const decodedData = atob(encodedData);
    return JSON.parse(decodedData);
  } catch (error) {
    throw new Error('Failed to decode mock client secret');
  }
}

/**
 * Helper function to generate mock webhook signature
 * 
 * Generates a signature that can be used to send mock webhooks.
 */
export function generateMockWebhookSignature(payload: any, webhookSecret: string): string {
  const payloadString = JSON.stringify(payload);
  return `mock_sig_${btoa(payloadString + webhookSecret).substring(0, 32)}`;
}
