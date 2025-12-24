/**
 * Authentication middleware for Cloudflare Pages Functions
 * Protects /dashboard routes and enforces role-based access control
 * 
 * This middleware runs before all function requests and validates:
 * 1. User authentication via session cookie
 * 2. Session validity (not expired)
 * 3. User status (must be active)
 * 4. Role-based permissions for specific routes
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

/**
 * Validate session and return user data
 */
async function validateSession(env: Env, token: string): Promise<User | null> {
  try {
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
      .bind(token, Date.now(), 'active')
      .first<SessionWithUser>();

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      name: result.name,
      email: result.email,
      phone: result.phone,
      role: result.role,
      status: result.status,
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

/**
 * Check if user has permission to access a route based on their role
 */
function hasPermission(role: string, pathname: string): boolean {
  // Admin can access all routes
  if (role === 'admin') {
    return true;
  }

  // Broker can only access broker routes
  if (pathname.startsWith('/dashboard/broker') && role === 'broker') {
    return true;
  }

  // CA can only access CA routes
  if (pathname.startsWith('/dashboard/ca') && role === 'ca') {
    return true;
  }

  // Lawyer can only access lawyer routes
  if (pathname.startsWith('/dashboard/lawyer') && role === 'lawyer') {
    return true;
  }

  return false;
}

export async function onRequest(context: {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
  data: Record<string, any>;
}) {
  const { request, env, next, data } = context;
  const url = new URL(request.url);

  // Only protect /dashboard routes
  if (!url.pathname.startsWith('/dashboard')) {
    return next();
  }

  // Extract session token
  const sessionToken = getSessionToken(request);

  if (!sessionToken) {
    // No session - redirect to login
    return Response.redirect(new URL('/login', request.url), 302);
  }

  // Validate session
  const user = await validateSession(env, sessionToken);

  if (!user) {
    // Invalid or expired session - redirect to login and clear cookie
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/login',
        'Set-Cookie': 'session=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/',
      },
    });
  }

  // Check role-based permissions
  if (!hasPermission(user.role, url.pathname)) {
    // User doesn't have permission for this route
    return new Response('Forbidden: You do not have permission to access this resource', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // Attach user to request context for downstream use
  data.user = user;

  // Continue to the requested route
  return next();
}
