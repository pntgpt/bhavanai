#!/bin/bash

# Migration script for affiliate tracking tables
# This script applies the affiliate tracking migration to the Cloudflare D1 database

set -e

echo "🚀 Starting affiliate tracking migration..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: wrangler CLI is not installed"
    echo "Please install it with: npm install -g wrangler"
    exit 1
fi

# Get database name from wrangler.toml
DB_NAME=$(grep -A 5 "\[\[d1_databases\]\]" wrangler.toml | grep "database_name" | cut -d'"' -f2)

if [ -z "$DB_NAME" ]; then
    echo "❌ Error: Could not find database name in wrangler.toml"
    exit 1
fi

echo "📊 Database: $DB_NAME"

# Apply migration
echo "📝 Applying migration..."
wrangler d1 execute "$DB_NAME" --local --file=migrations/001_add_affiliate_tracking.sql

echo "✅ Migration completed successfully!"
echo ""
echo "Next steps:"
echo "1. For production: wrangler d1 execute $DB_NAME --remote --file=migrations/001_add_affiliate_tracking.sql"
echo "2. Verify tables: wrangler d1 execute $DB_NAME --local --command=\"SELECT name FROM sqlite_master WHERE type='table'\""
