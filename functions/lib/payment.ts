/**
 * Payment Gateway Module
 * 
 * Central export point for all payment gateway related functionality.
 * This module provides a unified interface for payment processing across the application.
 */

// Core interfaces and types
export {
  PaymentGatewayAdapter,
  PaymentGatewayConfig,
  PaymentIntent,
  PaymentIntentParams,
  PaymentWebhookResult,
  RefundResult,
  PaymentGatewayError,
} from './payment-gateway';

// Factory for creating payment gateway instances
export { PaymentGatewayFactory } from './payment-gateway-factory';

// Payment gateway implementations
export { RazorpayAdapter } from './razorpay-adapter';

// Configuration management
export {
  PaymentConfigService,
  PaymentGatewayConfigRecord,
  getPaymentGatewayFromEnv,
} from './payment-config';
