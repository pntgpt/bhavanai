# Affiliate Tracking System - Design Document

## Overview

The affiliate tracking system enables Bhavan.ai to attribute user actions (signups, property contacts, and future payments) to affiliate partners. The system uses URL-based tracking where affiliate IDs are passed as query parameters and preserved throughout the user's navigation session. Administrators can create and manage affiliate IDs, view performance metrics, and generate trackable links.

The design follows a URL-parameter-only approach where the affiliate_id persists through client-side URL manipulation rather than cookies or session storage. This ensures clean attribution while respecting user privacy and avoiding cookie consent requirements.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  URL Parameter Manager (lib/affiliate.ts)              │ │
│  │  - Extracts affiliate_id from URL                      │ │
│  │  - Appends affiliate_id to all navigation links        │ │
│  │  - Provides current affiliate_id to forms/actions      │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                   │
│                           ▼                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React Components                                       │ │
│  │  - Admin Dashboard (affiliate management)              │ │
│  │  - Forms (signup, contact) with affiliate tracking     │ │
│  │  - Navigation components with URL preservation         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP Requests
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare Pages Functions (API)                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Affiliate API Endpoints                                │ │
│  │  - /api/admin/affiliates (CRUD operations)             │ │
│  │  - /api/admin/affiliates/[id]/stats                    │ │
│  │  - /api/tracking/event (record tracking events)        │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                   │
│                           ▼                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Database Layer (functions/lib/db.ts)                  │ │
│  │  - Affiliate CRUD operations                           │ │
│  │  - Tracking event operations                           │ │
│  │  - Analytics queries                                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Cloudflare D1 Database                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  affiliates table                                       │ │
│  │  - id, name, description, status, created_at           │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  tracking_events table                                  │ │
│  │  - id, affiliate_id, event_type, user_id, property_id │ │
│  │  - metadata, created_at                                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

1. **Client-Side URL Manager** (`lib/affiliate.ts`)
   - Extracts affiliate_id from current URL
   - Provides utility to append affiliate_id to navigation URLs
   - Validates affiliate_id format
   - Integrates with Next.js router for automatic URL preservation

2. **Admin Dashboard Components**
   - Affiliate management interface (create, edit, deactivate)
   - Performance metrics dashboard
   - Link generator tool
   - Event log viewer

3. **API Layer** (Cloudflare Pages Functions)
   - RESTful endpoints for affiliate CRUD operations
   - Tracking event recording endpoint
   - Analytics aggregation endpoints
   - Authentication and authorization middleware

4. **Database Layer** (`functions/lib/db.ts`)
   - Type-safe database operations
   - Query builders for analytics
   - Transaction support for data integrity

## Components and Interfaces

### Database Schema

```sql
-- Affiliates table
CREATE TABLE affiliates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Tracking events table
CREATE TABLE tracking_events (
  id TEXT PRIMARY KEY,
  affiliate_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN ('signup', 'property_contact', 'payment')),
  user_id TEXT,
  property_id TEXT,
  metadata TEXT, -- JSON field for extensibility
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (affiliate_id) REFERENCES affiliates(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- Indexes for performance
CREATE INDEX idx_affiliates_status ON affiliates(status);
CREATE INDEX idx_tracking_events_affiliate ON tracking_events(affiliate_id);
CREATE INDEX idx_tracking_events_type ON tracking_events(event_type);
CREATE INDEX idx_tracking_events_user ON tracking_events(user_id);
CREATE INDEX idx_tracking_events_created ON tracking_events(created_at);
```

### TypeScript Interfaces

```typescript
// Core affiliate interface
interface Affiliate {
  id: string;
  name: string;
  description: string | null;
  status: 'active' | 'inactive';
  created_at: number;
  updated_at: number;
}

// Tracking event interface
interface TrackingEvent {
  id: string;
  affiliate_id: string;
  event_type: 'signup' | 'property_contact' | 'payment';
  user_id: string | null;
  property_id: string | null;
  metadata: string | null; // JSON string
  created_at: number;
}

// Affiliate with statistics
interface AffiliateWithStats extends Affiliate {
  total_signups: number;
  total_contacts: number;
  total_payments: number;
  total_events: number;
}

// Create affiliate request
interface CreateAffiliateRequest {
  name: string;
  description?: string;
}

// Update affiliate request
interface UpdateAffiliateRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

// Track event request
interface TrackEventRequest {
  affiliate_id: string;
  event_type: 'signup' | 'property_contact' | 'payment';
  user_id?: string;
  property_id?: string;
  metadata?: Record<string, any>;
}

// Analytics query filters
interface AnalyticsFilters {
  affiliate_id?: string;
  event_type?: 'signup' | 'property_contact' | 'payment';
  start_date?: number;
  end_date?: number;
}
```

### API Endpoints

#### Admin Affiliate Management

```typescript
// GET /api/admin/affiliates
// Returns: Affiliate[]
// Auth: Admin only

// POST /api/admin/affiliates
// Body: CreateAffiliateRequest
// Returns: Affiliate
// Auth: Admin only

// GET /api/admin/affiliates/[id]
// Returns: Affiliate
// Auth: Admin only

// PUT /api/admin/affiliates/[id]
// Body: UpdateAffiliateRequest
// Returns: Affiliate
// Auth: Admin only

// DELETE /api/admin/affiliates/[id]
// Returns: { success: boolean }
// Auth: Admin only

// GET /api/admin/affiliates/[id]/stats
// Query: ?start_date=<timestamp>&end_date=<timestamp>
// Returns: AffiliateWithStats
// Auth: Admin only

// GET /api/admin/affiliates/[id]/events
// Query: ?event_type=<type>&limit=<number>&offset=<number>
// Returns: { events: TrackingEvent[], total: number }
// Auth: Admin only
```

#### Tracking Events

```typescript
// POST /api/tracking/event
// Body: TrackEventRequest
// Returns: { success: boolean, event_id: string }
// Auth: None (public endpoint with validation)
```

### Client-Side Utilities

```typescript
// lib/affiliate.ts

/**
 * Extracts affiliate_id from current URL
 */
export function getAffiliateIdFromURL(): string | null;

/**
 * Appends affiliate_id to a URL if present in current context
 */
export function appendAffiliateId(url: string): string;

/**
 * Validates affiliate_id format
 */
export function isValidAffiliateId(id: string): boolean;

/**
 * Gets current affiliate_id or returns NO_AFFILIATE_ID
 */
export function getCurrentAffiliateId(): string;

/**
 * React hook for accessing affiliate_id
 */
export function useAffiliateId(): string;

/**
 * Higher-order component to wrap links with affiliate_id
 */
export function withAffiliateTracking<P>(Component: React.ComponentType<P>): React.ComponentType<P>;
```

## Data Models

### Affiliate

Represents an affiliate partner in the system.

**Fields:**
- `id`: Unique identifier (UUID)
- `name`: Display name for the affiliate (e.g., "Partner Marketing Agency")
- `description`: Optional description of the affiliate relationship
- `status`: Either 'active' or 'inactive' - inactive affiliates cannot receive new tracking events
- `created_at`: Unix timestamp of creation
- `updated_at`: Unix timestamp of last update

**Constraints:**
- `id` must be unique
- `name` is required and must be non-empty
- `status` must be either 'active' or 'inactive'

**Special Affiliate:**
- `NO_AFFILIATE_ID`: A reserved affiliate ID used for tracking events without an affiliate attribution

### Tracking Event

Represents a user action attributed to an affiliate.

**Fields:**
- `id`: Unique identifier (UUID)
- `affiliate_id`: Reference to affiliate (or NO_AFFILIATE_ID)
- `event_type`: Type of event ('signup', 'property_contact', 'payment')
- `user_id`: Optional reference to user (null for anonymous events)
- `property_id`: Optional reference to property (for property_contact events)
- `metadata`: Optional JSON field for additional event data
- `created_at`: Unix timestamp of event

**Constraints:**
- `affiliate_id` must reference an existing affiliate
- `event_type` must be one of the defined types
- `user_id` must reference an existing user if provided
- `property_id` must reference an existing property if provided

**Event Types:**
1. **signup**: User registration event
   - `user_id`: Required (newly created user)
   - `property_id`: null
   - `metadata`: May include registration source, user type

2. **property_contact**: User contacts a property
   - `user_id`: Optional (may be anonymous)
   - `property_id`: Required
   - `metadata`: May include contact method, message preview

3. **payment**: Future payment event
   - `user_id`: Required
   - `property_id`: Optional
   - `metadata`: May include payment amount, payment method

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Acceptance Criteria Testing Prework

1.1 WHEN an admin creates a new affiliate ID, THE System SHALL generate a unique identifier and store it in the database
Thoughts: This is about ensuring that when we create an affiliate, we get a unique ID back and it's stored. We can test this by creating random affiliates and checking that each has a unique ID and can be retrieved from the database.
Testable: yes - property

1.2 WHEN an admin views the affiliate management page, THE System SHALL display all existing affiliate IDs with their metadata
Thoughts: This is about the UI displaying data correctly. We can test the underlying data retrieval function by creating random affiliates and ensuring the query returns all of them with correct metadata.
Testable: yes - property

1.3 WHEN an admin deactivates an affiliate ID, THE System SHALL prevent new tracking events from being associated with that affiliate
Thoughts: This is a rule that should apply to all affiliates. We can create a random affiliate, deactivate it, then attempt to create a tracking event and verify it's rejected.
Testable: yes - property

1.4 WHERE an affiliate ID is created, THE System SHALL require a name and optional description
Thoughts: This is input validation. We can test that creating an affiliate without a name fails, and that creating one with just a name succeeds.
Testable: yes - property

1.5 WHEN an admin edits an affiliate, THE System SHALL update the affiliate metadata while preserving the unique identifier
Thoughts: This is about update operations preserving the ID. We can create a random affiliate, update its fields, and verify the ID remains the same but other fields changed.
Testable: yes - property

2.1 WHEN a visitor accesses the System with an affiliate_id URL parameter, THE System SHALL preserve the affiliate_id parameter in all internal navigation links
Thoughts: This is about URL manipulation across all links. We can test the link generation function by providing an affiliate_id and checking that generated URLs contain it.
Testable: yes - property

2.3 WHEN a visitor performs a tracked action, THE System SHALL read the affiliate_id from the current URL parameter
Thoughts: This is about the tracking function correctly extracting the affiliate_id from URLs. We can test by providing URLs with affiliate_id parameters and verifying extraction works.
Testable: yes - property

2.4 IF an affiliate_id URL parameter is invalid or inactive, THEN THE System SHALL ignore the parameter and proceed without affiliate tracking
Thoughts: This is error handling for invalid affiliate IDs. We can test by providing invalid/inactive affiliate IDs and verifying they're treated as NO_AFFILIATE_ID.
Testable: yes - property

2.5 WHEN a visitor accesses the System without an affiliate_id parameter, THE System SHALL associate all tracking events with a generic affiliate ID "NO_AFFILIATE_ID"
Thoughts: This is about default behavior. We can test by creating tracking events without an affiliate_id and verifying they're associated with NO_AFFILIATE_ID.
Testable: yes - property

3.1 WHEN a visitor with an affiliate ID completes a signup, THE System SHALL create a tracking event record linking the user to the affiliate
Thoughts: This is about the signup flow creating tracking events. We can test by simulating signups with various affiliate IDs and verifying tracking events are created.
Testable: yes - property

3.2 WHEN a signup tracking event is created, THE System SHALL store the user ID, affiliate ID, event type, and timestamp
Thoughts: This is about data completeness in tracking events. We can verify that created tracking events have all required fields populated.
Testable: yes - property

3.4 WHEN a signup event is recorded, THE System SHALL maintain data integrity between users and affiliates tables
Thoughts: This is about referential integrity. We can test that tracking events reference valid users and affiliates.
Testable: yes - property

4.1 WHEN a visitor with an affiliate ID contacts a property, THE System SHALL create a tracking event record linking the contact to the affiliate
Thoughts: Similar to signup tracking, this is about property contact events being tracked. We can test with random property contacts and affiliate IDs.
Testable: yes - property

4.3 WHEN a property contact event is created, THE System SHALL store the user ID if the visitor is authenticated
Thoughts: This is conditional logic - authenticated users should have their ID stored, anonymous users should not.
Testable: yes - property

5.1 WHEN an admin views the affiliate dashboard, THE System SHALL display total signups per affiliate
Thoughts: This is about aggregation queries. We can test by creating random tracking events and verifying the count query returns correct totals.
Testable: yes - property

5.3 WHEN an admin views the affiliate dashboard, THE System SHALL display events in chronological order with filtering options
Thoughts: This is about query ordering and filtering. We can test that events are returned in the correct order and filters work.
Testable: yes - property

5.4 WHEN an admin views affiliate details, THE System SHALL show a breakdown of events by type and date range
Thoughts: This is about filtered aggregation queries with date ranges.
Testable: yes - property

5.5 WHERE date range filters are applied, THE System SHALL return only events within the specified period
Thoughts: This is about date filtering correctness. We can test with random date ranges and verify only matching events are returned.
Testable: yes - property

6.3 WHEN tracking events are stored, THE System SHALL include optional metadata fields for future extensibility
Thoughts: This is about the presence of metadata fields in the schema and their usage.
Testable: yes - property

6.4 WHEN querying tracking events, THE System SHALL support filtering by event type
Thoughts: This is about query functionality. We can test that filtering by event type returns only matching events.
Testable: yes - property

7.2 WHEN an admin generates an affiliate link, THE System SHALL append the affiliate_id parameter to the base URL
Thoughts: This is about URL generation. We can test the link generation function with various inputs and verify the affiliate_id is correctly appended.
Testable: yes - property

7.3 WHEN an admin generates an affiliate link, THE System SHALL provide options for different landing pages
Thoughts: This is about the link generator supporting multiple base URLs. We can test that it works with different landing page options.
Testable: yes - property

### Property Reflection

After reviewing all testable properties, the following redundancies were identified and consolidated:

- **Properties 2.1 and 2.2** (URL preservation during navigation) → Combined into Property 2
- **Properties 3.2 and 4.2** (data completeness in tracking events) → Combined into Property 4
- **Properties 3.3 and 4.4** (handling missing affiliate IDs) → Covered by Property 3
- **Properties 5.1 and 5.2** (event counting by type) → Combined into Property 9

Property 1: Affiliate creation uniqueness
*For any* set of affiliate creation requests, each created affiliate should have a unique ID and be retrievable from the database
**Validates: Requirements 1.1**

Property 2: URL affiliate parameter preservation
*For any* internal navigation URL and affiliate_id, the generated URL should contain the affiliate_id parameter
**Validates: Requirements 2.1**

Property 3: Default affiliate attribution
*For any* tracking event created without an explicit affiliate_id, the event should be associated with "NO_AFFILIATE_ID"
**Validates: Requirements 2.5**

Property 4: Tracking event data completeness
*For any* tracking event, all required fields (affiliate_id, event_type, timestamp) should be populated, and optional fields (user_id, property_id) should be populated when applicable
**Validates: Requirements 3.2, 4.2**

Property 5: Inactive affiliate rejection
*For any* inactive affiliate, attempting to create a tracking event with that affiliate_id should result in the event being associated with "NO_AFFILIATE_ID" instead
**Validates: Requirements 1.3**

Property 6: Affiliate name validation
*For any* affiliate creation request without a name, the creation should fail with a validation error
**Validates: Requirements 1.4**

Property 7: Affiliate update ID preservation
*For any* affiliate and update operation, the affiliate's ID should remain unchanged after the update
**Validates: Requirements 1.5**

Property 8: Affiliate ID extraction from URL
*For any* URL containing an affiliate_id parameter, the extraction function should correctly return the affiliate_id value
**Validates: Requirements 2.3**

Property 9: Invalid affiliate ID handling
*For any* invalid or non-existent affiliate_id, the system should treat it as "NO_AFFILIATE_ID"
**Validates: Requirements 2.4**

Property 10: Signup event creation
*For any* user signup with an affiliate_id, a tracking event of type "signup" should be created linking the user to the affiliate
**Validates: Requirements 3.1**

Property 11: Referential integrity
*For any* tracking event, the affiliate_id should reference an existing affiliate, and user_id/property_id (if present) should reference existing records
**Validates: Requirements 3.4**

Property 12: Property contact event creation
*For any* property contact action with an affiliate_id, a tracking event of type "property_contact" should be created with the property_id
**Validates: Requirements 4.1**

Property 13: Authenticated user tracking
*For any* property contact event where the user is authenticated, the tracking event should include the user_id
**Validates: Requirements 4.3**

Property 14: Event aggregation by affiliate
*For any* affiliate, querying event counts should return accurate totals grouped by event type
**Validates: Requirements 5.1, 5.2**

Property 15: Event chronological ordering
*For any* set of tracking events, querying events should return them ordered by created_at timestamp in descending order
**Validates: Requirements 5.3**

Property 16: Event filtering by type and date
*For any* event type filter and date range, the query should return only events matching both criteria
**Validates: Requirements 5.4, 5.5**

Property 17: Metadata field presence
*For any* tracking event, the metadata field should accept and store valid JSON data
**Validates: Requirements 6.3**

Property 18: Event type filtering
*For any* event type, querying with that type filter should return only events of that type
**Validates: Requirements 6.4**

Property 19: Affiliate link generation
*For any* affiliate_id and base URL, the generated link should be a valid URL containing the affiliate_id parameter
**Validates: Requirements 7.2**

Property 20: Multi-page link generation
*For any* affiliate_id and set of landing page URLs, the link generator should produce valid links for each landing page
**Validates: Requirements 7.3**

## Error Handling

### Client-Side Error Handling

1. **Invalid Affiliate ID Format**
   - Validation: Check affiliate_id matches expected format (alphanumeric, reasonable length)
   - Action: Treat as NO_AFFILIATE_ID, log warning for debugging
   - User Impact: None - tracking continues with default attribution

2. **URL Manipulation Failures**
   - Scenario: URL parsing or manipulation fails
   - Action: Fall back to URL without affiliate_id, log error
   - User Impact: Navigation continues normally, affiliate tracking may be lost

3. **Network Failures During Tracking**
   - Scenario: API call to record tracking event fails
   - Action: Retry once, then fail silently
   - User Impact: None - user action (signup, contact) proceeds normally
   - Monitoring: Log failures for admin review

### Server-Side Error Handling

1. **Database Connection Failures**
   - Response: 503 Service Unavailable
   - Action: Log error, return generic error message
   - Retry: Client should retry after delay

2. **Invalid Affiliate ID in Request**
   - Response: 400 Bad Request with validation details
   - Action: Reject request, return specific error message

3. **Inactive Affiliate in Tracking Request**
   - Response: 200 OK (tracking continues with NO_AFFILIATE_ID)
   - Action: Log warning, create event with NO_AFFILIATE_ID
   - Rationale: Don't break user experience for affiliate status changes

4. **Duplicate Affiliate Name**
   - Response: 409 Conflict
   - Action: Return error indicating name must be unique

5. **Foreign Key Violations**
   - Response: 400 Bad Request
   - Action: Return error indicating referenced entity doesn't exist

6. **Concurrent Update Conflicts**
   - Response: 409 Conflict
   - Action: Return error, client should refetch and retry

### Validation Rules

1. **Affiliate Creation/Update**
   - Name: Required, 1-100 characters, non-empty after trim
   - Description: Optional, max 500 characters
   - Status: Must be 'active' or 'inactive'

2. **Tracking Event Creation**
   - affiliate_id: Required, must exist in database or be NO_AFFILIATE_ID
   - event_type: Required, must be 'signup', 'property_contact', or 'payment'
   - user_id: Optional, must exist in users table if provided
   - property_id: Optional, must exist in properties table if provided
   - metadata: Optional, must be valid JSON if provided

3. **Analytics Queries**
   - start_date: Optional, must be valid Unix timestamp
   - end_date: Optional, must be valid Unix timestamp, must be >= start_date
   - event_type: Optional, must be valid event type
   - affiliate_id: Optional, must exist in database

## Testing Strategy

### Unit Testing

Unit tests will verify individual functions and components work correctly in isolation:

1. **Database Operations** (`functions/lib/db.ts`)
   - Test CRUD operations for affiliates
   - Test tracking event creation and queries
   - Test analytics aggregation functions
   - Test error handling for invalid inputs

2. **URL Utilities** (`lib/affiliate.ts`)
   - Test affiliate_id extraction from various URL formats
   - Test URL generation with affiliate_id appending
   - Test validation functions
   - Test edge cases (empty strings, special characters, etc.)

3. **API Endpoints**
   - Test request validation
   - Test authentication/authorization
   - Test response formatting
   - Test error responses

4. **React Components**
   - Test affiliate management UI interactions
   - Test link generator functionality
   - Test analytics dashboard rendering
   - Test form submissions with affiliate tracking

### Property-Based Testing

Property-based tests will verify universal properties hold across all inputs using **fast-check** (JavaScript/TypeScript property testing library). Each test will run a minimum of 100 iterations with randomly generated inputs.

**Testing Framework**: fast-check (https://github.com/dubzzz/fast-check)

**Configuration**: Each property test will be configured with:
```typescript
fc.assert(
  fc.property(/* generators */, /* test function */),
  { numRuns: 100 } // Minimum 100 iterations
);
```

**Property Test Tagging**: Each property-based test will include a comment with this exact format:
```typescript
// Feature: affiliate-tracking, Property X: <property description>
```

This ensures traceability between design properties and test implementations.

### Integration Testing

Integration tests will verify components work together correctly:

1. **End-to-End Affiliate Tracking Flow**
   - User clicks affiliate link → navigates site → signs up
   - Verify tracking event created with correct affiliate_id
   - Verify event appears in admin dashboard

2. **Admin Workflow**
   - Create affiliate → generate link → view stats
   - Verify all operations complete successfully
   - Verify data consistency across operations

3. **Multi-Event Tracking**
   - User performs multiple tracked actions
   - Verify all events recorded correctly
   - Verify analytics aggregate correctly

### Test Data Generators

For property-based testing, we'll need generators for:

1. **Affiliate Data**
   - Valid names (1-100 chars, various character sets)
   - Valid descriptions (0-500 chars)
   - Valid statuses ('active', 'inactive')

2. **Tracking Events**
   - Valid event types
   - Valid/invalid affiliate IDs
   - Valid/invalid user IDs
   - Valid/invalid property IDs
   - Valid JSON metadata

3. **URLs**
   - URLs with/without affiliate_id parameter
   - URLs with various query parameters
   - Edge cases (malformed URLs, special characters)

4. **Date Ranges**
   - Valid timestamp pairs (start < end)
   - Edge cases (same timestamp, far future/past)

### Testing Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Database Cleanup**: Tests should clean up created data or use transactions
3. **Mocking**: Mock external dependencies (R2, email services) in unit tests
4. **Realistic Data**: Use realistic test data that matches production patterns
5. **Error Cases**: Test both success and failure paths
6. **Performance**: Monitor test execution time, optimize slow tests

## Implementation Notes

### URL Parameter Persistence Strategy

The affiliate_id will be preserved through client-side URL manipulation:

1. **Next.js Link Component Wrapper**: Create a custom Link component that automatically appends affiliate_id
2. **Router Integration**: Use Next.js router events to ensure affiliate_id persists on navigation
3. **Form Submissions**: Extract affiliate_id from URL before form submission
4. **External Links**: Don't append affiliate_id to external links

### NO_AFFILIATE_ID Implementation

The special "NO_AFFILIATE_ID" affiliate will be:

1. **Pre-seeded**: Created during database initialization
2. **Protected**: Cannot be deleted or deactivated through admin UI
3. **Hidden**: Not shown in regular affiliate lists (filtered out)
4. **Reportable**: Included in analytics to show organic traffic

### Performance Considerations

1. **Database Indexes**: Ensure proper indexes on tracking_events table for fast queries
2. **Query Optimization**: Use aggregation queries efficiently, consider caching for dashboard
3. **Batch Operations**: Consider batching tracking event creation for high-volume scenarios
4. **URL Manipulation**: Keep URL operations lightweight to avoid navigation delays

### Security Considerations

1. **SQL Injection**: Use parameterized queries for all database operations
2. **XSS Prevention**: Sanitize affiliate names and descriptions before display
3. **Authorization**: Enforce admin-only access to affiliate management endpoints
4. **Rate Limiting**: Consider rate limiting on tracking event endpoint to prevent abuse
5. **Data Privacy**: Ensure tracking complies with privacy regulations (GDPR, CCPA)

### Migration Strategy

1. **Database Migration**: Add new tables (affiliates, tracking_events) with proper indexes
2. **Seed NO_AFFILIATE_ID**: Create the special affiliate during migration
3. **Backward Compatibility**: Existing functionality should work without affiliate tracking
4. **Gradual Rollout**: Can enable affiliate tracking incrementally per feature

## Future Enhancements

1. **Payment Tracking**: Implement payment event tracking when payment system is added
2. **Commission Calculation**: Add commission tracking and payout management
3. **Advanced Analytics**: Add conversion funnels, time-to-conversion metrics
4. **Affiliate Portal**: Self-service portal for affiliates to view their stats
5. **Multi-Touch Attribution**: Track multiple affiliate touchpoints in user journey
6. **Referral Codes**: Support human-readable referral codes in addition to IDs
7. **Webhook Notifications**: Notify affiliates of conversions in real-time
8. **A/B Testing**: Track which affiliate campaigns perform best
