# Database Migrations

This directory contains database migration scripts for the Bhavan.ai platform.

## Migration Files

### 001_add_affiliate_tracking.sql
Adds affiliate tracking functionality to the database:
- Creates `affiliates` table for managing affiliate partners
- Creates `tracking_events` table for recording user actions attributed to affiliates
- Adds performance indexes for efficient querying
- Seeds the `NO_AFFILIATE_ID` affiliate for organic traffic tracking

### 002_add_service_purchase_flow.sql
Adds service purchase flow functionality to the database:
- Creates `services` table for managing available services (CA, Legal, etc.)
- Creates `service_tiers` table for service pricing tiers
- Creates `service_requests` table for tracking customer service purchases
- Creates `service_request_status_history` table for status change tracking
- Creates `payment_gateway_config` table for payment gateway configuration
- Adds comprehensive indexes for performance optimization

### 002_seed_initial_services.sql
Seeds initial service data:
- Adds CA (Chartered Accountant) service with 3 pricing tiers
- Adds Legal service with 3 pricing tiers
- Includes detailed features and pricing for each tier

## Running Migrations

### Local Development
```bash
# Run affiliate tracking migration
./scripts/migrate-affiliate-tracking.sh

# Run service purchase flow migration
./scripts/migrate-service-purchase-flow.sh local

# Or manually with wrangler
wrangler d1 execute bhavan-db --local --file=migrations/001_add_affiliate_tracking.sql
wrangler d1 execute bhavan-db --local --file=migrations/002_add_service_purchase_flow.sql
wrangler d1 execute bhavan-db --local --file=migrations/002_seed_initial_services.sql
```

### Production
```bash
# Apply affiliate tracking to production
wrangler d1 execute bhavan-db --remote --file=migrations/001_add_affiliate_tracking.sql

# Apply service purchase flow to production
./scripts/migrate-service-purchase-flow.sh remote

# Or manually
wrangler d1 execute bhavan-db --remote --file=migrations/002_add_service_purchase_flow.sql
wrangler d1 execute bhavan-db --remote --file=migrations/002_seed_initial_services.sql
```

## Verifying Migrations

```bash
# List all tables
wrangler d1 execute bhavan-db --local --command="SELECT name FROM sqlite_master WHERE type='table'"

# Check affiliates table
wrangler d1 execute bhavan-db --local --command="SELECT * FROM affiliates"

# Check tracking_events table structure
wrangler d1 execute bhavan-db --local --command="PRAGMA table_info(tracking_events)"

# Check services table
wrangler d1 execute bhavan-db --local --command="SELECT * FROM services"

# Check service_tiers table
wrangler d1 execute bhavan-db --local --command="SELECT * FROM service_tiers"

# Check service_requests table structure
wrangler d1 execute bhavan-db --local --command="PRAGMA table_info(service_requests)"

# Check payment_gateway_config table
wrangler d1 execute bhavan-db --local --command="SELECT provider, is_active, mode FROM payment_gateway_config"
```

## Migration Best Practices

1. **Always test locally first** - Run migrations on local database before production
2. **Use IF NOT EXISTS** - Migrations should be idempotent and safe to run multiple times
3. **Backup before production** - Always backup production database before applying migrations
4. **Version control** - All migrations are tracked in git with sequential numbering
5. **Document changes** - Each migration file includes description and date

## Rollback

If you need to rollback a migration, you'll need to manually drop the tables:

```bash
# Rollback affiliate tracking migration
wrangler d1 execute bhavan-db --local --command="DROP TABLE IF EXISTS tracking_events"
wrangler d1 execute bhavan-db --local --command="DROP TABLE IF EXISTS affiliates"

# Rollback service purchase flow migration
wrangler d1 execute bhavan-db --local --command="DROP TABLE IF EXISTS service_request_status_history"
wrangler d1 execute bhavan-db --local --command="DROP TABLE IF EXISTS service_requests"
wrangler d1 execute bhavan-db --local --command="DROP TABLE IF EXISTS service_tiers"
wrangler d1 execute bhavan-db --local --command="DROP TABLE IF EXISTS services"
wrangler d1 execute bhavan-db --local --command="DROP TABLE IF EXISTS payment_gateway_config"
```

**Note**: Rollback will delete all data in these tables. Only use in development or with proper backups.
