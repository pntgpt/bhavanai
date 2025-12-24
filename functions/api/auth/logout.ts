/**
 * Logout API endpoint
 * Destroys user session and clears authentication cookie
 * 
 * POST /api/auth/logout
 * Returns: { success: boolean, message: string }
 */

interface Env {
  DB: D1Database;
}

/**
 * Extract session token from cookie header
 */
function getSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith('session='));
  
  if (!sessionCookie) return null;
  
  return sessionCookie.split('=')[1];
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    // Extract session token from cookie
    const sessionToken = getSessionToken(request);

    if (sessionToken) {
      // Delete session from database
      await env.DB.prepare('DELETE FROM sessions WHERE token = ?')
        .bind(sessionToken)
        .run();
    }

    // Clear session cookie
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Logged out successfully',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': 'session=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/',
        },
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'An error occurred during logout',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
