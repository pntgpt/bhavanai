#!/bin/bash

# Migration script for affiliate commission tracking
# This script applies the affiliate commission migration to the D1 database

set -e

echo "Starting affiliate commission migration..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Error: wrangler CLI is not installed"
    echo "Install it with: npm install -g wrangler"
    exit 1
fi

# Check if migration file exists
if [ ! -f "migrations/003_add_affiliate_commissions.sql" ]; then
    echo "Error: Migration file not found at migrations/003_add_affiliate_commissions.sql"
    exit 1
fi

echo "Applying migration to D1 database..."

# Apply migration using wrangler d1 execute
wrangler d1 execute bhavan-db --file=migrations/003_add_affiliate_commissions.sql

echo "✓ Migration completed successfully!"
echo ""
echo "The following tables have been created:"
echo "  - affiliate_commission_config"
echo "  - affiliate_commissions"
echo ""
echo "Default commission configurations have been seeded:"
echo "  - Default: 10% commission"
echo "  - CA services: 15% commission"
echo "  - Legal services: 12% commission"
