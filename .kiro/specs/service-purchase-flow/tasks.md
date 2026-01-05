# Implementation Plan

- [x] 1. Database schema and migrations
  - Create migration files for services, service_tiers, service_requests, service_request_status_history, and payment_gateway_config tables
  - Add necessary indexes for performance
  - Create seed data for initial services (CA, Legal)
  - Commit all changes with detailed message
  - _Requirements: 1.1, 7.1, 8.1_

- [x] 2. Payment gateway adapter infrastructure
  - Create PaymentGatewayAdapter interface
  - Implement PaymentGatewayFactory
  - Implement RazorpayAdapter (or chosen provider)
  - Add payment gateway configuration management
  - Commit all changes with detailed message
  - _Requirements: 4.1, 4.6, 4.7_

- [x] 3. Core API endpoints for service purchase flow
- [x] 3.1 Implement POST /api/services/purchase endpoint
  - Handle service purchase request
  - Create payment intent via gateway adapter
  - Preserve affiliate tracking
  - Commit all changes with detailed message
  - _Requirements: 2.1, 2.2, 4.1, 10.1_

- [x] 3.2 Implement POST /api/services/payment/webhook endpoint
  - Verify webhook signatures
  - Process payment success/failure
  - Create service request record
  - Trigger notifications
  - Commit all changes with detailed message
  - _Requirements: 4.3, 4.4, 7.1, 7.2_

- [x] 3.3 Implement GET /api/services/requests/:referenceNumber endpoint
  - Fetch service request by reference number
  - Return status timeline
  - Commit all changes with detailed message
  - _Requirements: 9.2, 9.3, 9.5_

- [x] 4. Email and notification services
  - Create email service with confirmation email template
  - Implement retry logic with exponential backoff
  - Create provider notification service
  - Implement status update email notifications
  - Commit all changes with detailed message
  - _Requirements: 6.1, 6.2, 6.4, 7.2, 7.3, 9.4_

- [x] 5. Frontend: Services section on home page
  - Create ServicesSection component
  - Create ServiceCard component with pricing display
  - Implement "Buy Now" button navigation
  - Add analytics tracking for service selection
  - Commit all changes with detailed message
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.4_

- [x] 6. Frontend: Service purchase page
  - Create ServicePurchaseForm component
  - Implement form validation (email, phone, required fields)
  - Create PaymentButton component
  - Integrate with payment gateway adapter
  - Handle payment success/failure
  - Commit all changes with detailed message
  - _Requirements: 2.2, 2.3, 3.1, 3.2, 3.3, 3.5, 4.1, 4.2_

- [x] 7. Frontend: Confirmation and tracking pages
  - Create ConfirmationPage component
  - Create ServiceTrackingPage component
  - Implement status display with timeline
  - Add receipt download functionality
  - Commit all changes with detailed message
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 9.1, 9.2, 9.3, 9.5_

- [ ] 8. Admin dashboard for service requests
- [x] 8.1 Implement GET /api/admin/services/requests endpoint
  - Support filtering by service type, status, date range, assigned provider
  - Implement pagination
  - Commit all changes with detailed message
  - _Requirements: 8.1, 8.2, 8.5_

- [x] 8.2 Implement PATCH /api/admin/services/requests/:id endpoint
  - Handle status updates
  - Handle provider assignment
  - Create status history records
  - Trigger status change notifications
  - Commit all changes with detailed message
  - _Requirements: 8.4, 9.4_

- [ ] 8.3 Create AdminServiceRequestsTable component
  - Display service requests with filtering
  - Implement status update UI
  - Implement provider assignment UI
  - Add detail view modal
  - Commit all changes with detailed message
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 9. Affiliate integration
  - Update affiliate tracking to support service purchases
  - Implement commission calculation for services
  - Update affiliate dashboard to show service metrics
  - Handle commission adjustments on refunds
  - Commit all changes with detailed message
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 10. Error handling and resilience
  - Implement error handling middleware
  - Add retry logic for network timeouts
  - Create user-friendly error messages
  - Implement error logging with context
  - Commit all changes with detailed message
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 11. Mobile responsiveness
  - Ensure all forms use appropriate input types
  - Test purchase flow on mobile devices
  - Verify touch-friendly button sizes
  - Commit all changes with detailed message
  - _Requirements: 12.1, 12.2, 12.4, 12.5_

- [ ] 12. Testing and validation
- [ ]* 12.1 Write property tests for payment gateway adapter
  - **Property 10: Payment gateway adapter interface compliance**
  - **Validates: Requirements 4.6**

- [ ]* 12.2 Write property tests for form validation
  - **Property 6: Form validation correctness**
  - **Validates: Requirements 3.2**

- [ ]* 12.3 Write property tests for affiliate tracking
  - **Property 28: Affiliate parameter preservation**
  - **Property 29: Affiliate attribution recording**
  - **Validates: Requirements 10.1, 10.2**

- [ ]* 12.4 Write property tests for error handling
  - **Property 34: Database error handling**
  - **Property 35: Network timeout retry logic**
  - **Validates: Requirements 11.2, 11.3**

- [ ]* 12.5 Write unit tests for core functionality
  - Test service request creation
  - Test email sending and retry logic
  - Test reference number generation
  - Test status updates

- [ ]* 12.6 Write integration tests
  - Test complete purchase flow
  - Test webhook processing
  - Test admin operations

- [ ] 13. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise
  - Verify all features work end-to-end
  - Test with real payment gateway in test mode
  - Commit all final changes with detailed message
