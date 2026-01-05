/**
 * Payment Gateway Module
 * 
 * Central export point for all payment gateway related functionality.
 * This module provides a unified interface for payment processing across the application.
 */

// Core interfaces and types
export type {
  PaymentGatewayAdapter,
  PaymentGatewayConfig,
  PaymentIntent,
  PaymentIntentParams,
  PaymentWebhookResult,
  RefundResult,
} from './payment-gateway';

export { PaymentGatewayError } from './payment-gateway';

// Factory for creating payment gateway instances
export { PaymentGatewayFactory } from './payment-gateway-factory';

// Payment gateway implementations
export { RazorpayAdapter } from './razorpay-adapter';

// Configuration management
export type { PaymentGatewayConfigRecord } from './payment-config';
export { PaymentConfigService, getPaymentGatewayFromEnv } from './payment-config';
