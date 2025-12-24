/**
 * Database helper functions for property management
 * Provides reusable functions for CRUD operations on properties
 */

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  co_owner_count: number;
  images: string; // JSON string array of R2 URLs
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  broker_id: string;
  created_at: number;
  updated_at: number;
}

interface PropertyWithBroker extends Property {
  broker_name: string;
  broker_email: string;
}

interface PropertyFilters {
  status?: 'pending' | 'approved' | 'rejected';
  broker_id?: string;
}

/**
 * Get all properties with optional filters
 * Optionally includes broker information
 */
export async function getProperties(
  db: D1Database,
  filters?: PropertyFilters,
  includeBroker: boolean = false
): Promise<Property[] | PropertyWithBroker[]> {
  let query = includeBroker
    ? `SELECT 
        p.*,
        u.name as broker_name,
        u.email as broker_email
      FROM properties p
      JOIN users u ON p.broker_id = u.id
      WHERE 1=1`
    : 'SELECT * FROM properties WHERE 1=1';

  const bindings: any[] = [];

  if (filters?.status) {
    query += includeBroker ? ' AND p.status = ?' : ' AND status = ?';
    bindings.push(filters.status);
  }

  if (filters?.broker_id) {
    query += includeBroker ? ' AND p.broker_id = ?' : ' AND broker_id = ?';
    bindings.push(filters.broker_id);
  }

  query += ' ORDER BY ' + (includeBroker ? 'p.created_at' : 'created_at') + ' DESC';

  const result = await db.prepare(query).bind(...bindings).all();
  return (result.results || []) as unknown as Property[] | PropertyWithBroker[];
}

/**
 * Get a single property by ID
 * Optionally includes broker information
 */
export async function getPropertyById(
  db: D1Database,
  propertyId: string,
  includeBroker: boolean = false
): Promise<Property | PropertyWithBroker | null> {
  const query = includeBroker
    ? `SELECT 
        p.*,
        u.name as broker_name,
        u.email as broker_email
      FROM properties p
      JOIN users u ON p.broker_id = u.id
      WHERE p.id = ?`
    : 'SELECT * FROM properties WHERE id = ?';

  const result = await db.prepare(query).bind(propertyId).first();
  return result as Property | PropertyWithBroker | null;
}

/**
 * Create a new property
 * Returns the created property
 */
export async function createProperty(
  db: D1Database,
  data: {
    title: string;
    description: string;
    location: string;
    price: number;
    co_owner_count: number;
    images: string[];
    broker_id: string;
  }
): Promise<Property> {
  const id = crypto.randomUUID();
  const now = Date.now();
  const imagesJson = JSON.stringify(data.images);

  await db.prepare(`
    INSERT INTO properties (
      id, title, description, location, price, co_owner_count,
      images, status, broker_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
    .bind(
      id,
      data.title,
      data.description,
      data.location,
      data.price,
      data.co_owner_count,
      imagesJson,
      'pending',
      data.broker_id,
      now,
      now
    )
    .run();

  return {
    id,
    title: data.title,
    description: data.description,
    location: data.location,
    price: data.price,
    co_owner_count: data.co_owner_count,
    images: imagesJson,
    status: 'pending',
    rejection_reason: null,
    broker_id: data.broker_id,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Update an existing property
 * Returns the updated property
 */
export async function updateProperty(
  db: D1Database,
  propertyId: string,
  data: {
    title?: string;
    description?: string;
    location?: string;
    price?: number;
    co_owner_count?: number;
    images?: string[];
  }
): Promise<Property | null> {
  const existing = await getPropertyById(db, propertyId);
  if (!existing) return null;

  const updates: string[] = [];
  const bindings: any[] = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    bindings.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    bindings.push(data.description);
  }
  if (data.location !== undefined) {
    updates.push('location = ?');
    bindings.push(data.location);
  }
  if (data.price !== undefined) {
    updates.push('price = ?');
    bindings.push(data.price);
  }
  if (data.co_owner_count !== undefined) {
    updates.push('co_owner_count = ?');
    bindings.push(data.co_owner_count);
  }
  if (data.images !== undefined) {
    updates.push('images = ?');
    bindings.push(JSON.stringify(data.images));
  }

  // Reset to pending status when property is edited
  updates.push('status = ?');
  bindings.push('pending');
  updates.push('rejection_reason = ?');
  bindings.push(null);

  updates.push('updated_at = ?');
  bindings.push(Date.now());

  bindings.push(propertyId);

  await db.prepare(`
    UPDATE properties
    SET ${updates.join(', ')}
    WHERE id = ?
  `)
    .bind(...bindings)
    .run();

  return await getPropertyById(db, propertyId);
}

/**
 * Delete a property (soft delete by marking as deleted)
 * For now, we'll do a hard delete as per requirements
 */
export async function deleteProperty(
  db: D1Database,
  propertyId: string
): Promise<boolean> {
  const result = await db.prepare('DELETE FROM properties WHERE id = ?')
    .bind(propertyId)
    .run();

  return result.success;
}

/**
 * Approve a property
 * Changes status from pending to approved
 */
export async function approveProperty(
  db: D1Database,
  propertyId: string
): Promise<Property | null> {
  const now = Date.now();

  await db.prepare(`
    UPDATE properties
    SET status = ?, rejection_reason = ?, updated_at = ?
    WHERE id = ?
  `)
    .bind('approved', null, now, propertyId)
    .run();

  return await getPropertyById(db, propertyId);
}

/**
 * Reject a property with a reason
 * Changes status from pending to rejected
 */
export async function rejectProperty(
  db: D1Database,
  propertyId: string,
  reason: string
): Promise<Property | null> {
  const now = Date.now();

  await db.prepare(`
    UPDATE properties
    SET status = ?, rejection_reason = ?, updated_at = ?
    WHERE id = ?
  `)
    .bind('rejected', reason, now, propertyId)
    .run();

  return await getPropertyById(db, propertyId);
}

/**
 * Check if a user owns a property
 */
export async function isPropertyOwner(
  db: D1Database,
  propertyId: string,
  userId: string
): Promise<boolean> {
  const property = await getPropertyById(db, propertyId);
  return property?.broker_id === userId;
}

// ============================================================================
// User Management Functions
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'admin' | 'broker' | 'ca' | 'lawyer';
  status: 'pending' | 'active' | 'inactive';
  created_at: number;
  updated_at: number;
}

interface UserFilters {
  status?: 'pending' | 'active' | 'inactive';
  role?: 'admin' | 'broker' | 'ca' | 'lawyer';
}

/**
 * Get all users with optional filters
 */
export async function getUsers(
  db: D1Database,
  filters?: UserFilters
): Promise<User[]> {
  let query = 'SELECT * FROM users WHERE 1=1';
  const bindings: any[] = [];

  if (filters?.status) {
    query += ' AND status = ?';
    bindings.push(filters.status);
  }

  if (filters?.role) {
    query += ' AND role = ?';
    bindings.push(filters.role);
  }

  query += ' ORDER BY created_at DESC';

  const result = await db.prepare(query).bind(...bindings).all();
  return (result.results || []) as unknown as User[];
}

/**
 * Get a single user by ID
 */
export async function getUserById(
  db: D1Database,
  userId: string
): Promise<User | null> {
  const result = await db.prepare('SELECT * FROM users WHERE id = ?')
    .bind(userId)
    .first();
  return result as User | null;
}

/**
 * Get a user by email
 */
export async function getUserByEmail(
  db: D1Database,
  email: string
): Promise<User | null> {
  const result = await db.prepare('SELECT * FROM users WHERE email = ?')
    .bind(email)
    .first();
  return result as User | null;
}

/**
 * Create a new user
 * Password should already be hashed before calling this function
 */
export async function createUser(
  db: D1Database,
  data: {
    name: string;
    email: string;
    phone: string;
    password: string; // Already hashed
    role: 'admin' | 'broker' | 'ca' | 'lawyer';
    status?: 'pending' | 'active' | 'inactive';
  }
): Promise<User> {
  const id = crypto.randomUUID();
  const now = Date.now();
  const status = data.status || 'pending';

  await db.prepare(`
    INSERT INTO users (
      id, name, email, phone, password, role, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
    .bind(
      id,
      data.name,
      data.email,
      data.phone,
      data.password,
      data.role,
      status,
      now,
      now
    )
    .run();

  return {
    id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    password: data.password,
    role: data.role,
    status,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Update user status (approve, deactivate, etc.)
 */
export async function updateUserStatus(
  db: D1Database,
  userId: string,
  status: 'pending' | 'active' | 'inactive'
): Promise<User | null> {
  const now = Date.now();

  await db.prepare(`
    UPDATE users
    SET status = ?, updated_at = ?
    WHERE id = ?
  `)
    .bind(status, now, userId)
    .run();

  return await getUserById(db, userId);
}

/**
 * Update user password
 * Password should already be hashed before calling this function
 */
export async function updateUserPassword(
  db: D1Database,
  userId: string,
  hashedPassword: string
): Promise<User | null> {
  const now = Date.now();

  await db.prepare(`
    UPDATE users
    SET password = ?, updated_at = ?
    WHERE id = ?
  `)
    .bind(hashedPassword, now, userId)
    .run();

  return await getUserById(db, userId);
}

/**
 * Delete a user
 * Also deletes all associated sessions
 */
export async function deleteUser(
  db: D1Database,
  userId: string
): Promise<boolean> {
  // Delete sessions first
  await db.prepare('DELETE FROM sessions WHERE user_id = ?')
    .bind(userId)
    .run();

  // Delete user
  const result = await db.prepare('DELETE FROM users WHERE id = ?')
    .bind(userId)
    .run();

  return result.success;
}
