# Requirements Document

## Introduction

This document outlines the requirements for implementing an affiliate tracking system in the Bhavan.ai platform. The system will enable administrators to create and manage affiliate IDs, track affiliate-driven user actions (signups, property contacts, and future online payments), and provide visibility into affiliate performance.

## Glossary

- **Affiliate ID**: A unique identifier assigned to an affiliate partner for tracking purposes
- **Affiliate**: An external partner who promotes Bhavan.ai and drives traffic/conversions
- **Tracking Event**: A user action (signup, property contact, payment) associated with an affiliate
- **System**: The Bhavan.ai platform
- **Admin**: A user with administrative privileges in the System
- **Visitor**: A user who accesses the System via an affiliate link
- **URL Parameter**: A query string parameter appended to URLs (e.g., ?affiliate_id=ABC123)

## Requirements

### Requirement 1

**User Story:** As an admin, I want to create and manage affiliate IDs, so that I can onboard new affiliate partners and track their performance.

#### Acceptance Criteria

1. WHEN an admin creates a new affiliate ID, THE System SHALL generate a unique identifier and store it in the database
2. WHEN an admin views the affiliate management page, THE System SHALL display all existing affiliate IDs with their metadata
3. WHEN an admin deactivates an affiliate ID, THE System SHALL prevent new tracking events from being associated with that affiliate
4. WHERE an affiliate ID is created, THE System SHALL require a name and optional description
5. WHEN an admin edits an affiliate, THE System SHALL update the affiliate metadata while preserving the unique identifier

### Requirement 2

**User Story:** As a visitor, I want my affiliate association to be tracked automatically when I access the site via an affiliate link, so that the affiliate receives proper credit for my actions.

#### Acceptance Criteria

1. WHEN a visitor accesses the System with an affiliate_id URL parameter, THE System SHALL preserve the affiliate_id parameter in all internal navigation links
2. WHEN a visitor navigates to a new page within the System, THE System SHALL append the affiliate_id parameter to the destination URL
3. WHEN a visitor performs a tracked action, THE System SHALL read the affiliate_id from the current URL parameter
4. IF an affiliate_id URL parameter is invalid or inactive, THEN THE System SHALL ignore the parameter and proceed without affiliate tracking
5. WHEN a visitor accesses the System without an affiliate_id parameter, THE System SHALL associate all tracking events with a generic affiliate ID "NO_AFFILIATE_ID"

### Requirement 3

**User Story:** As the system, I want to track signup events with affiliate attribution, so that affiliates receive credit for user registrations they drive.

#### Acceptance Criteria

1. WHEN a visitor with an affiliate ID completes a signup, THE System SHALL create a tracking event record linking the user to the affiliate
2. WHEN a signup tracking event is created, THE System SHALL store the user ID, affiliate ID, event type, and timestamp
3. WHEN a user signs up without an affiliate ID, THE System SHALL create the user account without affiliate attribution
4. WHEN a signup event is recorded, THE System SHALL maintain data integrity between users and affiliates tables

### Requirement 4

**User Story:** As the system, I want to track property contact events with affiliate attribution, so that affiliates receive credit for leads they generate.

#### Acceptance Criteria

1. WHEN a visitor with an affiliate ID contacts a property, THE System SHALL create a tracking event record linking the contact to the affiliate
2. WHEN a property contact tracking event is created, THE System SHALL store the property ID, affiliate ID, event type, and timestamp
3. WHEN a property contact event is created, THE System SHALL store the user ID if the visitor is authenticated
4. WHEN a visitor contacts a property without an affiliate ID, THE System SHALL process the contact without affiliate attribution

### Requirement 5

**User Story:** As an admin, I want to view affiliate performance metrics, so that I can evaluate the effectiveness of each affiliate partnership.

#### Acceptance Criteria

1. WHEN an admin views the affiliate dashboard, THE System SHALL display total signups per affiliate
2. WHEN an admin views the affiliate dashboard, THE System SHALL display total property contacts per affiliate
3. WHEN an admin views the affiliate dashboard, THE System SHALL display events in chronological order with filtering options
4. WHEN an admin views affiliate details, THE System SHALL show a breakdown of events by type and date range
5. WHERE date range filters are applied, THE System SHALL return only events within the specified period

### Requirement 6

**User Story:** As a developer, I want the affiliate tracking system to be extensible for future payment tracking, so that we can easily add payment attribution without major refactoring.

#### Acceptance Criteria

1. WHEN the tracking events table is designed, THE System SHALL support multiple event types through a type field
2. WHEN a new event type is added, THE System SHALL accommodate it without schema changes to core tables
3. WHEN tracking events are stored, THE System SHALL include optional metadata fields for future extensibility
4. WHEN querying tracking events, THE System SHALL support filtering by event type

### Requirement 7

**User Story:** As an admin, I want to generate affiliate links, so that I can easily share trackable URLs with affiliate partners.

#### Acceptance Criteria

1. WHEN an admin views an affiliate's details, THE System SHALL display a link generator tool
2. WHEN an admin generates an affiliate link, THE System SHALL append the affiliate_id parameter to the base URL
3. WHEN an admin generates an affiliate link, THE System SHALL provide options for different landing pages
4. WHEN an affiliate link is generated, THE System SHALL display the complete URL for copying
