#!/bin/bash

# Setup Email Configuration for Cloudflare Pages
# This script helps configure email service for sending confirmation emails

set -e

echo "🔧 Setting up Email Configuration for Cloudflare Pages"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: wrangler CLI is not installed"
    echo "Install it with: npm install -g wrangler"
    exit 1
fi

echo "📧 Email Configuration:"
echo "  Provider: resend"
echo "  From Address: noreply@bhavan.ai"
echo "  From Name: Bhavan.ai"
echo ""

# Add EMAIL_API_KEY as a secret
echo "🔐 Adding EMAIL_API_KEY as a secret..."
echo ""
echo "You will be prompted to enter your Resend API key."
echo "API Key: re_8ry9535e_carP8XuyXb2ZXbhMnHE7VTzb"
echo ""

# For Pages, we need to use the dashboard or wrangler pages secret
echo "⚠️  Note: For Cloudflare Pages, secrets must be added via the dashboard:"
echo ""
echo "1. Go to: https://dash.cloudflare.com"
echo "2. Navigate to: Workers & Pages → bhavanai → Settings → Environment Variables"
echo "3. Add the following variables for Production:"
echo ""
echo "   EMAIL_PROVIDER = resend"
echo "   EMAIL_API_KEY = re_8ry9535e_carP8XuyXb2ZXbhMnHE7VTzb"
echo "   EMAIL_FROM_ADDRESS = noreply@bhavan.ai"
echo "   EMAIL_FROM_NAME = Bhavan.ai"
echo ""
echo "4. (Optional) Add the same variables for Preview environment"
echo ""
echo "✅ After adding these variables, redeploy your site for changes to take effect"
echo ""
echo "📝 The non-sensitive values (EMAIL_PROVIDER, EMAIL_FROM_ADDRESS, EMAIL_FROM_NAME)"
echo "   have already been added to wrangler.pages.toml"
echo ""
