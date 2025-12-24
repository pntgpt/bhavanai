# Cloudflare Pages Functions - Authentication System

This directory contains Cloudflare Pages Functions that implement the authentication and authorization system for the Bhavan.ai platform.

## Directory Structure

```
functions/
├── api/
│   └── auth/
│       ├── login.ts       # Login endpoint
│       ├── register.ts    # Registration endpoint
│       ├── session.ts     # Session validation endpoint
│       └── logout.ts      # Logout endpoint
├── lib/
│   └── auth.ts           # Shared authentication utilities
├── _middleware.ts        # Route protection middleware
└── README.md            # This file
```

## Authentication Endpoints

### POST /api/auth/login

Authenticates users with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "+911234567890",
    "role": "broker",
    "status": "active"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

**Session Cookie:**
- Name: `session`
- Attributes: `HttpOnly; Secure; SameSite=Lax; Max-Age=86400`
- Duration: 24 hours

### POST /api/auth/register

Creates a pending user account for broker, CA, or lawyer roles.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "phone": "+911234567890",
  "userType": "broker"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Thank you for registering. Our team will reach out to you shortly.",
  "userId": "uuid"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "An account with this email already exists"
}
```

### GET /api/auth/session

Validates current session and returns user information.

**Response (Authenticated):**
```json
{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "+911234567890",
    "role": "broker",
    "status": "active"
  }
}
```

**Response (Not Authenticated):**
```json
{
  "authenticated": false
}
```

### POST /api/auth/logout

Destroys user session and clears authentication cookie.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Middleware

### Route Protection

The `_middleware.ts` file protects all `/dashboard/*` routes:

1. **Authentication Check**: Validates session cookie
2. **Session Validation**: Checks if session is valid and not expired
3. **User Status Check**: Ensures user status is "active"
4. **Role-Based Access Control**: Enforces role permissions

**Protected Routes:**
- `/dashboard/admin/*` - Admin only
- `/dashboard/broker/*` - Broker only
- `/dashboard/ca/*` - CA only
- `/dashboard/lawyer/*` - Lawyer only

**Behavior:**
- Unauthenticated users → Redirect to `/login`
- Invalid/expired session → Redirect to `/login` and clear cookie
- Wrong role → 403 Forbidden error

## Shared Utilities

The `lib/auth.ts` file provides reusable authentication functions:

### `getSessionToken(request: Request): string | null`
Extracts session token from cookie header.

### `validateSession(db: D1Database, token: string): Promise<User | null>`
Validates session and returns user data.

### `requireAuth(request: Request, db: D1Database): Promise<User>`
Requires authentication for API routes. Throws error if not authenticated.

### `requireRole(request: Request, db: D1Database, allowedRoles: UserRole[]): Promise<User>`
Requires specific role(s) for API routes. Throws error if user doesn't have required role.

### `createSession(db: D1Database, userId: string): Promise<string>`
Creates a new session for a user and returns the session token.

### `deleteSession(db: D1Database, token: string): Promise<void>`
Deletes a session.

### `cleanupExpiredSessions(db: D1Database): Promise<void>`
Removes expired sessions from the database (should be run periodically).

### `createSessionCookie(token: string): string`
Creates a session cookie header string.

### `clearSessionCookie(): string`
Creates a cookie header to clear the session.

## Security Features

### Password Security
- Passwords hashed with bcrypt (12 salt rounds)
- Never stored in plain text
- Password verification uses constant-time comparison

### Session Security
- HTTP-only cookies prevent XSS attacks
- Secure flag ensures HTTPS-only transmission
- SameSite=Lax prevents CSRF attacks
- 24-hour expiration
- Session tokens are UUIDs (cryptographically random)

### Authorization
- Role-based access control (RBAC)
- Middleware enforces permissions at route level
- API endpoints validate roles before data access
- User status must be "active" to authenticate

### Input Validation
- Email format validation
- Required field validation
- User type validation (broker, ca, lawyer only)
- Duplicate email detection

## Database Schema

The authentication system uses three tables:

### users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'broker', 'ca', 'lawyer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'inactive')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
```

### sessions
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Testing

To test the authentication endpoints locally:

```bash
# Start local development server with D1
wrangler pages dev out --d1=DB=bhavan-db

# Test login
curl -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bhavan.ai","password":"admin123"}'

# Test session validation
curl http://localhost:8788/api/auth/session \
  -H "Cookie: session=YOUR_SESSION_TOKEN"

# Test logout
curl -X POST http://localhost:8788/api/auth/logout \
  -H "Cookie: session=YOUR_SESSION_TOKEN"
```

## Deployment

The functions are automatically deployed with Cloudflare Pages:

```bash
# Build Next.js application
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy out
```

## Environment Variables

Required bindings in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "bhavan-db"
database_id = "your-database-id"
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created (registration)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (insufficient permissions)
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error

## Session Expiration

Sessions expire after 24 hours of inactivity. When a session expires:
1. User is redirected to login page
2. Session cookie is cleared
3. Session record is removed from database (on next cleanup)

To manually clean up expired sessions, run:
```typescript
await cleanupExpiredSessions(env.DB);
```

## Future Enhancements

Potential improvements for future iterations:
- Password reset functionality
- Email verification
- Two-factor authentication (2FA)
- Remember me functionality (longer session duration)
- Session refresh tokens
- Rate limiting for login attempts
- Account lockout after failed attempts
- Audit logging for security events
