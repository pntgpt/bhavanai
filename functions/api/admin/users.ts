/**
 * Admin user management API endpoints
 * Handles CRUD operations for user accounts
 */

import { requireRole } from '../../lib/auth';
import {
  getUsers,
  getUserById,
  createUser,
  updateUserStatus,
  updateUserPassword,
  deleteUser,
  getUserByEmail,
} from '../../lib/db';
import { hash } from 'bcryptjs';

interface Env {
  DB: D1Database;
}

/**
 * GET /api/admin/users
 * Get all users with optional filters
 */
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    // Require admin role
    await requireRole(request, env.DB, ['admin']);

    // Parse query parameters for filters
    const url = new URL(request.url);
    const status = url.searchParams.get('status') as 'pending' | 'active' | 'inactive' | null;
    const role = url.searchParams.get('role') as 'admin' | 'broker' | 'ca' | 'lawyer' | null;

    const filters: any = {};
    if (status) filters.status = status;
    if (role) filters.role = role;

    const users = await getUsers(env.DB, filters);

    // Remove password from response
    const sanitizedUsers = users.map(({ password, ...user }) => user);

    return new Response(JSON.stringify({ users: sanitizedUsers }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.message.includes('Unauthorized') ? 401 : 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * POST /api/admin/users
 * Create a new user
 */
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    // Require admin role
    await requireRole(request, env.DB, ['admin']);

    const body = await request.json() as any;
    const { name, email, phone, password, role, status } = body;

    // Validate required fields
    if (!name || !email || !phone || !password || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, phone, password, role' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate role
    if (!['admin', 'broker', 'ca', 'lawyer'].includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role. Must be: admin, broker, ca, or lawyer' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if email already exists
    const existingUser = await getUserByEmail(env.DB, email);
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'Email already exists' }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await createUser(env.DB, {
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      status: status || 'active', // Default to active when admin creates
    });

    // Remove password from response
    const { password: _, ...sanitizedUser } = user;

    return new Response(
      JSON.stringify({
        success: true,
        user: sanitizedUser,
        message: 'User created successfully',
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Create user error:', error);

    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.message.includes('Unauthorized') ? 401 : 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to create user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
