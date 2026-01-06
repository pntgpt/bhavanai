#!/bin/bash

# Production Deployment Script for Bhavan.ai
# This script runs all migrations and deploys to Cloudflare Pages

set -e

echo "🚀 Starting production deployment for Bhavan.ai..."
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: wrangler CLI is not installed"
    echo "Please install it with: npm install -g wrangler"
    exit 1
fi

# Confirm production deployment
echo "⚠️  WARNING: This will deploy to PRODUCTION!"
echo "This includes:"
echo "  - Running database migrations on production D1"
echo "  - Building and deploying the application to Cloudflare Pages"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

echo ""
echo "================================================"
echo "STEP 1: Running Database Migrations"
echo "================================================"
echo ""

# Migration 1: Affiliate Tracking
echo "📝 [1/3] Applying affiliate tracking migration..."
wrangler d1 execute bhavan-db --remote --file=migrations/001_add_affiliate_tracking.sql
if [ $? -eq 0 ]; then
    echo "✅ Affiliate tracking migration completed"
else
    echo "❌ Affiliate tracking migration failed"
    exit 1
fi

echo ""

# Migration 2: Service Purchase Flow
echo "📝 [2/3] Applying service purchase flow migration..."
wrangler d1 execute bhavan-db --remote --file=migrations/002_add_service_purchase_flow.sql
if [ $? -eq 0 ]; then
    echo "✅ Service purchase flow migration completed"
else
    echo "❌ Service purchase flow migration failed"
    exit 1
fi

echo ""

# Seed initial services
echo "📝 [2.5/3] Seeding initial services (CA and Legal)..."
wrangler d1 execute bhavan-db --remote --file=migrations/002_seed_initial_services.sql
if [ $? -eq 0 ]; then
    echo "✅ Initial services seeded"
else
    echo "❌ Service seeding failed"
    exit 1
fi

echo ""

# Migration 3: Affiliate Commissions
echo "📝 [3/3] Applying affiliate commission tracking migration..."
wrangler d1 execute bhavan-db --remote --file=migrations/003_add_affiliate_commissions.sql
if [ $? -eq 0 ]; then
    echo "✅ Affiliate commission migration completed"
else
    echo "❌ Affiliate commission migration failed"
    exit 1
fi

echo ""
echo "✅ All database migrations completed successfully!"
echo ""

# Verify migrations
echo "🔍 Verifying database tables..."
wrangler d1 execute bhavan-db --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"

echo ""
echo "================================================"
echo "STEP 2: Building Application"
echo "================================================"
echo ""

# Build the Next.js application
echo "🔨 Building Next.js application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "================================================"
echo "STEP 3: Deploying to Cloudflare Pages"
echo "================================================"
echo ""

# Deploy to Cloudflare Pages
echo "🚀 Deploying to Cloudflare Pages..."
wrangler pages deploy out --project-name=bhavanai

if [ $? -eq 0 ]; then
    echo "✅ Deployment completed successfully"
else
    echo "❌ Deployment failed"
    exit 1
fi

echo ""
echo "================================================"
echo "✅ PRODUCTION DEPLOYMENT COMPLETE!"
echo "================================================"
echo ""
echo "📊 Summary:"
echo "  ✅ Database migrations applied"
echo "  ✅ Application built"
echo "  ✅ Deployed to Cloudflare Pages"
echo ""
echo "🔗 Your site should be live at:"
echo "   https://bhavanai.pages.dev"
echo ""
echo "Next steps:"
echo "  1. Test the production site"
echo "  2. Verify database tables and data"
echo "  3. Configure custom domain if needed"
echo "  4. Set up production environment variables/secrets"
echo ""
