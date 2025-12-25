# Cloudflare Pages Deployment Guide

This guide walks you through deploying the Bhavan.ai application to Cloudflare Pages with D1 database, R2 storage, and Functions.

## Prerequisites

- Cloudflare account
- Wrangler CLI installed: `npm install -g wrangler`
- Git repository pushed to GitHub/GitLab
- Node.js 18+ installed

## Step 1: Create D1 Database

```bash
# Create production database
wrangler d1 create bhavan-db

# Note the database ID from the output
# Update wrangler.toml with the production database ID
```

## Step 2: Create R2 Buckets

```bash
# Create images bucket
wrangler r2 bucket create bhavan-images

# Enable public access on bhavan-images bucket
# Go to Cloudflare Dashboard → R2 → bhavan-images → Settings → Public Access
# Click "Allow Access" to get the public URL
```

## Step 3: Initialize Database Schema

```bash
# Run migrations on production database
wrangler d1 execute bhavan-db --file=./schema.sql

# Seed admin user (update email/password in seed.sql first)
wrangler d1 execute bhavan-db --file=./seed.sql
```

## Step 4: Deploy to Cloudflare Pages

### Option A: Deploy via Dashboard (Recommended)

1. Go to Cloudflare Dashboard → Pages
2. Click "Create a project"
3. Connect your Git repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: `/`
   - **Node version**: `18`

5. Add environment variables:
   - `R2_PUBLIC_URL`: Your R2 public URL (e.g., `https://pub-xxx.r2.dev`)

6. Configure bindings:
   - **D1 Database**: 
     - Variable name: `DB`
     - Database: `bhavan-db`
   - **R2 Buckets**:
     - Variable name: `IMAGES`
     - Bucket: `bhavan-images`

7. Click "Save and Deploy"

### Option B: Deploy via CLI

```bash
# Build the project
npm run build

# Deploy to Pages
wrangler pages deploy out --project-name=bhavan-ai

# Configure bindings (first time only)
wrangler pages deployment create out --project-name=bhavan-ai \
  --d1=DB=bhavan-db \
  --r2=IMAGES=bhavan-images
```

## Step 5: Configure Custom Domain

1. Go to Pages → Your project → Custom domains
2. Click "Set up a custom domain"
3. Enter your domain (e.g., `bhavan.ai`)
4. Follow DNS configuration instructions
5. SSL certificate is automatically provisioned

## Step 6: Verify Deployment

Test these endpoints:

```bash
# Homepage
curl https://your-domain.pages.dev

# API health check
curl https://your-domain.pages.dev/api/properties/public

# Login page
curl https://your-domain.pages.dev/login
```

## Step 7: Create Admin User

If you haven't seeded the admin user:

```bash
# Update scripts/seed-admin.js with your admin credentials
node scripts/seed-admin.js
```

Or manually via D1 console:

```sql
INSERT INTO users (id, name, email, phone, password_hash, role, status, created_at, updated_at)
VALUES (
  'admin-id',
  'Admin',
  'admin@bhavan.ai',
  '+911234567890',
  '$2a$10$...',  -- bcrypt hash of your password
  'admin',
  'active',
  1234567890000,
  1234567890000
);
```

## Environment Variables

Set these in Cloudflare Pages settings:

| Variable | Value | Description |
|----------|-------|-------------|
| `R2_PUBLIC_URL` | `https://pub-xxx.r2.dev` | R2 bucket public URL |
| `NODE_VERSION` | `18` | Node.js version |

## Bindings Configuration

### D1 Database
- **Variable name**: `DB`
- **Database**: `bhavan-db`
- **Database ID**: (from Step 1)

### R2 Buckets
- **Variable name**: `IMAGES`
- **Bucket name**: `bhavan-images`

## Updating the Application

### Via Git (Automatic)

1. Push changes to your repository
2. Cloudflare Pages automatically rebuilds and deploys

### Via CLI (Manual)

```bash
# Build locally
npm run build

# Deploy
wrangler pages deploy out --project-name=bhavan-ai
```

## Database Migrations

To update the database schema in production:

```bash
# Create migration file
echo "ALTER TABLE properties ADD COLUMN new_field TEXT;" > migration.sql

# Run migration
wrangler d1 execute bhavan-db --file=./migration.sql
```

## Monitoring & Logs

### View Logs

```bash
# Real-time logs
wrangler pages deployment tail

# Or view in dashboard
# Pages → Your project → Functions → Logs
```

### Analytics

- Go to Pages → Your project → Analytics
- View requests, bandwidth, and errors

## Troubleshooting

### Images not displaying

1. Verify R2 public access is enabled
2. Check `R2_PUBLIC_URL` environment variable
3. Test image URL directly: `https://pub-xxx.r2.dev/filename.png`

### Database connection errors

1. Verify D1 binding is configured
2. Check database ID in wrangler.toml matches production
3. Run: `wrangler d1 info bhavan-db`

### Functions not working

1. Check Functions logs in dashboard
2. Verify all bindings are configured
3. Test API endpoints directly

### Build failures

1. Check Node.js version (should be 18+)
2. Verify all dependencies are in package.json
3. Check build logs in Pages dashboard

## Security Checklist

- [ ] Change default admin password
- [ ] Enable Cloudflare WAF rules
- [ ] Configure rate limiting
- [ ] Set up CORS policies for R2
- [ ] Enable bot protection
- [ ] Configure CSP headers
- [ ] Set up monitoring alerts

## Performance Optimization

- [ ] Enable Cloudflare caching
- [ ] Configure cache rules for static assets
- [ ] Enable Brotli compression
- [ ] Set up image optimization
- [ ] Configure CDN settings

## Backup Strategy

### Database Backups

```bash
# Export database
wrangler d1 export bhavan-db --output=backup.sql

# Import database
wrangler d1 execute bhavan-db --file=backup.sql
```

### R2 Backups

Use Cloudflare dashboard or rclone to backup R2 buckets.

## Cost Estimate

With moderate traffic (1000 requests/day):

- **Pages**: Free (500 builds/month)
- **D1**: Free (5GB storage, 5M reads/day)
- **R2**: Free (10GB storage, 10M operations/month)
- **Functions**: Free (100k requests/day)
- **Bandwidth**: Free (unlimited)

**Total: $0/month** (within free tier limits)

## Support Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [R2 Storage Docs](https://developers.cloudflare.com/r2/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Community Forum](https://community.cloudflare.com/)

## Next Steps

1. ✅ Deploy to Cloudflare Pages
2. ✅ Configure custom domain
3. ✅ Set up DNS records
4. ✅ Test all functionality
5. ✅ Create admin user
6. ✅ Enable security features
7. ✅ Set up monitoring
8. ✅ Configure backups
