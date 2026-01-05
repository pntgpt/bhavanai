/**
 * Email service for sending transactional emails
 * Provides email templates and delivery with retry logic
 * 
 * Requirements: 6.1, 6.2, 6.4, 7.2, 7.3, 9.4
 */

/**
 * Email service configuration
 */
export interface EmailConfig {
  provider: 'sendgrid' | 'mailgun' | 'resend' | 'smtp';
  apiKey?: string;
  domain?: string;
  fromEmail: string;
  fromName: string;
}

/**
 * Email result interface
 */
export interface EmailResult {
  sent: boolean;
  messageId?: string;
  error?: string;
  attempts?: number;
}

/**
 * Confirmation email parameters
 */
export interface ConfirmationEmailParams {
  to: string;
  customerName: string;
  referenceNumber: string;
  serviceName: string;
  serviceDescription?: string;
  amount: number;
  currency: string;
  estimatedContact: string;
}

/**
 * Provider notification email parameters
 */
export interface ProviderNotificationParams {
  to: string;
  providerName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  requirements: string;
  referenceNumber: string;
  amount: number;
  currency: string;
}

/**
 * Status update email parameters
 */
export interface StatusUpdateEmailParams {
  to: string;
  customerName: string;
  referenceNumber: string;
  serviceName: string;
  oldStatus: string;
  newStatus: string;
  message: string;
  estimatedNextStep?: string;
}

/**
 * Email service class with retry logic
 */
export class EmailService {
  private config: EmailConfig;
  private maxRetries: number = 3;
  private baseDelay: number = 1000; // 1 second

  constructor(config: EmailConfig) {
    this.config = config;
  }

  /**
   * Send confirmation email to customer after successful payment
   * Implements retry logic with exponential backoff
   * 
   * Requirements: 6.1, 6.2, 6.4
   */
  async sendConfirmationEmail(params: ConfirmationEmailParams): Promise<EmailResult> {
    const subject = `Order Confirmation - ${params.serviceName} (Ref: ${params.referenceNumber})`;
    const html = this.generateConfirmationEmailHtml(params);
    const text = this.generateConfirmationEmailText(params);

    return await this.sendEmailWithRetry({
      to: params.to,
      subject,
      html,
      text,
    });
  }

  /**
   * Send notification to service provider about new service request
   * 
   * Requirements: 7.2, 7.3
   */
  async sendProviderNotification(params: ProviderNotificationParams): Promise<EmailResult> {
    const subject = `New Service Request - ${params.serviceName} (Ref: ${params.referenceNumber})`;
    const html = this.generateProviderNotificationHtml(params);
    const text = this.generateProviderNotificationText(params);

    return await this.sendEmailWithRetry({
      to: params.to,
      subject,
      html,
      text,
    });
  }

  /**
   * Send status update email to customer
   * 
   * Requirements: 9.4
   */
  async sendStatusUpdateEmail(params: StatusUpdateEmailParams): Promise<EmailResult> {
    const subject = `Service Request Update - ${params.serviceName} (Ref: ${params.referenceNumber})`;
    const html = this.generateStatusUpdateEmailHtml(params);
    const text = this.generateStatusUpdateEmailText(params);

    return await this.sendEmailWithRetry({
      to: params.to,
      subject,
      html,
      text,
    });
  }

  /**
   * Send email with retry logic and exponential backoff
   * Retries up to 3 times with exponential backoff
   * 
   * Requirements: 6.4
   */
  private async sendEmailWithRetry(
    emailData: {
      to: string;
      subject: string;
      html: string;
      text: string;
    },
    attempt: number = 1
  ): Promise<EmailResult> {
    try {
      const result = await this.sendEmail(emailData);
      
      if (result.sent) {
        return { ...result, attempts: attempt };
      }

      // If sending failed and we haven't exceeded max retries, retry
      if (attempt < this.maxRetries) {
        const delay = this.baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        await this.sleep(delay);
        return await this.sendEmailWithRetry(emailData, attempt + 1);
      }

      // Max retries exceeded
      return {
        sent: false,
        error: result.error || 'Max retries exceeded',
        attempts: attempt,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Retry on error if we haven't exceeded max retries
      if (attempt < this.maxRetries) {
        const delay = this.baseDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
        return await this.sendEmailWithRetry(emailData, attempt + 1);
      }

      return {
        sent: false,
        error: errorMessage,
        attempts: attempt,
      };
    }
  }

  /**
   * Send email using configured provider
   */
  private async sendEmail(emailData: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<EmailResult> {
    switch (this.config.provider) {
      case 'sendgrid':
        return await this.sendViaSendGrid(emailData);
      case 'mailgun':
        return await this.sendViaMailgun(emailData);
      case 'resend':
        return await this.sendViaResend(emailData);
      case 'smtp':
        return await this.sendViaSMTP(emailData);
      default:
        return {
          sent: false,
          error: `Unsupported email provider: ${this.config.provider}`,
        };
    }
  }

  /**
   * Send email via SendGrid
   */
  private async sendViaSendGrid(emailData: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<EmailResult> {
    if (!this.config.apiKey) {
      return { sent: false, error: 'SendGrid API key not configured' };
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: emailData.to }] }],
          from: {
            email: this.config.fromEmail,
            name: this.config.fromName,
          },
          subject: emailData.subject,
          content: [
            { type: 'text/plain', value: emailData.text },
            { type: 'text/html', value: emailData.html },
          ],
        }),
      });

      if (response.ok) {
        const messageId = response.headers.get('x-message-id') || undefined;
        return { sent: true, messageId };
      }

      const errorText = await response.text();
      return { sent: false, error: `SendGrid error: ${errorText}` };
    } catch (error) {
      return {
        sent: false,
        error: error instanceof Error ? error.message : 'SendGrid request failed',
      };
    }
  }

  /**
   * Send email via Mailgun
   */
  private async sendViaMailgun(emailData: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<EmailResult> {
    if (!this.config.apiKey || !this.config.domain) {
      return { sent: false, error: 'Mailgun API key or domain not configured' };
    }

    try {
      const formData = new FormData();
      formData.append('from', `${this.config.fromName} <${this.config.fromEmail}>`);
      formData.append('to', emailData.to);
      formData.append('subject', emailData.subject);
      formData.append('text', emailData.text);
      formData.append('html', emailData.html);

      const response = await fetch(
        `https://api.mailgun.net/v3/${this.config.domain}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`api:${this.config.apiKey}`)}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json() as { id?: string };
        return { sent: true, messageId: data.id };
      }

      const errorText = await response.text();
      return { sent: false, error: `Mailgun error: ${errorText}` };
    } catch (error) {
      return {
        sent: false,
        error: error instanceof Error ? error.message : 'Mailgun request failed',
      };
    }
  }

  /**
   * Send email via Resend
   */
  private async sendViaResend(emailData: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<EmailResult> {
    if (!this.config.apiKey) {
      return { sent: false, error: 'Resend API key not configured' };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${this.config.fromName} <${this.config.fromEmail}>`,
          to: [emailData.to],
          subject: emailData.subject,
          text: emailData.text,
          html: emailData.html,
        }),
      });

      if (response.ok) {
        const data = await response.json() as { id?: string };
        return { sent: true, messageId: data.id };
      }

      const errorText = await response.text();
      return { sent: false, error: `Resend error: ${errorText}` };
    } catch (error) {
      return {
        sent: false,
        error: error instanceof Error ? error.message : 'Resend request failed',
      };
    }
  }

  /**
   * Send email via SMTP (placeholder for future implementation)
   */
  private async sendViaSMTP(emailData: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<EmailResult> {
    // SMTP implementation would require additional dependencies
    // For now, return an error
    return {
      sent: false,
      error: 'SMTP provider not yet implemented',
    };
  }

  /**
   * Generate HTML for confirmation email
   */
  private generateConfirmationEmailHtml(params: ConfirmationEmailParams): string {
    const formattedAmount = this.formatCurrency(params.amount, params.currency);
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px 20px; }
    .success-icon { text-align: center; font-size: 48px; margin-bottom: 20px; }
    .info-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .info-box strong { display: block; margin-bottom: 5px; color: #667eea; }
    .details { margin: 20px 0; }
    .details-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .details-row:last-child { border-bottom: none; }
    .details-label { font-weight: 600; color: #666; }
    .details-value { color: #333; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
    .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Order Confirmed</h1>
    </div>
    <div class="content">
      <div class="success-icon">🎉</div>
      <p>Dear ${params.customerName},</p>
      <p>Thank you for your purchase! Your payment has been successfully processed.</p>
      
      <div class="info-box">
        <strong>Reference Number</strong>
        ${params.referenceNumber}
      </div>
      
      <div class="details">
        <div class="details-row">
          <span class="details-label">Service</span>
          <span class="details-value">${params.serviceName}</span>
        </div>
        ${params.serviceDescription ? `
        <div class="details-row">
          <span class="details-label">Description</span>
          <span class="details-value">${params.serviceDescription}</span>
        </div>
        ` : ''}
        <div class="details-row">
          <span class="details-label">Amount Paid</span>
          <span class="details-value">${formattedAmount}</span>
        </div>
      </div>
      
      <div class="info-box">
        <strong>What's Next?</strong>
        Our team will reach out to you ${params.estimatedContact} with more details about your service. Please keep your reference number handy for any future correspondence.
      </div>
      
      <p>If you have any questions, please don't hesitate to contact us with your reference number.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Bhavan.ai. All rights reserved.</p>
      <p>This is an automated email. Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate plain text for confirmation email
   */
  private generateConfirmationEmailText(params: ConfirmationEmailParams): string {
    const formattedAmount = this.formatCurrency(params.amount, params.currency);
    
    return `
Order Confirmation

Dear ${params.customerName},

Thank you for your purchase! Your payment has been successfully processed.

Reference Number: ${params.referenceNumber}

Order Details:
- Service: ${params.serviceName}
${params.serviceDescription ? `- Description: ${params.serviceDescription}\n` : ''}- Amount Paid: ${formattedAmount}

What's Next?
Our team will reach out to you ${params.estimatedContact} with more details about your service. Please keep your reference number handy for any future correspondence.

If you have any questions, please don't hesitate to contact us with your reference number.

© ${new Date().getFullYear()} Bhavan.ai. All rights reserved.
This is an automated email. Please do not reply to this message.
    `.trim();
  }

  /**
   * Generate HTML for provider notification email
   */
  private generateProviderNotificationHtml(params: ProviderNotificationParams): string {
    const formattedAmount = this.formatCurrency(params.amount, params.currency);
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Service Request</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px 20px; }
    .alert-icon { text-align: center; font-size: 48px; margin-bottom: 20px; }
    .info-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .info-box strong { display: block; margin-bottom: 5px; color: #856404; }
    .details { margin: 20px 0; }
    .details-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .details-row:last-child { border-bottom: none; }
    .details-label { font-weight: 600; color: #666; }
    .details-value { color: #333; }
    .requirements { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .requirements strong { display: block; margin-bottom: 10px; color: #333; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 New Service Request</h1>
    </div>
    <div class="content">
      <div class="alert-icon">📋</div>
      <p>Dear ${params.providerName},</p>
      <p>You have received a new service request that requires your attention.</p>
      
      <div class="info-box">
        <strong>Reference Number</strong>
        ${params.referenceNumber}
      </div>
      
      <div class="details">
        <div class="details-row">
          <span class="details-label">Service</span>
          <span class="details-value">${params.serviceName}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Amount</span>
          <span class="details-value">${formattedAmount}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Customer Name</span>
          <span class="details-value">${params.customerName}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Customer Email</span>
          <span class="details-value">${params.customerEmail}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Customer Phone</span>
          <span class="details-value">${params.customerPhone}</span>
        </div>
      </div>
      
      <div class="requirements">
        <strong>Customer Requirements:</strong>
        <p>${params.requirements.replace(/\n/g, '<br>')}</p>
      </div>
      
      <p><strong>Action Required:</strong> Please contact the customer within the next 24-48 hours to discuss their requirements and next steps.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Bhavan.ai. All rights reserved.</p>
      <p>This is an automated notification. Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate plain text for provider notification email
   */
  private generateProviderNotificationText(params: ProviderNotificationParams): string {
    const formattedAmount = this.formatCurrency(params.amount, params.currency);
    
    return `
New Service Request

Dear ${params.providerName},

You have received a new service request that requires your attention.

Reference Number: ${params.referenceNumber}

Service Details:
- Service: ${params.serviceName}
- Amount: ${formattedAmount}

Customer Information:
- Name: ${params.customerName}
- Email: ${params.customerEmail}
- Phone: ${params.customerPhone}

Customer Requirements:
${params.requirements}

Action Required:
Please contact the customer within the next 24-48 hours to discuss their requirements and next steps.

© ${new Date().getFullYear()} Bhavan.ai. All rights reserved.
This is an automated notification. Please do not reply to this message.
    `.trim();
  }

  /**
   * Generate HTML for status update email
   */
  private generateStatusUpdateEmailHtml(params: StatusUpdateEmailParams): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Service Request Update</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px 20px; }
    .update-icon { text-align: center; font-size: 48px; margin-bottom: 20px; }
    .info-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .info-box strong { display: block; margin-bottom: 5px; color: #667eea; }
    .status-change { background: #e7f3ff; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center; }
    .status-change .old-status { color: #666; text-decoration: line-through; }
    .status-change .arrow { margin: 0 10px; color: #667eea; font-size: 20px; }
    .status-change .new-status { color: #28a745; font-weight: bold; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📢 Service Request Update</h1>
    </div>
    <div class="content">
      <div class="update-icon">🔄</div>
      <p>Dear ${params.customerName},</p>
      <p>There's an update on your service request.</p>
      
      <div class="info-box">
        <strong>Reference Number</strong>
        ${params.referenceNumber}
      </div>
      
      <div class="info-box">
        <strong>Service</strong>
        ${params.serviceName}
      </div>
      
      <div class="status-change">
        <span class="old-status">${this.formatStatusLabel(params.oldStatus)}</span>
        <span class="arrow">→</span>
        <span class="new-status">${this.formatStatusLabel(params.newStatus)}</span>
      </div>
      
      <p>${params.message}</p>
      
      ${params.estimatedNextStep ? `
      <div class="info-box">
        <strong>Next Steps</strong>
        ${params.estimatedNextStep}
      </div>
      ` : ''}
      
      <p>If you have any questions, please contact us with your reference number.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Bhavan.ai. All rights reserved.</p>
      <p>This is an automated email. Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate plain text for status update email
   */
  private generateStatusUpdateEmailText(params: StatusUpdateEmailParams): string {
    return `
Service Request Update

Dear ${params.customerName},

There's an update on your service request.

Reference Number: ${params.referenceNumber}
Service: ${params.serviceName}

Status Update:
${this.formatStatusLabel(params.oldStatus)} → ${this.formatStatusLabel(params.newStatus)}

${params.message}

${params.estimatedNextStep ? `Next Steps:\n${params.estimatedNextStep}\n` : ''}
If you have any questions, please contact us with your reference number.

© ${new Date().getFullYear()} Bhavan.ai. All rights reserved.
This is an automated email. Please do not reply to this message.
    `.trim();
  }

  /**
   * Format currency amount
   */
  private formatCurrency(amount: number, currency: string): string {
    const currencySymbols: Record<string, string> = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };

    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Format status label for display
   */
  private formatStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      payment_confirmed: 'Payment Confirmed',
      pending_contact: 'Pending Contact',
      team_assigned: 'Team Assigned',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };

    return statusLabels[status] || status;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Create email service instance from environment variables
 */
export function createEmailService(env: {
  EMAIL_PROVIDER?: string;
  EMAIL_API_KEY?: string;
  EMAIL_DOMAIN?: string;
  EMAIL_FROM_ADDRESS?: string;
  EMAIL_FROM_NAME?: string;
}): EmailService {
  const config: EmailConfig = {
    provider: (env.EMAIL_PROVIDER as any) || 'resend',
    apiKey: env.EMAIL_API_KEY,
    domain: env.EMAIL_DOMAIN,
    fromEmail: env.EMAIL_FROM_ADDRESS || 'noreply@bhavan.ai',
    fromName: env.EMAIL_FROM_NAME || 'Bhavan.ai',
  };

  return new EmailService(config);
}
