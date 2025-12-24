# Implementation Plan

## Phase 1: Database and Authentication Setup

- [x] 1. Set up Cloudflare D1 database and schema
  - Create D1 database using wrangler CLI
  - Write SQL schema for users, properties, and sessions tables
  - Add indexes for performance (email, status, broker_id, token)
  - Create seed script for initial admin user
  - Run migrations and seed admin account
  - Update wrangler.toml with database binding
  - Commit all changes with detailed message: "feat: set up D1 database schema and seed admin user"
  - _Requirements: 21.2, 26.1_

- [x] 2. Implement authentication system with Cloudflare Pages Functions
  - Create login API endpoint (/api/auth/login) with bcrypt password verification
  - Create registration API endpoint (/api/auth/register) for pending user accounts
  - Create session management endpoint (/api/auth/session) for session validation
  - Create logout endpoint (/api/auth/logout) to destroy sessions
  - Implement session creation with HTTP-only secure cookies
  - Add session expiration logic (24 hours)
  - Commit all changes with detailed message: "feat: implement authentication endpoints with session management"
  - _Requirements: 21.1, 21.2, 21.3, 21.4, 22.1, 22.2, 22.3, 28.1, 28.2, 28.3_

- [ ]* 2.1 Write property test for login authentication validation
  - **Property 24: Login authentication validation**
  - **Validates: Requirements 21.3**

- [ ]* 2.2 Write property test for failed login error display
  - **Property 25: Failed login error display**
  - **Validates: Requirements 21.4**

- [ ]* 2.3 Write property test for registration pending status
  - **Property 26: Registration pending status**
  - **Validates: Requirements 22.3, 22.4**

- [ ]* 2.4 Write property test for password hashing
  - **Property 36: Password hashing**
  - **Validates: Requirements 21.2**

- [x] 3. Create authentication middleware for route protection
  - Implement middleware in functions/_middleware.ts
  - Add session validation for /dashboard/* routes
  - Implement role-based access control (admin, broker, CA, lawyer)
  - Add redirect to /login for unauthenticated users
  - Return 403 Forbidden for unauthorized role access
  - Attach user context to requests for downstream use
  - Commit all changes with detailed message: "feat: add authentication middleware with role-based access control"
  - _Requirements: 21.5, 27.5, 28.4, 28.5_

- [ ]* 3.1 Write property test for unauthorized access prevention
  - **Property 33: Unauthorized access prevention**
  - **Validates: Requirements 28.4**

- [ ]* 3.2 Write property test for role permission enforcement
  - **Property 34: Role permission enforcement**
  - **Validates: Requirements 27.5, 28.5**

- [ ]* 3.3 Write property test for session expiration
  - **Property 35: Session expiration**
  - **Validates: Requirements 28.2**

## Phase 2: Authentication UI Components

- [x] 4. Build login and registration pages
  - Create LoginForm component with email and password inputs
  - Create RegistrationForm component with name, email, phone, and user type selector
  - Add client-side validation for both forms
  - Create /login page with LoginForm
  - Create /signup page with RegistrationForm (not linked from marketing site)
  - Implement error display and loading states
  - Add "Thank you" message after registration
  - Commit all changes with detailed message: "feat: create login and registration UI with forms"
  - _Requirements: 21.1, 21.4, 22.1, 22.2, 22.4_

- [x] 5. Implement role-based dashboard routing
  - Create dashboard layout component with navigation
  - Create /dashboard/admin route for admin users
  - Create /dashboard/broker route for broker users
  - Create /dashboard/ca route for CA users
  - Create /dashboard/lawyer route for lawyer users
  - Add role-based redirect logic after login
  - Add logout button in dashboard header
  - Commit all changes with detailed message: "feat: implement role-based dashboard routing and layout"
  - _Requirements: 21.3, 27.1, 27.2, 27.3_

- [ ]* 5.1 Write property test for role-based dashboard routing
  - **Property 32: Role-based dashboard routing**
  - **Validates: Requirements 21.3, 27.1, 27.2**

## Phase 3: Property Management System

- [-] 6. Create property management API endpoints
  - Create /api/broker/properties endpoint for broker CRUD operations
  - Create /api/admin/properties endpoint for admin to view all properties
  - Create /api/admin/properties/[id]/approve endpoint for property approval
  - Create /api/admin/properties/[id]/reject endpoint for property rejection
  - Create /api/properties/public endpoint for approved properties only
  - Implement property status transitions (pending → approved/rejected)
  - Add database helper functions for property queries
  - Commit all changes with detailed message: "feat: implement property management API endpoints"
  - _Requirements: 23.1, 23.2, 23.3, 23.4, 24.1, 24.2, 24.3, 25.1, 25.2, 25.3_

- [ ]* 6.1 Write property test for broker property creation pending status
  - **Property 27: Broker property creation pending status**
  - **Validates: Requirements 23.2**

- [ ]* 6.2 Write property test for property approval visibility
  - **Property 28: Property approval visibility**
  - **Validates: Requirements 24.4**

- [ ]* 6.3 Write property test for property rejection exclusion
  - **Property 29: Property rejection exclusion**
  - **Validates: Requirements 24.5**

- [ ]* 6.4 Write property test for admin property access
  - **Property 30: Admin property access**
  - **Validates: Requirements 25.2**

- [ ] 7. Set up R2 image storage for property photos
  - Create R2 bucket for property images using wrangler
  - Create /api/upload endpoint for image uploads
  - Implement image validation (size, format)
  - Generate unique filenames for uploaded images
  - Return R2 public URLs after upload
  - Add R2 binding to wrangler.toml
  - Commit all changes with detailed message: "feat: implement R2 image upload for property photos"
  - _Requirements: 23.1, 23.2_

- [ ] 8. Build broker dashboard with property management
  - Create PropertyForm component for add/edit property
  - Add image upload UI with preview
  - Create property list table showing broker's properties
  - Add edit and delete actions for each property
  - Add "Submit for Approval" button
  - Display property status (pending, approved, rejected)
  - Show rejection reason if applicable
  - Commit all changes with detailed message: "feat: create broker dashboard with property management UI"
  - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5_

## Phase 4: Admin Dashboard

- [ ] 9. Build admin user management interface
  - Create UserManagementTable component
  - Display all users with status (pending, active, inactive)
  - Add approve/reject actions for pending users
  - Add "Create User" button and modal form
  - Implement password reset functionality
  - Add user deactivation action
  - Create /api/admin/users endpoints for all operations
  - Commit all changes with detailed message: "feat: implement admin user management interface"
  - _Requirements: 26.1, 26.2, 26.3, 26.4, 26.5_

- [ ]* 9.1 Write property test for admin user approval activation
  - **Property 31: Admin user approval activation**
  - **Validates: Requirements 26.2**

- [ ] 10. Build admin property approval interface
  - Create PropertyApprovalTable component
  - Display all pending properties with details
  - Add property preview with images
  - Implement approve action
  - Implement reject action with reason input
  - Add filter by broker
  - Show broker name for each property
  - Commit all changes with detailed message: "feat: create admin property approval interface"
  - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 25.4_

- [ ] 11. Build admin all-properties management view
  - Create comprehensive property table for admins
  - Display all properties regardless of status
  - Add edit functionality for any property
  - Add delete functionality for any property
  - Show broker information for each property
  - Add filters (status, broker, date)
  - Commit all changes with detailed message: "feat: implement admin all-properties management view"
  - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5_

## Phase 5: CA and Lawyer Dashboards

- [ ] 12. Create placeholder dashboards for CA and Lawyer roles
  - Build CADashboard component with "Coming Soon" message
  - Build LawyerDashboard component with "Coming Soon" message
  - Add placeholder sections for future functionality
  - Ensure proper routing and access control
  - Commit all changes with detailed message: "feat: add placeholder dashboards for CA and Lawyer roles"
  - _Requirements: 27.1, 27.2, 27.3, 27.4_

## Phase 6: Public Property Listings

- [ ] 13. Update public property listings page
  - Modify /properties page to fetch only approved properties
  - Update PropertyCard component with new data structure
  - Ensure property images load from R2
  - Add proper error handling for missing data
  - Maintain existing filtering functionality
  - Commit all changes with detailed message: "feat: update public property listings to show only approved properties"
  - _Requirements: 24.4, 24.5_

- [ ] 14. Update property detail page
  - Modify /properties/[id] page to fetch from new API
  - Display property data from D1 database
  - Load images from R2 storage
  - Maintain WhatsApp contact functionality
  - Add proper 404 handling for non-existent properties
  - Commit all changes with detailed message: "feat: update property detail page to use D1 and R2"
  - _Requirements: 24.4_

## Phase 7: Testing and Deployment

- [ ] 15. Write unit tests for authentication and property management
  - Test password hashing and verification
  - Test session creation and validation
  - Test role-based access control logic
  - Test property status transitions
  - Test database helper functions
  - Configure Vitest and fast-check for property-based testing
  - Commit all changes with detailed message: "test: add unit tests for auth and property management"
  - _Requirements: 17.1, 17.2, 17.3_

- [ ] 16. Deploy to Cloudflare Pages
  - Build Next.js application
  - Deploy to Cloudflare Pages using wrangler
  - Verify D1 database connection
  - Verify R2 image storage
  - Test authentication flow end-to-end
  - Test property management workflow
  - Verify public property listings work correctly
  - Commit all changes with detailed message: "deploy: initial deployment to Cloudflare Pages with D1 and R2"
  - _Requirements: All_

- [ ] 17. Final testing and documentation
  - Test all user roles (admin, broker, CA, lawyer)
  - Test property approval workflow end-to-end
  - Test user registration and approval workflow
  - Update README with deployment instructions
  - Document environment variables and secrets
  - Create admin user guide
  - Commit all changes with detailed message: "docs: add deployment guide and user documentation"
  - _Requirements: 16.1, 16.2, 16.3, 16.4_
