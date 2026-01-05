/**
 * Payment Gateway Factory
 * 
 * Factory class for creating payment gateway adapter instances based on configuration.
 * Supports multiple payment providers through a pluggable architecture.
 */

import {
  PaymentGatewayAdapter,
  PaymentGatewayConfig,
  PaymentGatewayError,
} from './payment-gateway';
import { RazorpayAdapter } from './razorpay-adapter';
import { MockPaymentAdapter } from './mock-payment-adapter';

/**
 * Factory class for creating payment gateway adapters
 */
export class PaymentGatewayFactory {
  /**
   * Create a payment gateway adapter instance
   * 
   * @param config - Payment gateway configuration
   * @returns Payment gateway adapter instance
   * @throws PaymentGatewayError if the provider is not supported
   */
  static create(config: PaymentGatewayConfig): PaymentGatewayAdapter {
    // Validate configuration
    if (!config.provider) {
      throw new PaymentGatewayError(
        'Payment gateway provider is required',
        'INVALID_CONFIG',
        'unknown'
      );
    }

    if (!config.apiKey || !config.apiSecret) {
      throw new PaymentGatewayError(
        'API credentials are required',
        'INVALID_CONFIG',
        config.provider
      );
    }

    if (!config.webhookSecret) {
      throw new PaymentGatewayError(
        'Webhook secret is required',
        'INVALID_CONFIG',
        config.provider
      );
    }

    // Create adapter based on provider
    switch (config.provider) {
      case 'razorpay':
        return new RazorpayAdapter(config);

      case 'mock':
        return new MockPaymentAdapter({
          webhookSecret: config.webhookSecret,
          mode: config.mode,
        });

      case 'stripe':
        // Placeholder for future Stripe implementation
        throw new PaymentGatewayError(
          'Stripe adapter not yet implemented',
          'UNSUPPORTED_PROVIDER',
          'stripe'
        );

      case 'paypal':
        // Placeholder for future PayPal implementation
        throw new PaymentGatewayError(
          'PayPal adapter not yet implemented',
          'UNSUPPORTED_PROVIDER',
          'paypal'
        );

      default:
        throw new PaymentGatewayError(
          `Unsupported payment gateway provider: ${config.provider}`,
          'UNSUPPORTED_PROVIDER',
          config.provider
        );
    }
  }

  /**
   * Get list of supported payment gateway providers
   * 
   * @returns Array of supported provider names
   */
  static getSupportedProviders(): string[] {
    return ['razorpay', 'mock'];
  }

  /**
   * Check if a provider is supported
   * 
   * @param provider - Provider name to check
   * @returns true if the provider is supported
   */
  static isProviderSupported(provider: string): boolean {
    return this.getSupportedProviders().includes(provider);
  }
}
