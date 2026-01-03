# Implementation Plan

- [x] 1. Database schema and migrations
  - Add affiliates and tracking_events tables to schema.sql
  - Create database migration script
  - Seed NO_AFFILIATE_ID affiliate
  - Commit all changes with detailed message
  - _Requirements: 1.1, 1.4, 2.5_

- [ ] 2. Core database operations
  - [x] 2.1 Implement affiliate CRUD functions in functions/lib/db.ts
    - createAffiliate, getAffiliates, getAffiliateById, updateAffiliate, deleteAffiliate
    - Commit all changes with detailed message
    - _Requirements: 1.1, 1.2, 1.5_

  - [ ]* 2.2 Write property test for affiliate creation uniqueness
    - **Property 1: Affiliate creation uniqueness**
    - **Validates: Requirements 1.1**
    - Commit all changes with detailed message

  - [ ]* 2.3 Write property test for affiliate update ID preservation
    - **Property 7: Affiliate update ID preservation**
    - **Validates: Requirements 1.5**
    - Commit all changes with detailed message

  - [x] 2.4 Implement tracking event functions in functions/lib/db.ts
    - createTrackingEvent, getTrackingEvents, getAffiliateStats
    - Commit all changes with detailed message
    - _Requirements: 3.1, 3.2, 4.1, 5.1, 5.2_

  - [ ]* 2.5 Write property test for tracking event data completeness
    - **Property 4: Tracking event data completeness**
    - **Validates: Requirements 3.2, 4.2**
    - Commit all changes with detailed message

  - [ ]* 2.6 Write property test for referential integrity
    - **Property 11: Referential integrity**
    - **Validates: Requirements 3.4**
    - Commit all changes with detailed message

- [ ] 3. Client-side affiliate utilities
  - [x] 3.1 Create lib/affiliate.ts with URL utilities
    - getAffiliateIdFromURL, appendAffiliateId, getCurrentAffiliateId, isValidAffiliateId
    - Commit all changes with detailed message
    - _Requirements: 2.1, 2.3, 2.4, 2.5_

  - [ ]* 3.2 Write property test for URL affiliate parameter preservation
    - **Property 2: URL affiliate parameter preservation**
    - **Validates: Requirements 2.1**
    - Commit all changes with detailed message

  - [ ]* 3.3 Write property test for affiliate ID extraction from URL
    - **Property 8: Affiliate ID extraction from URL**
    - **Validates: Requirements 2.3**
    - Commit all changes with detailed message

  - [ ]* 3.4 Write property test for default affiliate attribution
    - **Property 3: Default affiliate attribution**
    - **Validates: Requirements 2.5**
    - Commit all changes with detailed message

  - [x] 3.2 Create custom Link component wrapper
    - Wrap Next.js Link to automatically append affiliate_id
    - Commit all changes with detailed message
    - _Requirements: 2.1, 2.2_

- [ ] 4. Admin API endpoints
  - [x] 4.1 Create /api/admin/affiliates endpoint
    - GET (list), POST (create) operations
    - Commit all changes with detailed message
    - _Requirements: 1.1, 1.2, 1.4_

  - [ ]* 4.2 Write property test for affiliate name validation
    - **Property 6: Affiliate name validation**
    - **Validates: Requirements 1.4**
    - Commit all changes with detailed message

  - [x] 4.3 Create /api/admin/affiliates/[id] endpoint
    - GET (details), PUT (update), DELETE operations
    - Commit all changes with detailed message
    - _Requirements: 1.3, 1.5_

  - [ ]* 4.4 Write property test for inactive affiliate rejection
    - **Property 5: Inactive affiliate rejection**
    - **Validates: Requirements 1.3**
    - Commit all changes with detailed message

  - [x] 4.5 Create /api/admin/affiliates/[id]/stats endpoint
    - Return affiliate statistics with event counts
    - Commit all changes with detailed message
    - _Requirements: 5.1, 5.2, 5.4, 5.5_

  - [ ]* 4.6 Write property test for event aggregation by affiliate
    - **Property 14: Event aggregation by affiliate**
    - **Validates: Requirements 5.1, 5.2**
    - Commit all changes with detailed message

- [ ] 5. Tracking event API
  - [x] 5.1 Create /api/tracking/event endpoint
    - POST operation to record tracking events
    - Validate affiliate_id, handle inactive affiliates
    - Commit all changes with detailed message
    - _Requirements: 2.4, 2.5, 3.1, 3.2, 4.1, 4.2_

  - [ ]* 5.2 Write property test for signup event creation
    - **Property 10: Signup event creation**
    - **Validates: Requirements 3.1**
    - Commit all changes with detailed message

  - [ ]* 5.3 Write property test for property contact event creation
    - **Property 12: Property contact event creation**
    - **Validates: Requirements 4.1**
    - Commit all changes with detailed message

- [x] 6. Integrate tracking into signup flow
  - Update /api/auth/register to call tracking event API
  - Extract affiliate_id from request and create signup event
  - Commit all changes with detailed message
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 7. Integrate tracking into property contact flow
  - Update ContactForm to include affiliate_id
  - Create property_contact tracking event on submission
  - Commit all changes with detailed message
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 8. Admin dashboard UI
  - [x] 8.1 Create affiliate management page
    - List affiliates, create/edit/deactivate functionality
    - Commit all changes with detailed message
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [x] 8.2 Create affiliate stats dashboard
    - Display event counts, breakdown by type, date filtering
    - Commit all changes with detailed message
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [-] 8.3 Create affiliate link generator
    - UI to generate trackable links for different landing pages
    - Commit all changes with detailed message
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 8.4 Write property test for affiliate link generation
    - **Property 19: Affiliate link generation**
    - **Validates: Requirements 7.2**
    - Commit all changes with detailed message

- [ ] 9. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise
  - Commit all changes with detailed message
