/**
 * Shared authentication utilities for Cloudflare Pages Functions
 * Provides reusable functions for session management and authorization
 */

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
export function getSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith('session='));
  
  if (!sessionCookie) return null;
  
  return sessionCookie.split('=')[1];
}

/**
 * Validate session and return user data
 * Returns null if session is invalid or expired
 */
export async function validateSession(
  db: D1Database,
  token: string
): Promise<User | null> {
  try {
    const result = await db.prepare(`
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
 * Require authentication for API routes
 * Throws error if user is not authenticated
 */
export async function requireAuth(
  request: Request,
  db: D1Database
): Promise<User> {
  const token = getSessionToken(request);
  
  if (!token) {
    throw new Error('Unauthorized: No session token');
  }

  const user = await validateSession(db, token);
  
  if (!user) {
    throw new Error('Unauthorized: Invalid or expired session');
  }

  return user;
}

/**
 * Require specific role(s) for API routes
 * Throws error if user doesn't have required role
 */
export async function requireRole(
  request: Request,
  db: D1Database,
  allowedRoles: Array<'admin' | 'broker' | 'ca' | 'lawyer'>
): Promise<User> {
  const user = await requireAuth(request, db);

  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Forbidden: Required role(s): ${allowedRoles.join(', ')}`);
  }

  return user;
}

/**
 * Create a new session for a user
 * Returns session token
 */
export async function createSession(
  db: D1Database,
  userId: string
): Promise<string> {
  const sessionId = crypto.randomUUID();
  const token = crypto.randomUUID();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  await db.prepare(
    'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)'
  )
    .bind(sessionId, userId, token, expiresAt)
    .run();

  return token;
}

/**
 * Delete a session
 */
export async function deleteSession(
  db: D1Database,
  token: string
): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE token = ?')
    .bind(token)
    .run();
}

/**
 * Clean up expired sessions (should be run periodically)
 */
export async function cleanupExpiredSessions(db: D1Database): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE expires_at < ?')
    .bind(Date.now())
    .run();
}

/**
 * Create session cookie header
 */
export function createSessionCookie(token: string): string {
  const maxAge = 24 * 60 * 60; // 24 hours in seconds
  return `session=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}; Path=/`;
}

/**
 * Create cookie header to clear session
 */
export function clearSessionCookie(): string {
  return 'session=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/';
}
