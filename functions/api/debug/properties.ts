/**
 * Debug endpoint for troubleshooting property queries
 * 
 * This endpoint provides detailed information about:
 * - Database connection status
 * - Raw query results
 * - Property counts by status
 * - Sample property data
 * 
 * WARNING: Remove or protect this endpoint in production!
 */

interface Env {
  DB: D1Database;
}

/**
 * GET /api/debug/properties
 * Returns detailed debug information about properties in the database
 */
async function handleGet(request: Request, env: Env): Promise<Response> {
  try {
    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: null,
      },
      queries: {},
      summary: {},
    };

    // Test database connection
    try {
      await env.DB.prepare('SELECT 1').first();
      debugInfo.database.connected = true;
    } catch (error: any) {
      debugInfo.database.connected = false;
      debugInfo.database.error = error.message;
      return new Response(JSON.stringify({ success: false, debug: debugInfo }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Query 1: Count all properties
    const totalCount = await env.DB.prepare('SELECT COUNT(*) as count FROM properties').first();
    debugInfo.queries.totalProperties = totalCount;

    // Query 2: Count by status
    const statusCounts = await env.DB.prepare(`
      SELECT status, COUNT(*) as count 
      FROM properties 
      GROUP BY status
    `).all();
    debugInfo.queries.propertiesByStatus = statusCounts.results;

    // Query 3: Get all approved properties (raw)
    const approvedProperties = await env.DB.prepare(`
      SELECT * FROM properties WHERE status = 'approved'
    `).all();
    debugInfo.queries.approvedProperties = {
      count: approvedProperties.results?.length || 0,
      properties: approvedProperties.results,
    };

    // Query 4: Get all properties (for comparison)
    const allProperties = await env.DB.prepare(`
      SELECT id, title, status, created_at, updated_at FROM properties
    `).all();
    debugInfo.queries.allPropertiesSummary = allProperties.results;

    // Query 5: Check for any data issues
    const dataIssues = [];
    
    // Check for properties with invalid status
    const invalidStatus = await env.DB.prepare(`
      SELECT id, title, status FROM properties 
      WHERE status NOT IN ('pending', 'approved', 'rejected')
    `).all();
    if (invalidStatus.results && invalidStatus.results.length > 0) {
      dataIssues.push({
        issue: 'Invalid status values',
        count: invalidStatus.results.length,
        examples: invalidStatus.results,
      });
    }

    // Check for properties with empty/null images
    const emptyImages = await env.DB.prepare(`
      SELECT id, title, images FROM properties 
      WHERE images IS NULL OR images = '' OR images = '[]'
    `).all();
    if (emptyImages.results && emptyImages.results.length > 0) {
      dataIssues.push({
        issue: 'Empty or null images',
        count: emptyImages.results.length,
        examples: emptyImages.results,
      });
    }

    debugInfo.queries.dataIssues = dataIssues;

    // Summary
    debugInfo.summary = {
      totalProperties: totalCount?.count || 0,
      approvedProperties: approvedProperties.results?.length || 0,
      pendingProperties: statusCounts.results?.find((s: any) => s.status === 'pending')?.count || 0,
      rejectedProperties: statusCounts.results?.find((s: any) => s.status === 'rejected')?.count || 0,
      hasDataIssues: dataIssues.length > 0,
    };

    return new Response(JSON.stringify({ success: true, debug: debugInfo }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Debug endpoint error:', error);

    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Debug query failed',
      details: error.message,
      stack: error.stack,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Main handler for /api/debug/properties
 */
export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  let response: Response;

  switch (request.method) {
    case 'GET':
      response = await handleGet(request, env);
      break;
    default:
      response = new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
  }

  // Add CORS headers to response
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
