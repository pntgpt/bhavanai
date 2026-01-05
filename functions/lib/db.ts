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

// ============================================================================
// Affiliate Management Functions
// ============================================================================

interface Affiliate {
  id: string;
  name: string;
  description: string | null;
  status: 'active' | 'inactive';
  created_at: number;
  updated_at: number;
}

interface AffiliateFilters {
  status?: 'active' | 'inactive';
}

/**
 * Create a new affiliate
 * Returns the created affiliate with a unique ID
 * Throws an error if the affiliate ID already exists
 */
export async function createAffiliate(
  db: D1Database,
  data: {
    id?: string;
    name: string;
    description?: string;
  }
): Promise<Affiliate> {
  const id = data.id || crypto.randomUUID();
  
  // Check if affiliate ID already exists
  if (data.id) {
    const existing = await getAffiliateById(db, data.id);
    if (existing) {
      throw new Error('An affiliate with this ID already exists');
    }
  }
  
  const now = Date.now();

  await db.prepare(`
    INSERT INTO affiliates (
      id, name, description, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `)
    .bind(
      id,
      data.name,
      data.description || null,
      'active',
      now,
      now
    )
    .run();

  return {
    id,
    name: data.name,
    description: data.description || null,
    status: 'active',
    created_at: now,
    updated_at: now,
  };
}

/**
 * Get all affiliates with optional filters
 * Returns list of affiliates ordered by creation date
 */
export async function getAffiliates(
  db: D1Database,
  filters?: AffiliateFilters
): Promise<Affiliate[]> {
  let query = 'SELECT * FROM affiliates WHERE 1=1';
  const bindings: any[] = [];

  if (filters?.status) {
    query += ' AND status = ?';
    bindings.push(filters.status);
  }

  query += ' ORDER BY created_at DESC';

  const result = await db.prepare(query).bind(...bindings).all();
  return (result.results || []) as unknown as Affiliate[];
}

/**
 * Get a single affiliate by ID
 * Returns the affiliate or null if not found
 */
export async function getAffiliateById(
  db: D1Database,
  affiliateId: string
): Promise<Affiliate | null> {
  const result = await db.prepare('SELECT * FROM affiliates WHERE id = ?')
    .bind(affiliateId)
    .first();
  return result as Affiliate | null;
}

/**
 * Update an existing affiliate
 * Returns the updated affiliate or null if not found
 * Preserves the unique identifier while updating metadata
 */
export async function updateAffiliate(
  db: D1Database,
  affiliateId: string,
  data: {
    name?: string;
    description?: string;
    status?: 'active' | 'inactive';
  }
): Promise<Affiliate | null> {
  const existing = await getAffiliateById(db, affiliateId);
  if (!existing) return null;

  const updates: string[] = [];
  const bindings: any[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    bindings.push(data.name);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    bindings.push(data.description);
  }
  if (data.status !== undefined) {
    updates.push('status = ?');
    bindings.push(data.status);
  }

  updates.push('updated_at = ?');
  bindings.push(Date.now());

  bindings.push(affiliateId);

  await db.prepare(`
    UPDATE affiliates
    SET ${updates.join(', ')}
    WHERE id = ?
  `)
    .bind(...bindings)
    .run();

  return await getAffiliateById(db, affiliateId);
}

/**
 * Delete an affiliate
 * Returns true if deletion was successful
 */
export async function deleteAffiliate(
  db: D1Database,
  affiliateId: string
): Promise<boolean> {
  const result = await db.prepare('DELETE FROM affiliates WHERE id = ?')
    .bind(affiliateId)
    .run();

  return result.success;
}

// ============================================================================
// Tracking Event Functions
// ============================================================================

interface TrackingEvent {
  id: string;
  affiliate_id: string;
  event_type: 'signup' | 'property_contact' | 'payment';
  user_id: string | null;
  property_id: string | null;
  metadata: string | null; // JSON string
  created_at: number;
}

interface TrackingEventFilters {
  affiliate_id?: string;
  event_type?: 'signup' | 'property_contact' | 'payment';
  user_id?: string;
  property_id?: string;
  start_date?: number;
  end_date?: number;
  limit?: number;
  offset?: number;
}

interface AffiliateStats {
  affiliate_id: string;
  total_signups: number;
  total_contacts: number;
  total_payments: number;
  total_events: number;
}

/**
 * Create a new tracking event
 * Validates affiliate_id and handles inactive affiliates by using NO_AFFILIATE_ID
 * Returns the created tracking event
 */
export async function createTrackingEvent(
  db: D1Database,
  data: {
    affiliate_id: string;
    event_type: 'signup' | 'property_contact' | 'payment';
    user_id?: string;
    property_id?: string;
    metadata?: Record<string, any>;
  }
): Promise<TrackingEvent> {
  const id = crypto.randomUUID();
  const now = Date.now();
  
  // Validate affiliate_id and check if active
  let finalAffiliateId = data.affiliate_id;
  const affiliate = await getAffiliateById(db, data.affiliate_id);
  
  // If affiliate doesn't exist or is inactive, use NO_AFFILIATE_ID
  if (!affiliate || affiliate.status === 'inactive') {
    finalAffiliateId = 'NO_AFFILIATE_ID';
  }
  
  const metadataJson = data.metadata ? JSON.stringify(data.metadata) : null;

  await db.prepare(`
    INSERT INTO tracking_events (
      id, affiliate_id, event_type, user_id, property_id, metadata, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
    .bind(
      id,
      finalAffiliateId,
      data.event_type,
      data.user_id || null,
      data.property_id || null,
      metadataJson,
      now
    )
    .run();

  return {
    id,
    affiliate_id: finalAffiliateId,
    event_type: data.event_type,
    user_id: data.user_id || null,
    property_id: data.property_id || null,
    metadata: metadataJson,
    created_at: now,
  };
}

/**
 * Get tracking events with optional filters
 * Supports filtering by affiliate, event type, user, property, and date range
 * Returns events ordered by creation date (newest first)
 */
export async function getTrackingEvents(
  db: D1Database,
  filters?: TrackingEventFilters
): Promise<TrackingEvent[]> {
  let query = 'SELECT * FROM tracking_events WHERE 1=1';
  const bindings: any[] = [];

  if (filters?.affiliate_id) {
    query += ' AND affiliate_id = ?';
    bindings.push(filters.affiliate_id);
  }

  if (filters?.event_type) {
    query += ' AND event_type = ?';
    bindings.push(filters.event_type);
  }

  if (filters?.user_id) {
    query += ' AND user_id = ?';
    bindings.push(filters.user_id);
  }

  if (filters?.property_id) {
    query += ' AND property_id = ?';
    bindings.push(filters.property_id);
  }

  if (filters?.start_date) {
    query += ' AND created_at >= ?';
    bindings.push(filters.start_date);
  }

  if (filters?.end_date) {
    query += ' AND created_at <= ?';
    bindings.push(filters.end_date);
  }

  query += ' ORDER BY created_at DESC';

  if (filters?.limit) {
    query += ' LIMIT ?';
    bindings.push(filters.limit);
  }

  if (filters?.offset) {
    query += ' OFFSET ?';
    bindings.push(filters.offset);
  }

  const result = await db.prepare(query).bind(...bindings).all();
  return (result.results || []) as unknown as TrackingEvent[];
}

/**
 * Get statistics for an affiliate
 * Returns counts of events by type and total events
 * Optionally filters by date range
 */
export async function getAffiliateStats(
  db: D1Database,
  affiliateId: string,
  filters?: {
    start_date?: number;
    end_date?: number;
  }
): Promise<AffiliateStats> {
  let query = `
    SELECT 
      affiliate_id,
      SUM(CASE WHEN event_type = 'signup' THEN 1 ELSE 0 END) as total_signups,
      SUM(CASE WHEN event_type = 'property_contact' THEN 1 ELSE 0 END) as total_contacts,
      SUM(CASE WHEN event_type = 'payment' THEN 1 ELSE 0 END) as total_payments,
      COUNT(*) as total_events
    FROM tracking_events
    WHERE affiliate_id = ?
  `;
  
  const bindings: any[] = [affiliateId];

  if (filters?.start_date) {
    query += ' AND created_at >= ?';
    bindings.push(filters.start_date);
  }

  if (filters?.end_date) {
    query += ' AND created_at <= ?';
    bindings.push(filters.end_date);
  }

  query += ' GROUP BY affiliate_id';

  const result = await db.prepare(query).bind(...bindings).first();
  
  // If no events found, return zeros
  if (!result) {
    return {
      affiliate_id: affiliateId,
      total_signups: 0,
      total_contacts: 0,
      total_payments: 0,
      total_events: 0,
    };
  }

  return result as unknown as AffiliateStats;
}

// ============================================================================
// Affiliate Commission Functions
// ============================================================================

interface AffiliateCommissionConfig {
  id: string;
  service_category: 'ca' | 'legal' | 'other' | 'default';
  commission_type: 'percentage' | 'fixed';
  commission_value: number;
  currency: string;
  is_active: number;
  created_at: number;
  updated_at: number;
}

interface AffiliateCommission {
  id: string;
  affiliate_id: string;
  service_request_id: string;
  commission_amount: number;
  commission_currency: string;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  service_amount: number;
  service_currency: string;
  notes: string | null;
  created_at: number;
  updated_at: number;
}

/**
 * Get commission configuration for a service category
 * Falls back to default configuration if category-specific config not found
 */
export async function getCommissionConfig(
  db: D1Database,
  serviceCategory: 'ca' | 'legal' | 'other'
): Promise<AffiliateCommissionConfig | null> {
  // Try to get category-specific config first
  let result = await db
    .prepare('SELECT * FROM affiliate_commission_config WHERE service_category = ? AND is_active = 1')
    .bind(serviceCategory)
    .first<AffiliateCommissionConfig>();

  // Fall back to default config if not found
  if (!result) {
    result = await db
      .prepare('SELECT * FROM affiliate_commission_config WHERE service_category = ? AND is_active = 1')
      .bind('default')
      .first<AffiliateCommissionConfig>();
  }

  return result;
}

/**
 * Calculate commission amount based on configuration
 */
export function calculateCommission(
  config: AffiliateCommissionConfig,
  serviceAmount: number
): number {
  if (config.commission_type === 'percentage') {
    return (serviceAmount * config.commission_value) / 100;
  } else {
    return config.commission_value;
  }
}

/**
 * Create an affiliate commission record
 * Returns the created commission
 */
export async function createAffiliateCommission(
  db: D1Database,
  data: {
    affiliateId: string;
    serviceRequestId: string;
    commissionAmount: number;
    commissionCurrency: string;
    serviceAmount: number;
    serviceCurrency: string;
    notes?: string;
  }
): Promise<AffiliateCommission> {
  const id = crypto.randomUUID();
  const now = Date.now();

  await db
    .prepare(`
      INSERT INTO affiliate_commissions (
        id, affiliate_id, service_request_id, commission_amount, commission_currency,
        status, service_amount, service_currency, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id,
      data.affiliateId,
      data.serviceRequestId,
      data.commissionAmount,
      data.commissionCurrency,
      'pending',
      data.serviceAmount,
      data.serviceCurrency,
      data.notes || null,
      now,
      now
    )
    .run();

  return {
    id,
    affiliate_id: data.affiliateId,
    service_request_id: data.serviceRequestId,
    commission_amount: data.commissionAmount,
    commission_currency: data.commissionCurrency,
    status: 'pending',
    service_amount: data.serviceAmount,
    service_currency: data.serviceCurrency,
    notes: data.notes || null,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Get commission by service request ID
 */
export async function getCommissionByServiceRequestId(
  db: D1Database,
  serviceRequestId: string
): Promise<AffiliateCommission | null> {
  const result = await db
    .prepare('SELECT * FROM affiliate_commissions WHERE service_request_id = ?')
    .bind(serviceRequestId)
    .first<AffiliateCommission>();

  return result;
}

/**
 * Update commission status
 * Used for handling refunds and status changes
 */
export async function updateCommissionStatus(
  db: D1Database,
  commissionId: string,
  status: 'pending' | 'approved' | 'paid' | 'cancelled',
  notes?: string
): Promise<AffiliateCommission | null> {
  const now = Date.now();

  await db
    .prepare(`
      UPDATE affiliate_commissions
      SET status = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `)
    .bind(status, notes || null, now, commissionId)
    .run();

  const result = await db
    .prepare('SELECT * FROM affiliate_commissions WHERE id = ?')
    .bind(commissionId)
    .first<AffiliateCommission>();

  return result;
}

/**
 * Get all commissions for an affiliate
 * Optionally filters by status and date range
 */
export async function getAffiliateCommissions(
  db: D1Database,
  affiliateId: string,
  filters?: {
    status?: 'pending' | 'approved' | 'paid' | 'cancelled';
    start_date?: number;
    end_date?: number;
  }
): Promise<AffiliateCommission[]> {
  let query = 'SELECT * FROM affiliate_commissions WHERE affiliate_id = ?';
  const bindings: any[] = [affiliateId];

  if (filters?.status) {
    query += ' AND status = ?';
    bindings.push(filters.status);
  }

  if (filters?.start_date) {
    query += ' AND created_at >= ?';
    bindings.push(filters.start_date);
  }

  if (filters?.end_date) {
    query += ' AND created_at <= ?';
    bindings.push(filters.end_date);
  }

  query += ' ORDER BY created_at DESC';

  const result = await db.prepare(query).bind(...bindings).all();
  return (result.results || []) as unknown as AffiliateCommission[];
}

/**
 * Get commission summary for an affiliate
 * Returns total commission amounts by status
 */
export async function getAffiliateCommissionSummary(
  db: D1Database,
  affiliateId: string,
  filters?: {
    start_date?: number;
    end_date?: number;
  }
): Promise<{
  total_pending: number;
  total_approved: number;
  total_paid: number;
  total_cancelled: number;
  total_earned: number;
  currency: string;
}> {
  let query = `
    SELECT 
      SUM(CASE WHEN status = 'pending' THEN commission_amount ELSE 0 END) as total_pending,
      SUM(CASE WHEN status = 'approved' THEN commission_amount ELSE 0 END) as total_approved,
      SUM(CASE WHEN status = 'paid' THEN commission_amount ELSE 0 END) as total_paid,
      SUM(CASE WHEN status = 'cancelled' THEN commission_amount ELSE 0 END) as total_cancelled,
      SUM(CASE WHEN status IN ('pending', 'approved', 'paid') THEN commission_amount ELSE 0 END) as total_earned,
      commission_currency as currency
    FROM affiliate_commissions
    WHERE affiliate_id = ?
  `;
  
  const bindings: any[] = [affiliateId];

  if (filters?.start_date) {
    query += ' AND created_at >= ?';
    bindings.push(filters.start_date);
  }

  if (filters?.end_date) {
    query += ' AND created_at <= ?';
    bindings.push(filters.end_date);
  }

  query += ' GROUP BY commission_currency';

  const result = await db.prepare(query).bind(...bindings).first();
  
  // If no commissions found, return zeros
  if (!result) {
    return {
      total_pending: 0,
      total_approved: 0,
      total_paid: 0,
      total_cancelled: 0,
      total_earned: 0,
      currency: 'INR',
    };
  }

  return result as unknown as {
    total_pending: number;
    total_approved: number;
    total_paid: number;
    total_cancelled: number;
    total_earned: number;
    currency: string;
  };
}
