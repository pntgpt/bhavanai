# Database Migrations

This directory contains database migration scripts for the Bhavan.ai platform.

## Migration Files

### 001_add_affiliate_tracking.sql
Adds affiliate tracking functionality to the database:
- Creates `affiliates` table for managing affiliate partners
- Creates `tracking_events` table for recording user actions attributed to affiliates
- Adds performance indexes for efficient querying
- Seeds the `NO_AFFILIATE_ID` affiliate for organic traffic tracking

## Running Migrations

### Local Development
```bash
# Run the migration script
./scripts/migrate-affiliate-tracking.sh

# Or manually with wrangler
wrangler d1 execute bhavan-db --local --file=migrations/001_add_affiliate_tracking.sql
```

### Production
```bash
# Apply to production database
wrangler d1 execute bhavan-db --remote --file=migrations/001_add_affiliate_tracking.sql
```

## Verifying Migrations

```bash
# List all tables
wrangler d1 execute bhavan-db --local --command="SELECT name FROM sqlite_master WHERE type='table'"

# Check affiliates table
wrangler d1 execute bhavan-db --local --command="SELECT * FROM affiliates"

# Check tracking_events table structure
wrangler d1 execute bhavan-db --local --command="PRAGMA table_info(tracking_events)"
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
```

**Note**: Rollback will delete all data in these tables. Only use in development or with proper backups.
