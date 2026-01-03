# Wrangler Dev Limitations

## Dynamic Routes with _redirects

Wrangler Pages dev server has limitations with `_redirects` file for dynamic routes, particularly for paths under `/dashboard`.

### Issue

The `_redirects` file contains rules like:
```
/dashboard/admin/affiliates/stats/* /dashboard/admin/affiliates/stats/_/index.html 200
/dashboard/broker/properties/* /dashboard/broker/properties/_/index.html 200
```

Wrangler detects these as "infinite loops" because the wildcard `*` would match the `_` placeholder, and ignores the rules. This causes 404 errors in local development.

### Affected Routes

- `/dashboard/admin/affiliates/stats/[id]` - Returns 404 in wrangler dev
- `/dashboard/broker/properties/[id]` - Returns 404 in wrangler dev

### Working Routes

- `/properties/[id]` - Works fine (shorter path, no `/dashboard` prefix)

### Solution

These routes **will work correctly in production** on Cloudflare Pages. The redirect rules are properly configured and will be applied in production.

For local development:
1. Test these pages by deploying to Cloudflare Pages preview/production
2. Or manually navigate to the `_` placeholder path (e.g., `/dashboard/admin/affiliates/stats/_/`) to test the page functionality

### Why This Happens

Wrangler's redirect rule parser is more strict than Cloudflare Pages production and detects potential infinite loops even when they wouldn't actually occur. Production Cloudflare Pages handles these rules correctly.
