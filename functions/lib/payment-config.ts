/**
 * Payment Gateway Configuration Management
 * 
 * Handles loading, validation, and management of payment gateway configurations.
 * Supports multiple payment providers with encrypted credentials storage.
 */

import { PaymentGatewayConfig } from './payment-gateway';
import { PaymentGatewayFactory } from './payment-gateway-factory';

/**
 * Database record for payment gateway configuration
 */
export interface PaymentGatewayConfigRecord {
  id: string;
  provider: 'razorpay' | 'stripe' | 'paypal' | 'mock';
  is_active: number;
  is_default: number;
  api_key_encrypted: string;
  api_secret_encrypted: string;
  webhook_secret_encrypted: string;
  mode: 'test' | 'live';
  config_json: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Payment configuration service
 */
export class PaymentConfigService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Get the active payment gateway configuration
   * 
   * @returns Payment gateway configuration or null if none is active
   */
  async getActiveConfig(): Promise<PaymentGatewayConfig | null> {
    try {
      // First try to get the default active gateway
      const result = await this.db
        .prepare(
          `SELECT * FROM payment_gateway_config 
           WHERE is_active = 1 AND is_default = 1 
           LIMIT 1`
        )
        .first<PaymentGatewayConfigRecord>();

      // If no default, get any active gateway
      const config = result || await this.db
        .prepare(
          `SELECT * FROM payment_gateway_config 
           WHERE is_active = 1 
           ORDER BY created_at DESC 
           LIMIT 1`
        )
        .first<PaymentGatewayConfigRecord>();

      if (!config) {
        return null;
      }

      return this.decryptConfig(config);
    } catch (error) {
      console.error('Failed to get active payment config:', error);
      throw new Error('Failed to load payment gateway configuration');
    }
  }

  /**
   * Get configuration for a specific provider
   * 
   * @param provider - Payment provider name
   * @returns Payment gateway configuration or null if not found
   */
  async getConfigByProvider(
    provider: 'razorpay' | 'stripe' | 'paypal' | 'mock'
  ): Promise<PaymentGatewayConfig | null> {
    try {
      const config = await this.db
        .prepare(
          `SELECT * FROM payment_gateway_config 
           WHERE provider = ? AND is_active = 1 
           LIMIT 1`
        )
        .bind(provider)
        .first<PaymentGatewayConfigRecord>();

      if (!config) {
        return null;
      }

      return this.decryptConfig(config);
    } catch (error) {
      console.error(`Failed to get config for provider ${provider}:`, error);
      throw new Error(`Failed to load ${provider} configuration`);
    }
  }

  /**
   * Save or update payment gateway configuration
   * 
   * @param config - Payment gateway configuration to save
   * @returns Saved configuration ID
   */
  async saveConfig(config: PaymentGatewayConfig): Promise<string> {
    try {
      const id = `pgc_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const now = new Date().toISOString();

      // Encrypt sensitive data (in production, use proper encryption)
      const encryptedApiKey = this.encrypt(config.apiKey);
      const encryptedApiSecret = this.encrypt(config.apiSecret);
      const encryptedWebhookSecret = this.encrypt(config.webhookSecret);

      // Serialize additional config
      const configJson = config.additionalConfig
        ? JSON.stringify(config.additionalConfig)
        : null;

      // Check if config already exists for this provider
      const existing = await this.db
        .prepare('SELECT id FROM payment_gateway_config WHERE provider = ?')
        .bind(config.provider)
        .first<{ id: string }>();

      if (existing) {
        // Update existing config
        await this.db
          .prepare(
            `UPDATE payment_gateway_config 
             SET api_key_encrypted = ?, 
                 api_secret_encrypted = ?, 
                 webhook_secret_encrypted = ?,
                 mode = ?,
                 config_json = ?,
                 updated_at = ?
             WHERE id = ?`
          )
          .bind(
            encryptedApiKey,
            encryptedApiSecret,
            encryptedWebhookSecret,
            config.mode,
            configJson,
            now,
            existing.id
          )
          .run();

        return existing.id;
      } else {
        // Insert new config
        await this.db
          .prepare(
            `INSERT INTO payment_gateway_config (
              id, provider, is_active, is_default,
              api_key_encrypted, api_secret_encrypted, webhook_secret_encrypted,
              mode, config_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            id,
            config.provider,
            1, // is_active
            0, // is_default (set manually via setDefaultProvider)
            encryptedApiKey,
            encryptedApiSecret,
            encryptedWebhookSecret,
            config.mode,
            configJson,
            now,
            now
          )
          .run();

        return id;
      }
    } catch (error) {
      console.error('Failed to save payment config:', error);
      throw new Error('Failed to save payment gateway configuration');
    }
  }

  /**
   * Set a provider as the default payment gateway
   * 
   * @param provider - Provider to set as default
   */
  async setDefaultProvider(provider: 'razorpay' | 'stripe' | 'paypal' | 'mock'): Promise<void> {
    try {
      // Remove default flag from all providers
      await this.db
        .prepare('UPDATE payment_gateway_config SET is_default = 0')
        .run();

      // Set the specified provider as default
      await this.db
        .prepare(
          `UPDATE payment_gateway_config 
           SET is_default = 1, updated_at = ? 
           WHERE provider = ?`
        )
        .bind(new Date().toISOString(), provider)
        .run();
    } catch (error) {
      console.error('Failed to set default provider:', error);
      throw new Error('Failed to set default payment provider');
    }
  }

  /**
   * Activate or deactivate a payment provider
   * 
   * @param provider - Provider to activate/deactivate
   * @param active - Whether to activate (true) or deactivate (false)
   */
  async setProviderActive(
    provider: 'razorpay' | 'stripe' | 'paypal' | 'mock',
    active: boolean
  ): Promise<void> {
    try {
      await this.db
        .prepare(
          `UPDATE payment_gateway_config 
           SET is_active = ?, updated_at = ? 
           WHERE provider = ?`
        )
        .bind(active ? 1 : 0, new Date().toISOString(), provider)
        .run();
    } catch (error) {
      console.error('Failed to set provider active status:', error);
      throw new Error('Failed to update provider status');
    }
  }

  /**
   * Get all configured payment providers
   * 
   * @returns Array of provider names
   */
  async getConfiguredProviders(): Promise<string[]> {
    try {
      const results = await this.db
        .prepare('SELECT provider FROM payment_gateway_config WHERE is_active = 1')
        .all<{ provider: string }>();

      return results.results?.map(r => r.provider) || [];
    } catch (error) {
      console.error('Failed to get configured providers:', error);
      return [];
    }
  }

  /**
   * Decrypt configuration from database record
   * 
   * @param record - Database record
   * @returns Decrypted payment gateway configuration
   */
  private decryptConfig(record: PaymentGatewayConfigRecord): PaymentGatewayConfig {
    return {
      provider: record.provider,
      apiKey: this.decrypt(record.api_key_encrypted),
      apiSecret: this.decrypt(record.api_secret_encrypted),
      webhookSecret: this.decrypt(record.webhook_secret_encrypted),
      mode: record.mode,
      additionalConfig: record.config_json ? JSON.parse(record.config_json) : undefined,
    };
  }

  /**
   * Encrypt sensitive data
   * 
   * NOTE: This is a placeholder implementation. In production, use proper encryption
   * with a secure key management system (e.g., Cloudflare Workers KV with encryption,
   * or an external key management service).
   * 
   * @param data - Data to encrypt
   * @returns Encrypted data
   */
  private encrypt(data: string): string {
    // TODO: Implement proper encryption using Web Crypto API
    // For now, just base64 encode (NOT SECURE - for development only)
    return btoa(data);
  }

  /**
   * Decrypt sensitive data
   * 
   * NOTE: This is a placeholder implementation. In production, use proper decryption
   * matching the encryption method.
   * 
   * @param encryptedData - Encrypted data
   * @returns Decrypted data
   */
  private decrypt(encryptedData: string): string {
    // TODO: Implement proper decryption using Web Crypto API
    // For now, just base64 decode (NOT SECURE - for development only)
    return atob(encryptedData);
  }
}

/**
 * Helper function to get a payment gateway adapter from environment configuration
 * 
 * This is useful for development and testing when database configuration is not available.
 * 
 * @param env - Environment variables
 * @returns Payment gateway adapter or null if not configured
 */
export function getPaymentGatewayFromEnv(env: any): PaymentGatewayConfig | null {
  const provider = env.PAYMENT_GATEWAY_PROVIDER as 'razorpay' | 'stripe' | 'paypal' | 'mock' | undefined;
  
  if (!provider) {
    return null;
  }

  const apiKey = env.PAYMENT_GATEWAY_API_KEY;
  const apiSecret = env.PAYMENT_GATEWAY_API_SECRET;
  const webhookSecret = env.PAYMENT_GATEWAY_WEBHOOK_SECRET;
  const mode = (env.PAYMENT_GATEWAY_MODE || 'test') as 'test' | 'live';

  if (!apiKey || !apiSecret || !webhookSecret) {
    console.warn('Payment gateway environment variables are incomplete');
    return null;
  }

  return {
    provider,
    apiKey,
    apiSecret,
    webhookSecret,
    mode,
  };
}
