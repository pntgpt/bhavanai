/**
 * Session validation API endpoint
 * Validates current session and returns user information
 * 
 * GET /api/auth/session
 * Returns: { authenticated: boolean, user?: User }
 */

interface Env {
  DB: D1Database;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'broker' | 'ca' | 'lawyer';
  status: 'pending' | 'active' | 'inactive';
}

interface SessionWithUser extends User {
  session_id: string;
  token: string;
  expires_at: number;
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

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    // Extract session token from cookie
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return new Response(
        JSON.stringify({ authenticated: false }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate session and get user data
    const result = await env.DB.prepare(`
      SELECT 
        s.id as session_id,
        s.token,
        s.expires_at,
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.status
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > ? AND u.status = ?
    `)
      .bind(sessionToken, Date.now(), 'active')
      .first<SessionWithUser>();

    if (!result) {
      // Session expired or invalid - clear cookie
      return new Response(
        JSON.stringify({ authenticated: false }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': 'session=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/',
          },
        }
      );
    }

    // Return user data
    const user: User = {
      id: result.id,
      name: result.name,
      email: result.email,
      phone: result.phone,
      role: result.role,
      status: result.status,
    };

    return new Response(
      JSON.stringify({
        authenticated: true,
        user,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Session validation error:', error);
    return new Response(
      JSON.stringify({ authenticated: false }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
