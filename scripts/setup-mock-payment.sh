#!/bin/bash

# Setup Mock Payment Gateway
# This script configures the mock payment gateway for testing

echo "Setting up Mock Payment Gateway..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "Creating .env.local file..."
  touch .env.local
fi

# Add mock payment gateway configuration
echo ""
echo "Adding mock payment gateway configuration to .env.local..."

# Check if configuration already exists
if grep -q "PAYMENT_GATEWAY_PROVIDER" .env.local; then
  echo "Payment gateway configuration already exists in .env.local"
  echo "Please update manually if needed:"
  echo ""
  echo "PAYMENT_GATEWAY_PROVIDER=mock"
  echo "PAYMENT_GATEWAY_API_KEY=mock_api_key_12345"
  echo "PAYMENT_GATEWAY_API_SECRET=mock_api_secret_12345"
  echo "PAYMENT_GATEWAY_WEBHOOK_SECRET=mock_webhook_secret_12345"
  echo "PAYMENT_GATEWAY_MODE=test"
else
  # Append configuration
  cat >> .env.local << EOF

# Mock Payment Gateway Configuration (for testing)
PAYMENT_GATEWAY_PROVIDER=mock
PAYMENT_GATEWAY_API_KEY=mock_api_key_12345
PAYMENT_GATEWAY_API_SECRET=mock_api_secret_12345
PAYMENT_GATEWAY_WEBHOOK_SECRET=mock_webhook_secret_12345
PAYMENT_GATEWAY_MODE=test
EOF

  echo "✓ Mock payment gateway configuration added to .env.local"
fi

echo ""
echo "Mock Payment Gateway Setup Complete!"
echo ""
echo "The mock payment gateway allows you to test payment flows without a real payment processor."
echo "When you initiate a payment, you'll be redirected to a test page where you can choose:"
echo "  - Payment Success"
echo "  - Payment Failed"
echo "  - Payment Refunded"
echo ""
echo "To use the mock gateway, make sure your .env.local contains:"
echo "  PAYMENT_GATEWAY_PROVIDER=mock"
echo ""
echo "To switch to a real payment gateway (e.g., Razorpay), change the provider:"
echo "  PAYMENT_GATEWAY_PROVIDER=razorpay"
echo ""
