# Cloudflare R2 + Worker Deployment Guide

This guide walks you through deploying your Next.js static site to Cloudflare R2 with Workers.

## Prerequisites

- Cloudflare account (free tier is fine)
- Node.js and npm installed
- Your site built with `npm run build`

## Quick Start

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

This will open a browser window to authenticate.

### 3. Create R2 Bucket

```bash
wrangler r2 bucket create bhavan-website
```

Or create it in the Cloudflare dashboard:
- Go to R2 in the sidebar
- Click "Create bucket"
- Name it `bhavan-website`

### 4. Deploy Worker

```bash
wrangler deploy
```

This will:
- Deploy the worker code from `cloudflare-worker.js`
- Bind the R2 bucket
- Give you a worker URL

### 5. Upload Your Site

Run the deployment script:

```bash
chmod +x deploy-r2.sh
./deploy-r2.sh
```

Or manually:

```bash
npm run build
cd out
find . -type f | while read file; do
  wrangler r2 object put bhavan-website/${file#./} --file=$file
done
cd ..
```

### 6. Test Your Site

Visit your worker URL:
```
https://bhavan-website-worker.YOUR-SUBDOMAIN.workers.dev
```

## Adding a Custom Domain

### Option 1: Using Cloudflare Dashboard

1. Go to Workers & Pages → Your worker
2. Click Settings → Triggers
3. Under "Custom Domains", click "Add Custom Domain"
4. Enter your domain (e.g., `bhavan.ai`)
5. SSL certificate is automatically provisioned

### Option 2: Using wrangler.toml

Uncomment and update the routes in `wrangler.toml`:

```toml
routes = [
  { pattern = "bhavan.ai/*", zone_name = "bhavan.ai" },
  { pattern = "www.bhavan.ai/*", zone_name = "bhavan.ai" }
]
```

Then deploy:
```bash
wrangler deploy
```

## Updating Your Site

After making changes:

```bash
./deploy-r2.sh
```

This will:
1. Build your site
2. Upload new files to R2
3. Redeploy the worker

## Configuration Files

- `cloudflare-worker.js` - Worker code that serves your site
- `wrangler.toml` - Worker configuration
- `deploy-r2.sh` - Automated deployment script

## Troubleshooting

### Worker not serving files

Check that the R2 bucket binding is correct:
```bash
wrangler r2 bucket list
```

### 404 errors

Make sure all files are uploaded:
```bash
wrangler r2 object list bhavan-website
```

### Cache issues

Purge Cloudflare cache:
1. Go to your domain in Cloudflare
2. Caching → Configuration
3. Click "Purge Everything"

## Cost

With your traffic (100 requests/day):
- R2 Storage: Free (under 10 GB)
- R2 Operations: Free (under 10M/month)
- Workers: Free (under 100k requests/day)
- Bandwidth: Free (no egress fees!)

**Total: $0/month**

## Support

- Cloudflare Docs: https://developers.cloudflare.com/r2/
- Wrangler Docs: https://developers.cloudflare.com/workers/wrangler/
- Community: https://community.cloudflare.com/

## Next Steps

1. ✅ Deploy your site
2. ✅ Test all pages and functionality
3. ✅ Add custom domain
4. ✅ Configure DNS
5. ✅ Enable security features
6. ✅ Set up analytics (optional)
