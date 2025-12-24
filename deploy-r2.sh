#!/bin/bash

# Deployment script for Cloudflare R2 + Worker
# This script builds the site and uploads it to R2

set -e  # Exit on error

BUCKET_NAME="bhavan-website"
BUILD_DIR="out"

echo "🚀 Starting deployment to Cloudflare R2..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Build the site
echo "📦 Building Next.js site..."
npm run build

if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build directory '$BUILD_DIR' not found!"
    exit 1
fi

echo "✅ Build complete!"

# Upload files to R2
echo "☁️  Uploading files to R2 bucket: $BUCKET_NAME..."

cd "$BUILD_DIR"

# Count total files
TOTAL_FILES=$(find . -type f | wc -l | tr -d ' ')
CURRENT=0

# Upload each file
find . -type f | while read file; do
    CURRENT=$((CURRENT + 1))
    # Remove leading ./
    CLEAN_PATH="${file#./}"
    
    echo "[$CURRENT/$TOTAL_FILES] Uploading: $CLEAN_PATH"
    
    wrangler r2 object put "$BUCKET_NAME/$CLEAN_PATH" --file="$file" 2>&1 | grep -v "Uploading" || true
done

cd ..

echo "✅ All files uploaded successfully!"

# Deploy worker
echo "🔧 Deploying Cloudflare Worker..."
wrangler deploy

echo ""
echo "✨ Deployment complete!"
echo ""
echo "Your site is now live at:"
echo "https://bhavan-website-worker.YOUR-SUBDOMAIN.workers.dev"
echo ""
echo "Next steps:"
echo "1. Test your site at the worker URL"
echo "2. Add a custom domain in Cloudflare dashboard"
echo "3. Configure DNS settings"
echo ""
