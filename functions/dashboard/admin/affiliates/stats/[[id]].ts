/**
 * Catch-all handler for /dashboard/admin/affiliates/stats/[id] routes
 * Serves the static fallback page for dynamic affiliate stats pages
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
  
  // Extract the path after /dashboard/admin/affiliates/stats/
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  // If it's just /dashboard/admin/affiliates/stats or /dashboard/admin/affiliates/stats/, 
  // let it fall through to static (though this page doesn't exist)
  if (pathParts.length <= 4 || (pathParts.length === 5 && pathParts[4] === '')) {
    // No index page for stats, return 404
    return new Response('Not Found', { status: 404 });
  }
  
  // For /dashboard/admin/affiliates/stats/[id], serve the fallback template
  // The client-side code will extract the ID from the URL
  return env.ASSETS.fetch(new URL('/dashboard/admin/affiliates/stats/_/index.html', url.origin).toString());
}
