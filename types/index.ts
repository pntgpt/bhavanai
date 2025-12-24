/**
 * Type definitions for the Bhavan.ai marketing website
 * These types ensure type safety across components and utilities
 */

/**
 * UTM Parameters for marketing attribution
 * Used to track campaign performance and user sources
 */
export interface UTMParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

/**
 * Button variants for consistent styling
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

/**
 * Button sizes
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Form types for tracking submissions
 */
export type FormType = 'signup' | 'contact' | 'newsletter';

/**
 * Analytics event categories
 */
export type EventCategory = 'engagement' | 'conversion' | 'navigation';

/**
 * Analytics event structure
 */
export interface AnalyticsEvent {
  eventName: string;
  eventCategory: EventCategory;
  eventLabel?: string;
  eventValue?: number;
  customParams?: Record<string, any>;
}

/**
 * Signup form data structure
 */
export interface SignupData {
  name: string;
  email: string;
  phone: string;
  city: string;
  currentRent: number;
  livingType: 'solo' | 'shared' | 'coliving' | 'family';
  privacyConsent: boolean;
  marketingConsent: boolean;
  utmParams?: UTMParams;
}

/**
 * Contact form data structure
 */
export interface ContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
  utmParams?: UTMParams;
}

/**
 * Newsletter form data structure
 */
export interface NewsletterData {
  email: string;
  utmParams?: UTMParams;
}

/**
 * Form submission request structure
 */
export interface FormSubmissionRequest {
  formType: FormType;
  data: SignupData | ContactData | NewsletterData;
  timestamp: string;
  utmParams?: UTMParams;
}

/**
 * Form submission response structure
 */
export interface FormSubmissionResponse {
  success: boolean;
  message: string;
  leadId?: string;
}

/**
 * Form validation error structure
 */
export interface FormValidationError {
  field: string;
  message: string;
}

/**
 * Property type for real estate listings
 */
export type PropertyType = 'apartment' | 'villa' | 'penthouse' | 'studio';

/**
 * Property status
 */
export type PropertyStatus = 'available' | 'filling' | 'sold';

/**
 * Property data structure for listings
 */
export interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  address: string;
  price: number;
  pricePerShare: number;
  size: number; // in sq ft
  bedrooms: number;
  bathrooms: number;
  propertyType: PropertyType;
  totalCoOwnerSlots: number;
  availableSlots: number;
  images: string[];
  description: string;
  amenities: string[];
  status: PropertyStatus;
  featured?: boolean;
}

/**
 * Property filter options
 */
export interface PropertyFilters {
  city?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  propertyType?: PropertyType;
  minBedrooms?: number;
}

/**
 * User roles in the system
 */
export type UserRole = 'admin' | 'broker' | 'ca' | 'lawyer';

/**
 * User account status
 */
export type UserStatus = 'pending' | 'active' | 'inactive';

/**
 * User data structure
 */
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  created_at?: number;
  updated_at?: number;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Registration data
 */
export interface RegistrationData {
  name: string;
  email: string;
  phone: string;
  userType: 'broker' | 'ca' | 'lawyer';
}

/**
 * Registration response
 */
export interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: string;
  error?: string;
}

/**
 * Session response
 */
export interface SessionResponse {
  authenticated: boolean;
  user?: User;
}

/**
 * Logout response
 */
export interface LogoutResponse {
  success: boolean;
  message: string;
}

/**
 * Property approval status for broker-created properties
 */
export type PropertyApprovalStatus = 'pending' | 'approved' | 'rejected';

/**
 * Property data for broker management
 */
export interface BrokerProperty {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  co_owner_count: number;
  images: string[];
  status: PropertyApprovalStatus;
  rejection_reason?: string;
  broker_id: string;
  created_at: number;
  updated_at: number;
}

/**
 * Cloudflare D1 Database type
 */
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  error?: string;
  meta: {
    duration: number;
    size_after: number;
    rows_read: number;
    rows_written: number;
  };
}

export interface D1ExecResult {
  count: number;
  duration: number;
}

/**
 * Cloudflare Pages Functions environment
 */
export interface Env {
  DB: D1Database;
  IMAGES: R2Bucket;
  MY_BUCKET: R2Bucket;
}

/**
 * Cloudflare R2 Bucket type
 */
export interface R2Bucket {
  head(key: string): Promise<R2Object | null>;
  get(key: string): Promise<R2ObjectBody | null>;
  put(key: string, value: ReadableStream | ArrayBuffer | string, options?: R2PutOptions): Promise<R2Object>;
  delete(keys: string | string[]): Promise<void>;
  list(options?: R2ListOptions): Promise<R2Objects>;
}

export interface R2Object {
  key: string;
  version: string;
  size: number;
  etag: string;
  httpEtag: string;
  uploaded: Date;
  httpMetadata?: R2HTTPMetadata;
  customMetadata?: Record<string, string>;
}

export interface R2ObjectBody extends R2Object {
  body: ReadableStream;
  bodyUsed: boolean;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  json<T = unknown>(): Promise<T>;
  blob(): Promise<Blob>;
}

export interface R2PutOptions {
  httpMetadata?: R2HTTPMetadata;
  customMetadata?: Record<string, string>;
}

export interface R2HTTPMetadata {
  contentType?: string;
  contentLanguage?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  cacheControl?: string;
  cacheExpiry?: Date;
}

export interface R2ListOptions {
  limit?: number;
  prefix?: string;
  cursor?: string;
  delimiter?: string;
}

export interface R2Objects {
  objects: R2Object[];
  truncated: boolean;
  cursor?: string;
  delimitedPrefixes: string[];
}
