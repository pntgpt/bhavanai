# Implementation Plan

- [x] 1. Initialize Next.js project with TypeScript and Tailwind CSS
  - Create Next.js 14+ project with App Router and static export configuration
  - Install and configure TypeScript, Tailwind CSS, and Lucide React icons
  - Set up project structure: components, lib, types, public directories
  - Configure next.config.js for static export and image optimization
  - Create tailwind.config.js with design system tokens (colors, fonts, spacing)
  - Set up .env.example with all required environment variables
  - Commit all changes with detailed message
  - _Requirements: 12.1, 16.3, 18.2_

- [x] 2. Implement core layout components and design system
  - Create root layout with SEO metadata structure and font configuration
  - Build Header component with navigation, mobile menu, and sticky behavior
  - Build Footer component with links, social icons, and newsletter form
  - Create reusable UI components: Button, Card, Modal with all variants
  - Implement design system utilities for typography and spacing
  - Commit all changes with detailed message
  - _Requirements: 1.3, 11.1, 11.2, 11.3, 18.1, 18.2, 18.3_

- [x] 3. Build homepage with Hero and How It Works sections
  - Create Hero section with headline, subheadline, and dual CTAs
  - Implement smooth scroll functionality for "How it works" link
  - Build HowItWorks section with 4 step cards, icons, and flow diagram
  - Add "See eligibility" CTA with navigation
  - Implement responsive layouts for mobile and desktop
  - Commit all changes with detailed message
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 3.1 Write property test for step card completeness
  - **Property 1: Step card completeness**
  - **Validates: Requirements 2.2**

- [x] 4. Implement Features, Marketplace, Pricing, and Market sections
  - Create Features section with grid of feature cards (KYC, SPV, financing, marketplace, security)
  - Build Marketplace section with exit process explanation, fee structure, and listing card mockup
  - Create Pricing section with platform fees, marketplace fees, and future fees
  - Build Market & Validation section with statistics and traction metrics
  - Commit all changes with detailed message
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.5, 8.1, 8.2, 8.3, 8.5_

- [ ]* 4.1 Write property test for market data source attribution
  - **Property 5: Market data source attribution**
  - **Validates: Requirements 8.3**

- [x] 5. Build Roadmap and Team sections
  - Create Roadmap section with 6-month timeline visualization and milestones
  - Implement current phase indicator
  - Build Team section with founder cards (photos, bios, credentials, LinkedIn links)
  - Add placeholder images for team photos
  - Commit all changes with detailed message
  - _Requirements: 9.1, 9.2, 9.4, 9.5, 10.1, 10.2, 10.4, 19.2_

- [ ]* 5.1 Write property test for milestone descriptions
  - **Property 6: Milestone descriptions**
  - **Validates: Requirements 9.4**

- [ ]* 5.2 Write property test for team member credentials
  - **Property 7: Team member credentials**
  - **Validates: Requirements 10.2**

- [x] 6. Create form validation utilities and submission logic
  - Implement validation functions for email, phone, required fields, numeric inputs
  - Create UTM parameter extraction utility
  - Build form submission handler with error handling and retry logic
  - Create form data formatting utilities for API payloads
  - Commit all changes with detailed message
  - _Requirements: 4.2, 5.3, 14.4, 20.2_

- [ ]* 6.1 Write property test for UTM parameter preservation
  - **Property 2: UTM parameter preservation**
  - **Validates: Requirements 4.2, 14.4**

- [ ]* 6.2 Write property test for form data transmission
  - **Property 3: Form data transmission**
  - **Validates: Requirements 4.3, 5.4, 20.2**

- [ ]* 6.3 Write property test for form validation blocking
  - **Property 4: Form validation blocking**
  - **Validates: Requirements 5.3**

- [x] 7. Build Eligibility Checker form and page
  - Create eligibility form component with all fields (city, age, rent, salary, co-owner count, email, phone)
  - Implement client-side validation with inline error messages
  - Add form submission with UTM capture and success/error feedback
  - Create eligibility page with form and explanatory content
  - Commit all changes with detailed message
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 8. Build Signup/Early Access form and page
  - Create signup form component with all fields (name, email, phone, city, rent, living type, consent)
  - Add GDPR/India privacy notice with policy links
  - Implement validation and submission with success/error feedback
  - Create signup page and modal version for hero CTA
  - Commit all changes with detailed message
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 9. Create Contact form and legal pages
  - Build Contact form component with name, email, subject, message fields
  - Add contact form to Team section
  - Create Privacy Policy, Terms of Service, and FAQ pages with content
  - Add downloadable PDFs (Press Kit, Investor Deck) to public folder
  - Commit all changes with detailed message
  - _Requirements: 10.3, 10.5, 11.1, 11.4_

- [x] 10. Implement Google Analytics 4 integration
  - Create analytics utility with GA4 initialization
  - Add custom event tracking for CTA clicks
  - Implement form conversion tracking
  - Add UTM parameter persistence in session storage
  - Wrap analytics in try-catch for graceful failure
  - Commit all changes with detailed message
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ]* 10.1 Write property test for CTA analytics tracking
  - **Property 14: CTA analytics tracking**
  - **Validates: Requirements 14.2**

- [ ]* 10.2 Write property test for form conversion tracking
  - **Property 15: Form conversion tracking**
  - **Validates: Requirements 14.3**

- [ ]* 10.3 Write property test for UTM parameter persistence
  - **Property 14: UTM parameter preservation (already covered in 6.1)**
  - **Validates: Requirements 14.4**

- [x] 11. Implement SEO optimization and metadata
  - Create SEO utility for generating page metadata
  - Add unique title, description, and OG tags to all pages
  - Implement structured data (Organization and FAQ schemas)
  - Add canonical URLs and proper heading hierarchy
  - Generate robots.txt and sitemap.xml
  - Commit all changes with detailed message
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ]* 11.1 Write property test for page metadata uniqueness
  - **Property 16: Page metadata uniqueness**
  - **Validates: Requirements 15.1**

- [ ]* 11.2 Write property test for Open Graph tag presence
  - **Property 17: Open Graph tag presence**
  - **Validates: Requirements 15.2**

- [-] 12. Implement accessibility features
  - Add keyboard navigation support with visible focus indicators
  - Implement focus trap for modals
  - Add descriptive alt text to all images
  - Verify color contrast ratios meet WCAG AA (4.5:1)
  - Add ARIA labels and roles to interactive elements
  - Commit all changes with detailed message
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ]* 12.1 Write property test for keyboard navigation accessibility
  - **Property 10: Keyboard navigation accessibility**
  - **Validates: Requirements 13.2**

- [ ]* 12.2 Write property test for image alt text presence
  - **Property 11: Image alt text presence**
  - **Validates: Requirements 13.3**

- [ ]* 12.3 Write property test for color contrast compliance
  - **Property 12: Color contrast compliance**
  - **Validates: Requirements 13.4**

- [ ]* 12.4 Write property test for ARIA attribute presence
  - **Property 13: ARIA attribute presence**
  - **Validates: Requirements 13.5**

- [ ] 13. Optimize performance and implement lazy loading
  - Implement lazy loading for below-the-fold images
  - Optimize images with Next.js Image component
  - Add responsive image breakpoints for mobile/desktop
  - Minimize bundle size and implement code splitting
  - Configure caching headers in next.config.js
  - Commit all changes with detailed message
  - _Requirements: 12.2, 12.3, 12.4, 12.5_

- [ ]* 13.1 Write property test for responsive layout adaptation
  - **Property 8: Responsive layout adaptation**
  - **Validates: Requirements 12.3**

- [ ]* 13.2 Write property test for image lazy loading
  - **Property 9: Image lazy loading**
  - **Validates: Requirements 12.4**

- [ ] 14. Create serverless form submission endpoint
  - Create API route for form submissions (Vercel/Netlify function)
  - Implement payload validation and error handling
  - Add integration examples for Netlify Forms, Formspree, Zapier, HubSpot
  - Document endpoint configuration in README
  - Test form submissions with mock endpoint
  - Commit all changes with detailed message
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

- [ ]* 14.1 Write property test for serverless payload validation
  - **Property 3: Form data transmission (already covered in 6.2)**
  - **Validates: Requirements 20.3**

- [ ]* 14.2 Write property test for error message user-friendliness
  - **Property 23: Error message user-friendliness**
  - **Validates: Requirements 20.5**

- [ ] 15. Create comprehensive documentation
  - Write README with project overview, build instructions, and deployment steps
  - Document environment variable configuration
  - Create style guide documenting colors, fonts, spacing, and components
  - Add code comments explaining architectural decisions
  - Document form integration switching (sandbox to production)
  - Commit all changes with detailed message
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [ ]* 15.1 Write property test for architectural comment presence
  - **Property 18: Architectural comment presence**
  - **Validates: Requirements 16.4**

- [ ] 16. Set up testing infrastructure and write unit tests
  - Configure Vitest and React Testing Library
  - Configure fast-check for property-based testing
  - Write unit tests for form validation functions
  - Write unit tests for utility functions (UTM extraction, data formatting)
  - Write unit tests for component rendering (Hero, Forms, CTAs)
  - Configure test scripts in package.json
  - Commit all changes with detailed message
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

- [ ]* 16.1 Write property test for form data formatting validation
  - **Property 19: Form data formatting validation**
  - **Validates: Requirements 17.3**

- [ ] 17. Final testing, optimization, and deployment preparation
  - Run full test suite and ensure all tests pass
  - Run Lighthouse audit and optimize to achieve score > 90
  - Run accessibility audit with axe-core
  - Test on multiple devices and browsers
  - Build static export and verify all pages render correctly
  - Create deployment guide for Vercel/Netlify
  - Commit all changes with detailed message
  - _Requirements: 12.2, 13.1, 17.5_

- [ ]* 17.1 Write property test for typography consistency
  - **Property 20: Typography consistency**
  - **Validates: Requirements 18.1**

- [ ]* 17.2 Write property test for spacing scale consistency
  - **Property 21: Spacing scale consistency**
  - **Validates: Requirements 18.3**

- [ ]* 17.3 Write property test for icon set consistency
  - **Property 22: Icon set consistency**
  - **Validates: Requirements 19.3**
