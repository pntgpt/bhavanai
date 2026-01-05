/**
 * Payment Gateway Infrastructure Tests
 * 
 * Basic tests to verify the payment gateway adapter infrastructure works correctly.
 */

import { describe, it, expect } from 'vitest';
import { PaymentGatewayFactory } from '../payment-gateway-factory';
import { PaymentGatewayConfig, PaymentGatewayError } from '../payment-gateway';

describe('PaymentGatewayFactory', () => {
  it('should create a Razorpay adapter with valid config', () => {
    const config: PaymentGatewayConfig = {
      provider: 'razorpay',
      apiKey: 'test_key',
      apiSecret: 'test_secret',
      webhookSecret: 'test_webhook_secret',
      mode: 'test',
    };

    const adapter = PaymentGatewayFactory.create(config);
    expect(adapter).toBeDefined();
    expect(adapter.getGatewayName()).toBe('razorpay');
  });

  it('should throw error for missing provider', () => {
    const config = {
      apiKey: 'test_key',
      apiSecret: 'test_secret',
      webhookSecret: 'test_webhook_secret',
      mode: 'test',
    } as any;

    expect(() => PaymentGatewayFactory.create(config)).toThrow(PaymentGatewayError);
  });

  it('should throw error for missing API credentials', () => {
    const config = {
      provider: 'razorpay',
      webhookSecret: 'test_webhook_secret',
      mode: 'test',
    } as any;

    expect(() => PaymentGatewayFactory.create(config)).toThrow(PaymentGatewayError);
  });

  it('should throw error for unsupported provider', () => {
    const config: PaymentGatewayConfig = {
      provider: 'stripe' as any,
      apiKey: 'test_key',
      apiSecret: 'test_secret',
      webhookSecret: 'test_webhook_secret',
      mode: 'test',
    };

    expect(() => PaymentGatewayFactory.create(config)).toThrow(PaymentGatewayError);
  });

  it('should return list of supported providers', () => {
    const providers = PaymentGatewayFactory.getSupportedProviders();
    expect(providers).toContain('razorpay');
    expect(Array.isArray(providers)).toBe(true);
  });

  it('should check if provider is supported', () => {
    expect(PaymentGatewayFactory.isProviderSupported('razorpay')).toBe(true);
    expect(PaymentGatewayFactory.isProviderSupported('stripe')).toBe(false);
    expect(PaymentGatewayFactory.isProviderSupported('paypal')).toBe(false);
  });
});

describe('RazorpayAdapter', () => {
  const config: PaymentGatewayConfig = {
    provider: 'razorpay',
    apiKey: 'test_key',
    apiSecret: 'test_secret',
    webhookSecret: 'test_webhook_secret',
    mode: 'test',
  };

  it('should have correct gateway name', () => {
    const adapter = PaymentGatewayFactory.create(config);
    expect(adapter.getGatewayName()).toBe('razorpay');
  });

  it('should implement all required interface methods', () => {
    const adapter = PaymentGatewayFactory.create(config);
    expect(typeof adapter.createPaymentIntent).toBe('function');
    expect(typeof adapter.verifyWebhook).toBe('function');
    expect(typeof adapter.processWebhook).toBe('function');
    expect(typeof adapter.refund).toBe('function');
    expect(typeof adapter.getGatewayName).toBe('function');
  });
});
