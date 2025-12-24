/**
 * Cloudflare Worker for serving static Next.js site from R2
 * This worker handles routing, caching, and content delivery
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let path = url.pathname;
    
    // Handle root path
    if (path === '/') {
      path = '/index.html';
    }
    
    // Handle trailing slashes (Next.js uses them)
    if (path.endsWith('/') && path !== '/') {
      path = path + 'index.html';
    }
    
    // Try to fetch the file from R2
    const objectKey = path.startsWith('/') ? path.slice(1) : path;
    const object = await env.MY_BUCKET.get(objectKey);
    
    if (object === null) {
      // Try with .html extension
      const htmlObject = await env.MY_BUCKET.get(objectKey + '.html');
      if (htmlObject === null) {
        // Return 404 page
        const notFound = await env.MY_BUCKET.get('404.html');
        if (notFound) {
          return new Response(notFound.body, {
            status: 404,
            headers: {
              'content-type': 'text/html;charset=UTF-8',
              'cache-control': 'public, max-age=3600',
            },
          });
        }
        return new Response('Not Found', { status: 404 });
      }
      return serveObject(htmlObject);
    }
    
    return serveObject(object);
  },
};

/**
 * Serve an R2 object with appropriate headers
 */
function serveObject(object) {
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  
  // Set content type based on file extension
  const contentType = getContentType(object.key);
  if (contentType) {
    headers.set('content-type', contentType);
  }
  
  // Set cache headers based on file type
  if (object.key.match(/\.(jpg|jpeg|png|gif|ico|svg|webp|avif|woff|woff2|ttf|eot|otf|css|js)$/)) {
    // Cache static assets aggressively
    headers.set('cache-control', 'public, max-age=31536000, immutable');
  } else if (object.key.match(/\.html$/)) {
    // Don't cache HTML pages
    headers.set('cache-control', 'public, max-age=0, must-revalidate');
  } else {
    // Default cache for other files
    headers.set('cache-control', 'public, max-age=3600');
  }
  
  // Security headers
  headers.set('x-content-type-options', 'nosniff');
  headers.set('x-frame-options', 'SAMEORIGIN');
  headers.set('referrer-policy', 'origin-when-cross-origin');
  
  return new Response(object.body, {
    headers,
  });
}

/**
 * Get content type based on file extension
 */
function getContentType(key) {
  const ext = key.split('.').pop().toLowerCase();
  const types = {
    'html': 'text/html;charset=UTF-8',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    'avif': 'image/avif',
    'ico': 'image/x-icon',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf',
    'eot': 'application/vnd.ms-fontobject',
    'otf': 'font/otf',
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'xml': 'application/xml',
  };
  return types[ext] || 'application/octet-stream';
}
