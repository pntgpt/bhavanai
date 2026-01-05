# Mock Payment Gateway

A test payment gateway implementation for development and testing purposes. This allows you to test the complete payment flow without integrating a real payment processor.

## Features

- **Interactive Testing**: Choose payment outcomes (success, failure, refund) through a user-friendly interface
- **Complete Flow Testing**: Test the entire payment lifecycle including webhooks and notifications
- **No External Dependencies**: Works without API keys or external payment processor accounts
- **Realistic Simulation**: Mimics real payment gateway behavior including transaction IDs and webhooks

## Setup

### Quick Setup

Run the setup script to configure the mock payment gateway:

```bash
./scripts/setup-mock-payment.sh
```

This will add the following configuration to your `.env.local`:

```env
PAYMENT_GATEWAY_PROVIDER=mock
PAYMENT_GATEWAY_API_KEY=mock_api_key_12345
PAYMENT_GATEWAY_API_SECRET=mock_api_secret_12345
PAYMENT_GATEWAY_WEBHOOK_SECRET=mock_webhook_secret_12345
PAYMENT_GATEWAY_MODE=test
```

### Manual Setup

Alternatively, add these environment variables manually to your `.env.local` file.

## How It Works

### 1. Payment Initiation

When a user initiates a payment:
- The system creates a payment intent with mock credentials
- A mock client secret is generated containing all payment details
- The user is redirected to `/services/mock-payment` with the client secret

### 2. Mock Payment Page

The mock payment page displays:
- Payment amount and details
- Customer information
- Service description
- Transaction ID

The user can choose one of three outcomes:
- **Payment Success**: Simulates a successful payment
- **Payment Failed**: Simulates a failed payment attempt
- **Simulate Refund**: Simulates a refunded payment

### 3. Webhook Processing

When the user selects an outcome:
- A mock webhook is generated with the appropriate event type
- The webhook is sent to `/api/services/payment/webhook`
- The webhook signature is verified using the mock webhook secret
- The payment status is updated in the database
- Notifications are sent (confirmation emails, provider notifications)
- Affiliate commissions are created (for successful payments) or cancelled (for refunds)

### 4. Confirmation

After webhook processing:
- The user is redirected to the confirmation page
- They see their reference number and payment status
- They can track their service request

## Testing Scenarios

### Test Successful Payment

1. Go to the services page
2. Select a service and fill in the purchase form
3. Click "Proceed to Payment"
4. On the mock payment page, click "Payment Success"
5. Verify you're redirected to the confirmation page
6. Check that you receive a confirmation email
7. Verify the service request appears in the admin dashboard

### Test Failed Payment

1. Follow steps 1-3 above
2. On the mock payment page, click "Payment Failed"
3. Verify the payment status is marked as failed
4. Check that the service request status is "cancelled"

### Test Refund Flow

1. Follow steps 1-3 above
2. On the mock payment page, click "Simulate Refund"
3. Verify the payment status is marked as refunded
4. Check that affiliate commissions (if any) are cancelled
5. Verify the customer receives a refund notification email

### Test Affiliate Tracking

1. Add an affiliate code to the URL: `?aff=AFFILIATE_CODE`
2. Complete a successful payment
3. Verify the affiliate tracking event is created
4. Check that a commission record is created for the affiliate
5. Test refund and verify the commission is cancelled

## Architecture

### Components

- **MockPaymentAdapter** (`functions/lib/mock-payment-adapter.ts`): Payment gateway adapter implementation
- **MockPaymentPage** (`app/services/mock-payment/MockPaymentPage.tsx`): Interactive payment testing UI
- **PaymentButton** (`components/ui/PaymentButton.tsx`): Handles payment initiation and gateway detection

### Flow Diagram

```
User Initiates Payment
        ↓
Create Payment Intent (Mock)
        ↓
Redirect to Mock Payment Page
        ↓
User Selects Outcome
        ↓
Generate Mock Webhook
        ↓
Send to Webhook Endpoint
        ↓
Process Payment Status
        ↓
Update Database
        ↓
Send Notifications
        ↓
Redirect to Confirmation
```

## Switching to Real Payment Gateway

When you're ready to use a real payment gateway:

1. Update your `.env.local`:
   ```env
   PAYMENT_GATEWAY_PROVIDER=razorpay
   PAYMENT_GATEWAY_API_KEY=your_razorpay_key
   PAYMENT_GATEWAY_API_SECRET=your_razorpay_secret
   PAYMENT_GATEWAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
   PAYMENT_GATEWAY_MODE=test
   ```

2. The system will automatically use the Razorpay adapter instead of the mock adapter

3. No code changes required - the payment gateway factory handles the switch

## Database Configuration

You can also configure payment gateways through the database:

```sql
INSERT INTO payment_gateway_config (
  id, provider, is_active, is_default,
  api_key_encrypted, api_secret_encrypted, webhook_secret_encrypted,
  mode, created_at, updated_at
) VALUES (
  'pgc_mock_001',
  'mock',
  1,
  1,
  'bW9ja19hcGlfa2V5XzEyMzQ1',  -- base64 encoded
  'bW9ja19hcGlfc2VjcmV0XzEyMzQ1',  -- base64 encoded
  'bW9ja193ZWJob29rX3NlY3JldF8xMjM0NQ==',  -- base64 encoded
  'test',
  datetime('now'),
  datetime('now')
);
```

Database configuration takes precedence over environment variables.

## Security Notes

- The mock payment gateway should **NEVER** be used in production
- Mock credentials are intentionally simple and not secure
- Always use `PAYMENT_GATEWAY_MODE=test` with the mock gateway
- Ensure `PAYMENT_GATEWAY_PROVIDER=mock` is not set in production environments

## Troubleshooting

### Payment page doesn't load

- Check that the client secret is in the URL
- Verify the client secret starts with `mock_secret_`
- Check browser console for errors

### Webhook not processing

- Verify the webhook secret matches in both the adapter and the webhook endpoint
- Check the webhook signature generation
- Look for errors in the server logs

### Redirect not working

- Ensure the confirmation page route exists
- Check that the reference number is being passed correctly
- Verify the URL encoding is correct

## API Reference

### Mock Payment Adapter

```typescript
import { MockPaymentAdapter } from '@/functions/lib/mock-payment-adapter';

const adapter = new MockPaymentAdapter({
  webhookSecret: 'mock_webhook_secret_12345',
  mode: 'test',
});

// Create payment intent
const intent = await adapter.createPaymentIntent({
  amount: 50000,  // in smallest currency unit (paise)
  currency: 'INR',
  customerEmail: 'customer@example.com',
  customerName: 'John Doe',
  description: 'Service Purchase',
  metadata: { serviceRequestId: 'sr_123' },
});
```

### Helper Functions

```typescript
import { 
  decodeMockClientSecret,
  generateMockWebhookSignature 
} from '@/functions/lib/mock-payment-adapter';

// Decode client secret
const paymentData = decodeMockClientSecret(clientSecret);

// Generate webhook signature
const signature = generateMockWebhookSignature(payload, webhookSecret);
```

## Contributing

When adding new payment gateway features, ensure they work with the mock adapter for testing purposes.
