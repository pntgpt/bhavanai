#!/bin/bash

# Migration script for service purchase flow
# This script applies the service purchase flow migration to the database

set -e

echo "🚀 Starting service purchase flow migration..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: wrangler CLI is not installed"
    echo "Please install it with: npm install -g wrangler"
    exit 1
fi

# Determine environment (default to local)
ENV=${1:-local}

if [ "$ENV" = "local" ]; then
    echo "📍 Running migration on LOCAL database..."
    FLAG="--local"
elif [ "$ENV" = "remote" ] || [ "$ENV" = "production" ]; then
    echo "📍 Running migration on REMOTE (production) database..."
    echo "⚠️  WARNING: This will modify the production database!"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "❌ Migration cancelled"
        exit 0
    fi
    FLAG="--remote"
else
    echo "❌ Error: Invalid environment '$ENV'"
    echo "Usage: $0 [local|remote|production]"
    exit 1
fi

# Apply schema migration
echo "📝 Applying service purchase flow schema..."
wrangler d1 execute bhavan-db $FLAG --file=migrations/002_add_service_purchase_flow.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema migration completed successfully"
else
    echo "❌ Schema migration failed"
    exit 1
fi

# Apply seed data
echo "📝 Seeding initial services (CA and Legal)..."
wrangler d1 execute bhavan-db $FLAG --file=migrations/002_seed_initial_services.sql

if [ $? -eq 0 ]; then
    echo "✅ Seed data applied successfully"
else
    echo "❌ Seed data failed"
    exit 1
fi

# Verify migration
echo "🔍 Verifying migration..."
echo "Checking services table..."
wrangler d1 execute bhavan-db $FLAG --command="SELECT COUNT(*) as service_count FROM services"

echo "Checking service_tiers table..."
wrangler d1 execute bhavan-db $FLAG --command="SELECT COUNT(*) as tier_count FROM service_tiers"

echo "Checking service_requests table..."
wrangler d1 execute bhavan-db $FLAG --command="SELECT COUNT(*) as request_count FROM service_requests"

echo ""
echo "✅ Service purchase flow migration completed successfully!"
echo ""
echo "📊 Summary:"
echo "  - Created services table"
echo "  - Created service_tiers table"
echo "  - Created service_requests table"
echo "  - Created service_request_status_history table"
echo "  - Created payment_gateway_config table"
echo "  - Added performance indexes"
echo "  - Seeded CA and Legal services with tiers"
echo ""
echo "Next steps:"
echo "  1. Verify the data: wrangler d1 execute bhavan-db $FLAG --command=\"SELECT * FROM services\""
echo "  2. Check service tiers: wrangler d1 execute bhavan-db $FLAG --command=\"SELECT * FROM service_tiers\""
echo ""

