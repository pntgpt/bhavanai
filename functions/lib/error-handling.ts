/**
 * Error Handling Utilities
 * 
 * Provides comprehensive error handling, retry logic, user-friendly error messages,
 * and structured error logging with context
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */

/**
 * Custom error classes for different error types
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;
  public readonly timestamp: number;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.context = context;
    this.timestamp = Date.now();

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error for invalid input data
 */
export class ValidationError extends AppError {
  public readonly fields?: Record<string, string>;

  constructor(message: string, fields?: Record<string, string>, context?: Record<string, any>) {
    super(message, 400, 'VALIDATION_ERROR', true, context);
    this.fields = fields;
  }
}

/**
 * Database error for database operations
 */
export class DatabaseError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 500, 'DATABASE_ERROR', true, context);
  }
}

/**
 * Network error for external service calls
 */
export class NetworkError extends AppError {
  public readonly retryable: boolean;

  constructor(message: string, retryable: boolean = true, context?: Record<string, any>) {
    super(message, 503, 'NETWORK_ERROR', true, context);
    this.retryable = retryable;
  }
}

/**
 * Payment error for payment gateway issues
 */
export class PaymentError extends AppError {
  public readonly gatewayCode?: string;

  constructor(message: string, gatewayCode?: string, context?: Record<string, any>) {
    super(message, 500, 'PAYMENT_ERROR', true, { ...context, gatewayCode });
    this.gatewayCode = gatewayCode;
  }
}

/**
 * Not found error for missing resources
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string, context?: Record<string, any>) {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404, 'NOT_FOUND', true, context);
  }
}

/**
 * Authentication error for auth failures
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: Record<string, any>) {
    super(message, 401, 'AUTHENTICATION_ERROR', true, context);
  }
}

/**
 * Authorization error for permission issues
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', context?: Record<string, any>) {
    super(message, 403, 'AUTHORIZATION_ERROR', true, context);
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Too many requests', retryAfter?: number, context?: Record<string, any>) {
    super(message, 429, 'RATE_LIMIT_ERROR', true, context);
    this.retryAfter = retryAfter;
  }
}

/**
 * Error response format
 * Requirement 11.1: User-friendly error messages with suggested next steps
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    fields?: Record<string, string>;
    retryable: boolean;
    suggestedAction?: string;
    timestamp: number;
    requestId?: string;
  };
}

/**
 * Error log entry format
 * Requirement 11.5: Error logging with timestamp, user context, and stack trace
 */
export interface ErrorLogEntry {
  timestamp: number;
  level: 'error' | 'warn' | 'info';
  code: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userContext?: {
    userId?: string;
    email?: string;
    role?: string;
    ip?: string;
  };
  requestContext?: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    requestId?: string;
  };
}

/**
 * User-friendly error messages mapping
 * Requirement 11.1: Display user-friendly error messages
 */
const USER_FRIENDLY_MESSAGES: Record<string, { message: string; suggestedAction: string }> = {
  VALIDATION_ERROR: {
    message: 'The information provided is invalid. Please check your input and try again.',
    suggestedAction: 'Review the highlighted fields and correct any errors.',
  },
  DATABASE_ERROR: {
    message: 'We encountered a temporary issue saving your information. Please try again.',
    suggestedAction: 'Click the retry button or refresh the page and try again.',
  },
  NETWORK_ERROR: {
    message: 'We\'re having trouble connecting to our services. Please try again in a moment.',
    suggestedAction: 'Check your internet connection and try again. If the problem persists, contact support.',
  },
  PAYMENT_ERROR: {
    message: 'We couldn\'t process your payment. Please check your payment details and try again.',
    suggestedAction: 'Verify your payment information is correct or try a different payment method.',
  },
  NOT_FOUND: {
    message: 'The requested resource could not be found.',
    suggestedAction: 'Please check the URL or go back to the home page.',
  },
  AUTHENTICATION_ERROR: {
    message: 'You need to be logged in to access this resource.',
    suggestedAction: 'Please log in and try again.',
  },
  AUTHORIZATION_ERROR: {
    message: 'You don\'t have permission to access this resource.',
    suggestedAction: 'Contact an administrator if you believe you should have access.',
  },
  RATE_LIMIT_ERROR: {
    message: 'You\'ve made too many requests. Please wait a moment and try again.',
    suggestedAction: 'Wait a few minutes before trying again.',
  },
  INTERNAL_ERROR: {
    message: 'An unexpected error occurred. Our team has been notified.',
    suggestedAction: 'Please try again later or contact support if the problem persists.',
  },
};

/**
 * Convert error to user-friendly error response
 * Requirement 11.1: User-friendly error messages with suggested next steps
 */
export function toErrorResponse(error: Error | AppError, requestId?: string): ErrorResponse {
  if (error instanceof AppError) {
    const friendlyMessage = USER_FRIENDLY_MESSAGES[error.code] || USER_FRIENDLY_MESSAGES.INTERNAL_ERROR;
    
    const response: ErrorResponse = {
      success: false,
      error: {
        code: error.code,
        message: friendlyMessage.message,
        retryable: error instanceof NetworkError ? error.retryable : 
                   error instanceof DatabaseError ? true : false,
        suggestedAction: friendlyMessage.suggestedAction,
        timestamp: error.timestamp,
        requestId,
      },
    };

    // Add validation fields if present
    if (error instanceof ValidationError && error.fields) {
      response.error.fields = error.fields;
    }

    // Add retry after for rate limit errors
    if (error instanceof RateLimitError && error.retryAfter) {
      response.error.details = { retryAfter: error.retryAfter };
    }

    return response;
  }

  // Handle unknown errors
  const friendlyMessage = USER_FRIENDLY_MESSAGES.INTERNAL_ERROR;
  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: friendlyMessage.message,
      retryable: false,
      suggestedAction: friendlyMessage.suggestedAction,
      timestamp: Date.now(),
      requestId,
    },
  };
}

/**
 * Log error with context
 * Requirement 11.5: Error logging with timestamp, user context, and stack trace
 */
export function logError(
  error: Error | AppError,
  context?: {
    user?: { id?: string; email?: string; role?: string };
    request?: { method: string; url: string; headers?: Record<string, string>; requestId?: string };
    additional?: Record<string, any>;
  }
): void {
  const logEntry: ErrorLogEntry = {
    timestamp: Date.now(),
    level: 'error',
    code: error instanceof AppError ? error.code : 'UNKNOWN_ERROR',
    message: error.message,
    stack: error.stack,
    context: error instanceof AppError ? error.context : undefined,
  };

  if (context?.user) {
    logEntry.userContext = {
      userId: context.user.id,
      email: context.user.email,
      role: context.user.role,
    };
  }

  if (context?.request) {
    logEntry.requestContext = {
      method: context.request.method,
      url: context.request.url,
      requestId: context.request.requestId,
    };
  }

  if (context?.additional) {
    logEntry.context = { ...logEntry.context, ...context.additional };
  }

  // Log to console (in production, this would go to a logging service)
  console.error('Error:', JSON.stringify(logEntry, null, 2));

  // In production, you would send this to a logging service like:
  // - Sentry
  // - LogRocket
  // - Datadog
  // - CloudWatch
  // - etc.
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  exponentialBase: number;
  shouldRetry?: (error: Error) => boolean;
}

/**
 * Default retry configuration
 * Requirement 11.3: Automatic retry logic with exponential backoff
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  exponentialBase: 2,
  shouldRetry: (error: Error) => {
    // Retry on network errors and database errors
    if (error instanceof NetworkError && error.retryable) {
      return true;
    }
    if (error instanceof DatabaseError) {
      return true;
    }
    // Don't retry validation, auth, or payment errors
    return false;
  },
};

/**
 * Calculate delay for retry attempt with exponential backoff
 */
function calculateRetryDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(config.exponentialBase, attempt - 1);
  return Math.min(delay, config.maxDelay);
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute function with retry logic and exponential backoff
 * Requirement 11.2: Database error handling with retry option
 * Requirement 11.3: Network timeout retry logic with exponential backoff
 * 
 * @param fn - Function to execute
 * @param config - Retry configuration
 * @returns Result of the function
 * @throws Last error if all retries fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error;

  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      const shouldRetry = retryConfig.shouldRetry 
        ? retryConfig.shouldRetry(lastError)
        : DEFAULT_RETRY_CONFIG.shouldRetry!(lastError);

      // If this is the last attempt or we shouldn't retry, throw the error
      if (attempt >= retryConfig.maxAttempts || !shouldRetry) {
        throw lastError;
      }

      // Calculate delay and wait before retrying
      const delay = calculateRetryDelay(attempt, retryConfig);
      console.warn(
        `Attempt ${attempt} failed, retrying in ${delay}ms...`,
        { error: lastError.message }
      );
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError!;
}

/**
 * Wrap database operation with retry logic
 * Requirement 11.2: Database error handling with retry option
 */
export async function withDatabaseRetry<T>(
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  try {
    return await withRetry(fn, {
      maxAttempts: 3,
      baseDelay: 500,
      shouldRetry: (error: Error) => {
        // Retry on database errors but not on constraint violations
        if (error instanceof DatabaseError) {
          return true;
        }
        // Retry on generic database connection errors
        if (error.message.includes('database') || error.message.includes('connection')) {
          return true;
        }
        return false;
      },
    });
  } catch (error) {
    // Wrap in DatabaseError if not already
    if (!(error instanceof DatabaseError)) {
      throw new DatabaseError(
        error instanceof Error ? error.message : 'Database operation failed',
        context
      );
    }
    throw error;
  }
}

/**
 * Wrap network operation with retry logic
 * Requirement 11.3: Network timeout retry logic with exponential backoff
 */
export async function withNetworkRetry<T>(
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  try {
    return await withRetry(fn, {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      shouldRetry: (error: Error) => {
        // Retry on network errors
        if (error instanceof NetworkError && error.retryable) {
          return true;
        }
        // Retry on timeout and connection errors
        if (
          error.message.includes('timeout') ||
          error.message.includes('ETIMEDOUT') ||
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('ENOTFOUND') ||
          error.message.includes('fetch failed')
        ) {
          return true;
        }
        return false;
      },
    });
  } catch (error) {
    // Wrap in NetworkError if not already
    if (!(error instanceof NetworkError)) {
      throw new NetworkError(
        error instanceof Error ? error.message : 'Network operation failed',
        true,
        context
      );
    }
    throw error;
  }
}

/**
 * Create error response from error
 * Requirement 11.4: Capture error details for debugging while showing generic message to users
 */
export function createErrorResponse(
  error: Error | AppError,
  requestId?: string,
  includeStack: boolean = false
): Response {
  const errorResponse = toErrorResponse(error, requestId);

  // Log the error with full details
  logError(error, {
    request: { method: 'UNKNOWN', url: 'UNKNOWN', requestId },
  });

  // In development, include stack trace
  if (includeStack && error.stack) {
    errorResponse.error.details = {
      ...errorResponse.error.details,
      stack: error.stack,
    };
  }

  const statusCode = error instanceof AppError ? error.statusCode : 500;

  return new Response(JSON.stringify(errorResponse), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...(requestId ? { 'X-Request-ID': requestId } : {}),
    },
  });
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Extract user context from request
 */
export function extractUserContext(data: any): { id?: string; email?: string; role?: string } | undefined {
  if (!data?.user) return undefined;
  
  return {
    id: data.user.id,
    email: data.user.email,
    role: data.user.role,
  };
}

/**
 * Wrap async handler with error handling
 * Requirement 11.4: Unexpected error handling with error capture and generic message
 */
export function withErrorHandling(
  handler: (request: Request, env: any, ctx: any) => Promise<Response>
): (request: Request, env: any, ctx: any) => Promise<Response> {
  return async (request: Request, env: any, ctx: any) => {
    const requestId = generateRequestId();
    
    try {
      return await handler(request, env, ctx);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      // Log error with context
      logError(err, {
        user: extractUserContext(ctx.data),
        request: {
          method: request.method,
          url: request.url,
          requestId,
        },
      });

      // Return error response
      return createErrorResponse(err, requestId, false);
    }
  };
}
