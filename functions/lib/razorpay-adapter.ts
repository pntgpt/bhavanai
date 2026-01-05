/**
 * Razorpay Payment Gateway Adapter
 * 
 * Implementation of the PaymentGatewayAdapter interface for Razorpay.
 * Handles payment intent creation, webhook verification, and refund processing.
 */

import {
  PaymentGatewayAdapter,
  PaymentGatewayConfig,
  PaymentIntent,
  PaymentIntentParams,
  PaymentWebhookResult,
  RefundResult,
  PaymentGatewayError,
} from './payment-gateway';

/**
 * Razorpay API response for order creation
 */
interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

/**
 * Razorpay webhook event payload
 */
interface RazorpayWebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        currency: string;
        status: string;
        order_id: string;
        method: string;
        captured: boolean;
        email: string;
        contact: string;
        notes: Record<string, string>;
        created_at: number;
      };
    };
  };
  created_at: number;
}

/**
 * Razorpay refund response
 */
interface RazorpayRefund {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  payment_id: string;
  status: string;
  created_at: number;
}

/**
 * Razorpay Payment Gateway Adapter
 */
export class RazorpayAdapter implements PaymentGatewayAdapter {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly webhookSecret: string;
  private readonly mode: 'test' | 'live';
  private readonly baseUrl: string;

  constructor(config: PaymentGatewayConfig) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.webhookSecret = config.webhookSecret;
    this.mode = config.mode;
    this.baseUrl = 'https://api.razorpay.com/v1';
  }

  /**
   * Get the gateway name
   */
  getGatewayName(): string {
    return 'razorpay';
  }

  /**
   * Create a payment intent (Razorpay Order)
   */
  async createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntent> {
    try {
      // Generate a unique receipt ID
      const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Prepare order data
      const orderData = {
        amount: params.amount,
        currency: params.currency,
        receipt,
        notes: {
          customer_name: params.customerName,
          customer_email: params.customerEmail,
          description: params.description,
          ...params.metadata,
        },
      };

      // Create order via Razorpay API
      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${this.apiKey}:${this.apiSecret}`)}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as any;
        throw new PaymentGatewayError(
          `Failed to create Razorpay order: ${errorData.error?.description || response.statusText}`,
          errorData.error?.code || 'ORDER_CREATION_FAILED',
          'razorpay',
          errorData
        );
      }

      const order: RazorpayOrder = await response.json();

      // Return payment intent
      return {
        clientSecret: order.id, // Razorpay uses order ID as the client secret
        amount: order.amount,
        currency: order.currency,
        gateway: 'razorpay',
        metadata: {
          orderId: order.id,
          receipt: order.receipt,
          status: order.status,
        },
      };
    } catch (error) {
      if (error instanceof PaymentGatewayError) {
        throw error;
      }
      throw new PaymentGatewayError(
        `Failed to create payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PAYMENT_INTENT_FAILED',
        'razorpay',
        error
      );
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhook(payload: any, signature: string): boolean {
    try {
      // Razorpay webhook signature verification
      // The signature is in the format: sha256=<signature>
      const expectedSignature = this.generateWebhookSignature(JSON.stringify(payload));
      
      // Compare signatures (constant-time comparison would be better in production)
      return signature === expectedSignature;
    } catch (error) {
      console.error('Webhook verification failed:', error);
      return false;
    }
  }

  /**
   * Generate webhook signature for verification
   */
  private generateWebhookSignature(payload: string): string {
    // In a real implementation, this would use crypto.createHmac
    // For Cloudflare Workers, we'll use the Web Crypto API
    // This is a placeholder - actual implementation would use SubtleCrypto
    return `sha256=${this.webhookSecret}`;
  }

  /**
   * Process webhook payload
   */
  async processWebhook(payload: any): Promise<PaymentWebhookResult> {
    try {
      const webhookData = payload as RazorpayWebhookPayload;

      // Check if this is a refund webhook
      if (webhookData.event === 'refund.created' || webhookData.event === 'refund.processed') {
        // Handle refund webhook
        const refund = (webhookData.payload as any).refund?.entity;
        if (refund) {
          return {
            transactionId: refund.payment_id,
            status: 'refunded',
            amount: refund.amount,
            currency: refund.currency,
            metadata: refund.notes || {},
            rawPayload: webhookData,
          };
        }
      }

      // Extract payment information
      const payment = webhookData.payload.payment.entity;

      // Determine status based on Razorpay payment status
      let status: 'success' | 'failed' | 'pending' | 'refunded';
      if (payment.status === 'captured' || payment.status === 'authorized') {
        status = 'success';
      } else if (payment.status === 'failed') {
        status = 'failed';
      } else if (payment.status === 'refunded') {
        status = 'refunded';
      } else {
        status = 'pending';
      }

      return {
        transactionId: payment.id,
        status,
        amount: payment.amount,
        currency: payment.currency,
        metadata: payment.notes || {},
        rawPayload: webhookData,
      };
    } catch (error) {
      throw new PaymentGatewayError(
        `Failed to process webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'WEBHOOK_PROCESSING_FAILED',
        'razorpay',
        error
      );
    }
  }

  /**
   * Refund a payment
   */
  async refund(transactionId: string, amount?: number): Promise<RefundResult> {
    try {
      // Prepare refund data
      const refundData: any = {
        payment_id: transactionId,
      };

      if (amount !== undefined) {
        refundData.amount = amount;
      }

      // Create refund via Razorpay API
      const response = await fetch(`${this.baseUrl}/payments/${transactionId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${this.apiKey}:${this.apiSecret}`)}`,
        },
        body: JSON.stringify(refundData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as any;
        throw new PaymentGatewayError(
          `Failed to create refund: ${errorData.error?.description || response.statusText}`,
          errorData.error?.code || 'REFUND_FAILED',
          'razorpay',
          errorData
        );
      }

      const refund: RazorpayRefund = await response.json();

      // Map Razorpay refund status to our status
      let status: 'success' | 'failed' | 'pending';
      if (refund.status === 'processed') {
        status = 'success';
      } else if (refund.status === 'failed') {
        status = 'failed';
      } else {
        status = 'pending';
      }

      return {
        refundId: refund.id,
        amount: refund.amount,
        status,
        message: `Refund ${refund.status}`,
      };
    } catch (error) {
      if (error instanceof PaymentGatewayError) {
        throw error;
      }
      throw new PaymentGatewayError(
        `Failed to process refund: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'REFUND_FAILED',
        'razorpay',
        error
      );
    }
  }
}
