# Database Setup Guide

This guide walks you through setting up the Cloudflare D1 database for the Bhavan.ai website.

## Prerequisites

- Wrangler CLI installed (`npm install -g wrangler`)
- Cloudflare account with D1 access
- Authenticated with Wrangler (`wrangler login`)

## Step 1: Create D1 Database

Create a new D1 database using the Wrangler CLI:

```bash
wrangler d1 create bhavan-db
```

This command will output a database ID. Copy this ID and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "bhavan-db"
database_id = "your-database-id-here"  # Replace with actual ID
```

## Step 2: Run Database Migrations

Execute the schema SQL file to create tables and indexes:

```bash
wrangler d1 execute bhavan-db --file=./schema.sql
```

This creates:
- `users` table: Stores admin, broker, CA, and lawyer accounts
- `properties` table: Stores property listings with approval workflow
- `sessions` table: Manages authentication sessions
- Performance indexes on key columns

## Step 3: Seed Initial Admin User

Generate the seed SQL file:

```bash
# Install bcryptjs if not already installed
npm install bcryptjs

# Generate seed SQL
node scripts/seed-admin.js > seed.sql
```

Execute the seed file:

```bash
wrangler d1 execute bhavan-db --file=./seed.sql
```

**Default Admin Credentials:**
- Email: `admin@bhavan.ai`
- Password: `Admin@123`

⚠️ **IMPORTANT:** Change this password immediately after first login!

## Step 4: Verify Database Setup

Query the database to verify the admin user was created:

```bash
wrangler d1 execute bhavan-db --command="SELECT id, name, email, role, status FROM users WHERE role = 'admin';"
```

You should see the admin user in the output.

## Step 5: Create R2 Bucket for Images

Create an R2 bucket for storing property images:

```bash
wrangler r2 bucket create bhavan-images
```

This bucket is already configured in `wrangler.toml` with the binding name `IMAGES`.

## Local Development

For local development, you can use Wrangler's local mode:

```bash
# Run with local D1 database
wrangler pages dev out --d1=DB=bhavan-db
```

Or create a local SQLite database for testing:

```bash
# Create local database
sqlite3 local.db < schema.sql

# Seed admin user locally
node scripts/seed-admin.js | sqlite3 local.db
```

## Database Schema Overview

### Users Table
- Stores all system users (admin, broker, CA, lawyer)
- Passwords are hashed with bcrypt (12 salt rounds)
- Status: pending, active, inactive
- Indexed on: email, status

### Properties Table
- Stores property listings created by brokers
- Status workflow: pending → approved/rejected
- Images stored as JSON array of R2 URLs
- Co-owner count: 2-5 people
- Indexed on: broker_id, status

### Sessions Table
- Manages authentication sessions
- HTTP-only secure cookies
- 24-hour expiration
- Indexed on: token, user_id

## Troubleshooting

### Database Not Found
If you get "database not found" errors, verify:
1. Database was created: `wrangler d1 list`
2. Database ID is correct in `wrangler.toml`
3. You're authenticated: `wrangler whoami`

### Migration Errors
If schema migration fails:
1. Check SQL syntax in `schema.sql`
2. Verify D1 supports all SQL features used
3. Try running commands individually

### Seed Script Errors
If seed script fails:
1. Ensure `bcryptjs` is installed: `npm install bcryptjs`
2. Check Node.js version (requires v14+)
3. Verify output SQL syntax before executing

## Next Steps

After database setup:
1. Implement authentication API endpoints (`/api/auth/*`)
2. Create authentication middleware for route protection
3. Build login and registration UI components
4. Test authentication flow end-to-end

## Security Notes

- Never commit `seed.sql` with real passwords to version control
- Change default admin password immediately
- Use environment variables for sensitive configuration
- Enable Cloudflare's security features (WAF, rate limiting)
- Regularly audit user accounts and sessions
- Implement password rotation policy for admin accounts

## Additional Resources

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
