/**
 * Notification service for service purchase flow
 * Handles notifications to providers, admins, and customers
 * 
 * Requirements: 7.2, 7.3, 9.4
 */

import { EmailService, ProviderNotificationParams, StatusUpdateEmailParams } from './email';

/**
 * Service request interface for notifications
 */
export interface ServiceRequest {
  id: string;
  reference_number: string;
  service_id: string;
  service_tier_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_requirements: string;
  payment_amount: number;
  payment_currency: string;
  status: string;
  assigned_provider_id: string | null;
}

/**
 * Service interface
 */
export interface Service {
  id: string;
  name: string;
  description: string;
}

/**
 * User interface
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Notification event types
 */
export type NotificationEvent = 
  | 'payment_confirmed'
  | 'team_assigned'
  | 'status_updated'
  | 'completed';

/**
 * Notification service class
 */
export class NotificationService {
  private emailService: EmailService;
  private db: D1Database;

  constructor(emailService: EmailService, db: D1Database) {
    this.emailService = emailService;
    this.db = db;
  }

  /**
   * Notify service provider about new service request
   * Sends email to assigned provider or admin team
   * 
   * Requirements: 7.2, 7.3
   */
  async notifyProvider(request: ServiceRequest, service: Service): Promise<void> {
    try {
      // Get provider information
      let providerEmail: string;
      let providerName: string;

      if (request.assigned_provider_id) {
        // Get assigned provider
        const provider = await this.db
          .prepare('SELECT id, name, email, role FROM users WHERE id = ? AND status = ?')
          .bind(request.assigned_provider_id, 'active')
          .first<User>();

        if (!provider) {
          console.error('Assigned provider not found:', request.assigned_provider_id);
          // Fall back to admin notification
          await this.notifyAdmin(request, service);
          return;
        }

        providerEmail = provider.email;
        providerName = provider.name;
      } else {
        // No assigned provider, notify admin team
        await this.notifyAdmin(request, service);
        return;
      }

      // Send provider notification email
      const params: ProviderNotificationParams = {
        to: providerEmail,
        providerName,
        customerName: request.customer_name,
        customerEmail: request.customer_email,
        customerPhone: request.customer_phone,
        serviceName: service.name,
        requirements: request.customer_requirements,
        referenceNumber: request.reference_number,
        amount: request.payment_amount,
        currency: request.payment_currency,
      };

      const result = await this.emailService.sendProviderNotification(params);

      if (!result.sent) {
        console.error('Failed to send provider notification:', result.error);
        // Log failure but don't throw - notification failure shouldn't block the flow
      } else {
        console.log('Provider notification sent successfully:', result.messageId);
      }
    } catch (error) {
      console.error('Error sending provider notification:', error);
      // Don't throw - notification failure shouldn't block the flow
    }
  }

  /**
   * Notify admin team about new service request
   * Sends email to all active admin users
   * 
   * Requirements: 7.2, 7.3
   */
  async notifyAdmin(request: ServiceRequest, service: Service): Promise<void> {
    try {
      // Get all active admin users
      const admins = await this.db
        .prepare('SELECT id, name, email FROM users WHERE role = ? AND status = ?')
        .bind('admin', 'active')
        .all<User>();

      if (!admins.results || admins.results.length === 0) {
        console.error('No active admin users found for notification');
        return;
      }

      // Send notification to each admin
      const notificationPromises = admins.results.map(async (admin) => {
        const params: ProviderNotificationParams = {
          to: admin.email,
          providerName: admin.name,
          customerName: request.customer_name,
          customerEmail: request.customer_email,
          customerPhone: request.customer_phone,
          serviceName: service.name,
          requirements: request.customer_requirements,
          referenceNumber: request.reference_number,
          amount: request.payment_amount,
          currency: request.payment_currency,
        };

        return this.emailService.sendProviderNotification(params);
      });

      const results = await Promise.allSettled(notificationPromises);

      // Log results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.sent) {
          console.log(`Admin notification sent to ${admins.results![index].email}:`, result.value.messageId);
        } else if (result.status === 'fulfilled') {
          console.error(`Failed to send admin notification to ${admins.results![index].email}:`, result.value.error);
        } else {
          console.error(`Error sending admin notification to ${admins.results![index].email}:`, result.reason);
        }
      });
    } catch (error) {
      console.error('Error sending admin notifications:', error);
      // Don't throw - notification failure shouldn't block the flow
    }
  }

  /**
   * Notify customer about service request event
   * Sends appropriate email based on event type
   * 
   * Requirements: 9.4
   */
  async notifyCustomer(
    request: ServiceRequest,
    service: Service,
    event: NotificationEvent,
    additionalInfo?: {
      oldStatus?: string;
      message?: string;
      estimatedNextStep?: string;
    }
  ): Promise<void> {
    try {
      switch (event) {
        case 'payment_confirmed':
          // Confirmation email is sent separately by the webhook handler
          // This is just for logging
          console.log('Payment confirmation notification triggered for:', request.reference_number);
          break;

        case 'team_assigned':
          await this.sendStatusUpdateNotification(
            request,
            service,
            additionalInfo?.oldStatus || 'pending_contact',
            'team_assigned',
            'A team member has been assigned to your service request and will contact you shortly.',
            'Our team will reach out within 24-48 hours to discuss your requirements.'
          );
          break;

        case 'status_updated':
          if (additionalInfo?.oldStatus && additionalInfo?.message) {
            await this.sendStatusUpdateNotification(
              request,
              service,
              additionalInfo.oldStatus,
              request.status,
              additionalInfo.message,
              additionalInfo.estimatedNextStep
            );
          }
          break;

        case 'completed':
          await this.sendStatusUpdateNotification(
            request,
            service,
            additionalInfo?.oldStatus || 'in_progress',
            'completed',
            'Your service request has been completed. Thank you for choosing Bhavan.ai!',
            'If you need any further assistance, please don\'t hesitate to contact us.'
          );
          break;

        default:
          console.warn('Unknown notification event:', event);
      }
    } catch (error) {
      console.error('Error sending customer notification:', error);
      // Don't throw - notification failure shouldn't block the flow
    }
  }

  /**
   * Send status update notification to customer
   */
  private async sendStatusUpdateNotification(
    request: ServiceRequest,
    service: Service,
    oldStatus: string,
    newStatus: string,
    message: string,
    estimatedNextStep?: string
  ): Promise<void> {
    const params: StatusUpdateEmailParams = {
      to: request.customer_email,
      customerName: request.customer_name,
      referenceNumber: request.reference_number,
      serviceName: service.name,
      oldStatus,
      newStatus,
      message,
      estimatedNextStep,
    };

    const result = await this.emailService.sendStatusUpdateEmail(params);

    if (!result.sent) {
      console.error('Failed to send status update notification:', result.error);
    } else {
      console.log('Status update notification sent successfully:', result.messageId);
    }
  }
}

/**
 * Create notification service instance
 */
export function createNotificationService(
  emailService: EmailService,
  db: D1Database
): NotificationService {
  return new NotificationService(emailService, db);
}
