/**
 * Catch-all handler for /properties/[id] routes
 * Serves the static fallback page for dynamic property detail pages
 * 
 * This is needed because Cloudflare Pages doesn't properly handle
 * _redirects for dynamic routes with static export
 */

interface Env {
  ASSETS: {
    fetch: (request: Request | string) => Promise<Response>;
  };
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Extract the path after /properties/
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  // If it's just /properties or /properties/, let it fall through to static
  if (pathParts.length <= 1 || (pathParts.length === 2 && pathParts[1] === '')) {
    // Serve the properties index
    return env.ASSETS.fetch(new URL('/properties/index.html', url.origin).toString());
  }
  
  // For /properties/[id], serve the fallback template
  // The client-side code will extract the ID from the URL
  return env.ASSETS.fetch(new URL('/properties/_/index.html', url.origin).toString());
}
