# Requirements Document

## Introduction

This document outlines the requirements for implementing a direct service purchase flow for individual services (CA, Legal, etc.) on the Bhavan.ai platform. Currently, customers are redirected to WhatsApp for all inquiries. This feature will enable customers to directly purchase individual services through an integrated payment flow, providing a more streamlined experience for service-based offerings while maintaining WhatsApp integration for property-related inquiries.

## Glossary

- **Service**: A professional offering such as CA (Chartered Accountant) services, legal services, or other individual professional services available on the platform
- **Customer**: A user who wishes to purchase a service from the platform
- **Service Provider**: A professional (CA, Lawyer, etc.) who delivers the purchased service
- **Service Purchase Flow**: The end-to-end process from service selection to payment completion and confirmation
- **Payment Gateway**: The third-party service that processes payment transactions
- **Service Request**: A record of a customer's service purchase including details and payment status
- **Confirmation Page**: The page displayed after successful payment showing next steps

## Requirements

### Requirement 1

**User Story:** As a customer, I want to browse available individual services on the home page, so that I can understand what professional services are offered.

#### Acceptance Criteria

1. WHEN a customer visits the home page THEN the system SHALL display a dedicated section for individual services with clear service categories
2. WHEN displaying service options THEN the system SHALL show service name, brief description, pricing, and a "Buy Now" call-to-action button for each service
3. WHEN a customer views service information THEN the system SHALL present pricing in a clear, transparent format with currency symbol
4. WHEN multiple service tiers exist for a service type THEN the system SHALL display all available tiers with their respective features and pricing

### Requirement 2

**User Story:** As a customer, I want to click on a "Buy Now" button for a specific service, so that I can initiate the purchase process.

#### Acceptance Criteria

1. WHEN a customer clicks the "Buy Now" button THEN the system SHALL navigate to a service details and purchase form page
2. WHEN navigating to the purchase page THEN the system SHALL preserve the selected service type and pricing information
3. WHEN the purchase page loads THEN the system SHALL display the selected service details prominently at the top of the page
4. WHEN a customer accesses the purchase page THEN the system SHALL track the service selection event for analytics purposes

### Requirement 3

**User Story:** As a customer, I want to provide my details and service requirements on a purchase form, so that the service provider understands my needs.

#### Acceptance Criteria

1. WHEN a customer views the purchase form THEN the system SHALL display input fields for full name, email address, phone number, and service-specific requirements
2. WHEN a customer enters information THEN the system SHALL validate email format, phone number format, and required field completion in real-time
3. WHEN a customer submits incomplete information THEN the system SHALL display clear error messages indicating which fields require attention
4. WHEN service-specific requirements are needed THEN the system SHALL provide a text area with minimum character requirements and helpful placeholder text
5. WHEN a customer provides valid information THEN the system SHALL enable the payment button

### Requirement 4

**User Story:** As a customer, I want to securely pay for the service using a payment gateway, so that I can complete my purchase.

#### Acceptance Criteria

1. WHEN a customer clicks the payment button THEN the system SHALL initiate a secure payment gateway integration
2. WHEN the payment gateway loads THEN the system SHALL display the correct service amount, service name, and customer details
3. WHEN a customer completes payment successfully THEN the payment gateway SHALL return a success status to the system
4. WHEN a payment fails THEN the payment gateway SHALL return an error status with failure reason to the system
5. WHEN payment processing occurs THEN the system SHALL maintain a secure connection using HTTPS protocol
6. WHEN the system integrates with payment gateways THEN the system SHALL use a pluggable architecture that allows switching between different payment providers through configuration
7. WHEN a new payment gateway is added THEN the system SHALL require only configuration changes without modifying core payment processing logic

### Requirement 5

**User Story:** As a customer, I want to receive immediate confirmation after successful payment, so that I know my purchase was completed.

#### Acceptance Criteria

1. WHEN payment succeeds THEN the system SHALL redirect the customer to a confirmation page within 3 seconds
2. WHEN the confirmation page displays THEN the system SHALL show a success message, order reference number, and service details
3. WHEN on the confirmation page THEN the system SHALL display a message stating "Our team will reach out to you shortly with more details"
4. WHEN the confirmation page loads THEN the system SHALL provide an estimated timeline for team contact
5. WHEN a customer views the confirmation THEN the system SHALL offer options to download receipt or return to home page

### Requirement 6

**User Story:** As a customer, I want to receive email confirmation of my service purchase, so that I have a record of my transaction.

#### Acceptance Criteria

1. WHEN payment succeeds THEN the system SHALL send a confirmation email to the customer's provided email address within 5 minutes
2. WHEN the confirmation email is sent THEN the system SHALL include order reference number, service details, amount paid, and next steps
3. WHEN the email is composed THEN the system SHALL use professional formatting with company branding
4. WHEN email delivery fails THEN the system SHALL retry sending up to 3 times with exponential backoff
5. WHEN all email attempts fail THEN the system SHALL log the failure and alert administrators

### Requirement 7

**User Story:** As a service provider, I want to receive notifications of new service purchases, so that I can prepare to contact the customer.

#### Acceptance Criteria

1. WHEN a customer completes payment THEN the system SHALL create a service request record in the database
2. WHEN a service request is created THEN the system SHALL send a notification to the assigned service provider or admin team
3. WHEN the notification is sent THEN the system SHALL include customer details, service type, requirements, and payment confirmation
4. WHEN multiple service providers exist for a service type THEN the system SHALL route the request based on availability or assignment rules
5. WHEN a service request is created THEN the system SHALL set the initial status to "pending_contact"

### Requirement 8

**User Story:** As an administrator, I want to view and manage all service purchase requests in a dashboard, so that I can ensure timely customer follow-up.

#### Acceptance Criteria

1. WHEN an administrator accesses the admin dashboard THEN the system SHALL display a service requests section
2. WHEN viewing service requests THEN the system SHALL show customer name, service type, purchase date, status, and assigned provider
3. WHEN an administrator clicks on a service request THEN the system SHALL display full details including customer requirements and contact information
4. WHEN an administrator updates a request status THEN the system SHALL save the change and update the timestamp
5. WHEN filtering service requests THEN the system SHALL support filtering by service type, status, date range, and assigned provider

### Requirement 9

**User Story:** As a customer, I want to track the status of my service request, so that I know when to expect contact from the team.

#### Acceptance Criteria

1. WHEN a customer completes a purchase THEN the system SHALL provide a unique tracking link or reference number
2. WHEN a customer accesses the tracking page with their reference number THEN the system SHALL display the current status of their service request
3. WHEN displaying status THEN the system SHALL show status labels such as "Payment Confirmed", "Team Assigned", "In Progress", "Completed"
4. WHEN the status changes THEN the system SHALL send an email notification to the customer
5. WHEN a customer views their request status THEN the system SHALL display estimated next steps and timeline

### Requirement 10

**User Story:** As a system administrator, I want the service purchase flow to integrate with existing affiliate tracking, so that we can attribute service sales to affiliates.

#### Acceptance Criteria

1. WHEN a customer arrives via an affiliate link THEN the system SHALL preserve affiliate tracking parameters throughout the purchase flow
2. WHEN a service purchase is completed THEN the system SHALL record the affiliate attribution in the service request record
3. WHEN affiliate attribution exists THEN the system SHALL trigger affiliate commission calculation based on service pricing
4. WHEN viewing affiliate statistics THEN the system SHALL include service purchases in the affiliate dashboard metrics
5. WHEN a service purchase is refunded THEN the system SHALL adjust affiliate commission accordingly

### Requirement 11

**User Story:** As a developer, I want the service purchase flow to handle errors gracefully, so that customers have a smooth experience even when issues occur.

#### Acceptance Criteria

1. WHEN a payment gateway error occurs THEN the system SHALL display a user-friendly error message with suggested next steps
2. WHEN a database error occurs during request creation THEN the system SHALL log the error and display a retry option to the customer
3. WHEN a network timeout occurs THEN the system SHALL implement automatic retry logic with exponential backoff
4. WHEN an unexpected error occurs THEN the system SHALL capture error details for debugging while showing a generic error message to users
5. WHEN errors are logged THEN the system SHALL include timestamp, user context, and stack trace for troubleshooting

### Requirement 12

**User Story:** As a customer, I want the service purchase flow to work seamlessly on mobile devices, so that I can purchase services from any device.

#### Acceptance Criteria

1. WHEN a customer accesses the purchase flow on a mobile device THEN the system SHALL display a responsive layout optimized for small screens
2. WHEN entering form data on mobile THEN the system SHALL use appropriate input types for email, phone, and text fields
3. WHEN the payment gateway loads on mobile THEN the system SHALL ensure the payment interface is mobile-optimized
4. WHEN navigating the purchase flow on mobile THEN the system SHALL maintain touch-friendly button sizes and spacing
5. WHEN viewing the confirmation page on mobile THEN the system SHALL display all information in a readable, scrollable format
