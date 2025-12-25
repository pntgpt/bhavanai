# Cloudflare R2 Setup Guide

This guide explains how to configure Cloudflare R2 for public image hosting.

## Prerequisites

- Cloudflare account
- R2 bucket created (`bhavan-images`)
- Cloudflare account ID

## Step 1: Enable Public Access on R2 Bucket

1. Go to Cloudflare Dashboard → R2
2. Select your `bhavan-images` bucket
3. Go to Settings → Public Access
4. Click "Allow Access" to enable R2.dev subdomain
5. Copy the public URL (format: `https://bhavan-images.<account-id>.r2.dev`)

## Step 2: Configure Environment Variable

Update `wrangler.toml` with your R2 public URL:

```toml
[vars]
R2_PUBLIC_URL = "https://bhavan-images.YOUR_ACCOUNT_ID.r2.dev"
```

Replace `YOUR_ACCOUNT_ID` with your actual Cloudflare account ID.

## Step 3: Find Your Account ID

You can find your Cloudflare account ID in:
- Dashboard URL: `https://dash.cloudflare.com/<ACCOUNT_ID>/...`
- Or run: `wrangler whoami`

## Step 4: Test Image Upload

1. Start the dev server: `npm run wrangler:dev`
2. Login as a broker
3. Upload a property image
4. The returned URL should be: `https://bhavan-images.<account-id>.r2.dev/<filename>`

## Optional: Custom Domain

For production, you can map a custom domain to your R2 bucket:

1. Go to R2 bucket → Settings → Custom Domains
2. Add your domain (e.g., `images.bhavan.ai`)
3. Update `R2_PUBLIC_URL` in `wrangler.toml`:
   ```toml
   R2_PUBLIC_URL = "https://images.bhavan.ai"
   ```

## CORS Configuration

If you need to access images from different domains, configure CORS:

1. Go to R2 bucket → Settings → CORS Policy
2. Add allowed origins:
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

## Notes

- Images are cached with `max-age=31536000` (1 year)
- R2 public URLs work for both local development and production
- No API endpoint needed - images are served directly from R2
