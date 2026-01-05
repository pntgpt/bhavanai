/**
 * Mock Payment Adapter Tests
 * 
 * Tests for the mock payment gateway adapter functionality
 */

import { describe, it, expect } from '@jest/globals';
import { 
  MockPaymentAdapter,
  decodeMockClientSecret,
  generateMockWebhookSignature,
} from '../mock-payment-adapter';

describe('MockPaymentAdapter', () => {
  const adapter = new MockPaymentAdapter({
    webhookSecret: 'test_webhook_secret',
    mode: 'test',
  });

  describe('createPaymentIntent', () => {
    it('should create a valid payment intent', async () => {
      const params = {
        amount: 50000,
        currency: 'INR',
        customerEmail: 'test@example.com',
        customerName: 'Test User',
        description: 'Test Service',
        metadata: {
          service_request_id: 'sr_123',
          reference_number: 'REF123',
        },
      };

      const intent = await adapter.createPaymentIntent(params);

      expect(intent).toBeDefined();
      expect(intent.clientSecret).toMatch(/^mock_secret_/);
      expect(intent.amount).toBe(params.amount);
      expect(intent.currency).toBe(params.currency);
      expect(intent.gateway).toBe('mock');
      expect(intent.metadata).toBeDefined();
      expect(intent.metadata?.mode).toBe('test');
    });

    it('should encode payment data in client secret', async () => {
      const params = {
        amount: 50000,
        currency: 'INR',
        customerEmail: 'test@example.com',
        customerName: 'Test User',
        description: 'Test Service',
        metadata: {
          service_request_id: 'sr_123',
        },
      };

      const intent = await adapter.createPaymentIntent(params);
      const decoded = decodeMockClientSecret(intent.clientSecret);

      expect(decoded.amount).toBe(params.amount);
      expect(decoded.currency).toBe(params.currency);
      expect(decoded.customerEmail).toBe(params.customerEmail);
      expect(decoded.customerName).toBe(params.customerName);
      expect(decoded.description).toBe(params.description);
      expect(decoded.metadata).toEqual(params.metadata);
    });
  });

  describe('verifyWebhook', () => {
    it('should verify valid webhook signature', () => {
      const payload = {
        event: 'payment.success',
        data: {
          transactionId: 'mock_123',
          amount: 50000,
          currency: 'INR',
        },
      };

      const signature = generateMockWebhookSignature(payload, 'test_webhook_secret');
      const isValid = adapter.verifyWebhook(payload, signature);

      expect(isValid).toBe(true);
    });

    it('should reject invalid webhook signature', () => {
      const payload = {
        event: 'payment.success',
        data: {
          transactionId: 'mock_123',
          amount: 50000,
          currency: 'INR',
        },
      };

      const isValid = adapter.verifyWebhook(payload, 'invalid_signature');

      expect(isValid).toBe(false);
    });
  });

  describe('processWebhook', () => {
    it('should process successful payment webhook', async () => {
      const payload = {
        event: 'payment.success',
        data: {
          transactionId: 'mock_123',
          amount: 50000,
          currency: 'INR',
          metadata: {
            service_request_id: 'sr_123',
          },
        },
      };

      const result = await adapter.processWebhook(payload);

      expect(result.transactionId).toBe('mock_123');
      expect(result.status).toBe('success');
      expect(result.amount).toBe(50000);
      expect(result.currency).toBe('INR');
      expect(result.metadata.service_request_id).toBe('sr_123');
    });

    it('should process failed payment webhook', async () => {
      const payload = {
        event: 'payment.failed',
        data: {
          transactionId: 'mock_456',
          amount: 50000,
          currency: 'INR',
          metadata: {},
        },
      };

      const result = await adapter.processWebhook(payload);

      expect(result.status).toBe('failed');
    });

    it('should process refunded payment webhook', async () => {
      const payload = {
        event: 'payment.refunded',
        data: {
          transactionId: 'mock_789',
          amount: 50000,
          currency: 'INR',
          metadata: {},
        },
      };

      const result = await adapter.processWebhook(payload);

      expect(result.status).toBe('refunded');
    });

    it('should throw error for invalid webhook payload', async () => {
      const payload = {
        event: 'invalid.event',
        data: {},
      };

      await expect(adapter.processWebhook(payload)).rejects.toThrow();
    });
  });

  describe('refund', () => {
    it('should process refund successfully', async () => {
      const result = await adapter.refund('mock_123', 50000);

      expect(result.refundId).toMatch(/^mock_refund_/);
      expect(result.amount).toBe(50000);
      expect(result.status).toBe('success');
    });

    it('should process full refund when amount not specified', async () => {
      const result = await adapter.refund('mock_123');

      expect(result.refundId).toMatch(/^mock_refund_/);
      expect(result.status).toBe('success');
    });
  });

  describe('getGatewayName', () => {
    it('should return "mock" as gateway name', () => {
      expect(adapter.getGatewayName()).toBe('mock');
    });
  });
});

describe('Helper Functions', () => {
  describe('decodeMockClientSecret', () => {
    it('should decode valid mock client secret', () => {
      const data = {
        transactionId: 'mock_123',
        amount: 50000,
        currency: 'INR',
      };

      const encoded = `mock_secret_${btoa(JSON.stringify(data))}`;
      const decoded = decodeMockClientSecret(encoded);

      expect(decoded).toEqual(data);
    });

    it('should throw error for invalid format', () => {
      expect(() => decodeMockClientSecret('invalid_secret')).toThrow();
    });

    it('should throw error for invalid base64', () => {
      expect(() => decodeMockClientSecret('mock_secret_invalid!!!')).toThrow();
    });
  });

  describe('generateMockWebhookSignature', () => {
    it('should generate consistent signatures', () => {
      const payload = { event: 'test', data: {} };
      const secret = 'test_secret';

      const sig1 = generateMockWebhookSignature(payload, secret);
      const sig2 = generateMockWebhookSignature(payload, secret);

      expect(sig1).toBe(sig2);
    });

    it('should generate different signatures for different payloads', () => {
      const payload1 = { event: 'test1', data: {} };
      const payload2 = { event: 'test2', data: {} };
      const secret = 'test_secret';

      const sig1 = generateMockWebhookSignature(payload1, secret);
      const sig2 = generateMockWebhookSignature(payload2, secret);

      expect(sig1).not.toBe(sig2);
    });

    it('should generate different signatures for different secrets', () => {
      const payload = { event: 'test', data: {} };
      const secret1 = 'test_secret_1';
      const secret2 = 'test_secret_2';

      const sig1 = generateMockWebhookSignature(payload, secret1);
      const sig2 = generateMockWebhookSignature(payload, secret2);

      expect(sig1).not.toBe(sig2);
    });
  });
});
