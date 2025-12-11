# Design Document

## Overview

The Bhavan.ai marketing website is a static, performance-optimized lead-generation platform built with Next.js 14+ using static site generation (SSG). The architecture prioritizes fast load times, accessibility, SEO optimization, and seamless lead capture through serverless form integrations.

The site will be deployed as a collection of pre-rendered HTML pages with minimal client-side JavaScript, ensuring excellent performance scores and broad compatibility. All dynamic functionality (form submissions, analytics) will be handled through client-side JavaScript that progressively enhances the static foundation.

## Architecture

### Technology Stack

- **Framework**: Next.js 14+ with App Router and static export (`output: 'export'`)
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for utility-first styling with custom design tokens
- **Forms**: Client-side validation with serverless backend integration (Vercel Functions or Netlify Functions)
- **Analytics**: Google Analytics 4 (GA4) with custom event tracking
- **Image Optimization**: Next.js Image component with static export optimization
- **Icons**: Lucide React for consistent, lightweight iconography
- **Testing**: Vitest for unit tests, React Testing Library for component tests
- **Deployment**: Vercel or Netlify with automatic deployments from Git

### Architecture Principles

1. **Static-First**: All pages pre-rendered at build time for maximum performance
2. **Progressive Enhancement**: Core content accessible without JavaScript, enhanced features require JS
3. **Mobile-First**: Responsive design starting from mobile breakpoints
4. **Accessibility-First**: WCAG AA compliance built into every component
5. **Performance-First**: Lighthouse score > 90 through optimization and lazy loading
6. **SEO-First**: Semantic HTML, meta tags, structured data on every page

### Directory Structure

```
bhavan-marketing-site/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Homepage
│   │   ├── layout.tsx         # Root layout with SEO
│   │   ├── eligibility/       # Eligibility checker page
│   │   ├── signup/            # Early access signup page
│   │   ├── marketplace/       # Marketplace info page
│   │   ├── pricing/           # Pricing page
│   │   ├── roadmap/           # Roadmap page
│   │   ├── team/              # Team page
│   │   ├── privacy/           # Privacy policy page
│   │   ├── terms/             # Terms of service page
│   │   └── faq/               # FAQ page
│   ├── components/            # React components
│   │   ├── layout/           # Layout components (Header, Footer)
│   │   ├── sections/         # Page sections (Hero, HowItWorks, etc.)
│   │   ├── forms/            # Form components
│   │   ├── ui/               # Reusable UI components
│   │   └── analytics/        # Analytics wrapper components
│   ├── lib/                   # Utility functions
│   │   ├── analytics.ts      # GA4 integration
│   │   ├── forms.ts          # Form submission logic
│   │   ├── validation.ts     # Form validation
│   │   └── seo.ts            # SEO utilities
│   ├── types/                 # TypeScript type definitions
│   ├── styles/                # Global styles and Tailwind config
│   └── public/                # Static assets
│       ├── images/           # Images and placeholders
│       ├── icons/            # Favicons
│       └── downloads/        # PDFs (pitch deck, press kit)
├── tests/                     # Test files
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

## Components and Interfaces

### Core Components

#### 1. Layout Components

**Header Component**
- Sticky navigation bar with logo and main navigation links
- Mobile hamburger menu with slide-out drawer
- CTA button in header ("Get Early Access")
- Transparent on hero, solid background on scroll

```typescript
interface HeaderProps {
  transparent?: boolean;
}
```

**Footer Component**
- Multi-column layout: Company, Product, Legal, Social
- Newsletter signup form
- Links to all legal pages and downloads
- Social media icons

```typescript
interface FooterProps {
  onNewsletterSubmit: (email: string) => Promise<void>;
}
```

#### 2. Section Components

**Hero Section**
- Full-viewport height with background image/gradient
- Headline, subheadline, and dual CTAs
- Scroll indicator animation

```typescript
interface HeroProps {
  headline: string;
  subheadline: string;
  primaryCTA: CTAButton;
  secondaryCTA: CTAButton;
  backgroundImage?: string;
}

interface CTAButton {
  text: string;
  onClick: () => void;
  variant: 'primary' | 'secondary';
}
```

**HowItWorks Section**
- Four-step process with icons and descriptions
- Visual flow diagram with connecting lines
- "See Eligibility" CTA at bottom

```typescript
interface HowItWorksProps {
  steps: ProcessStep[];
}

interface ProcessStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType;
}
```

**Features Section**
- Grid layout of feature cards
- Icon, title, and description for each feature
- Hover effects for interactivity

```typescript
interface FeaturesProps {
  features: Feature[];
}

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType;
}
```

**Marketplace Section**
- Explanation of exit process
- Mockup of listing card
- Fee structure table

```typescript
interface MarketplaceProps {
  exitProcess: string[];
  fees: FeeStructure;
  mockListing: ListingCard;
}

interface ListingCard {
  shares: number;
  pricePerShare: number;
  seller: string;
  propertyAddress: string;
}

interface FeeStructure {
  platformFee: string;
  transactionFee: string;
}
```

**Roadmap Section**
- Timeline visualization with milestones
- Current phase indicator
- Expandable milestone details

```typescript
interface RoadmapProps {
  milestones: Milestone[];
  currentPhase: number;
}

interface Milestone {
  id: number;
  title: string;
  description: string;
  quarter: string;
  status: 'completed' | 'in-progress' | 'planned';
}
```

**Team Section**
- Grid of team member cards
- Photo, name, title, bio
- LinkedIn links

```typescript
interface TeamProps {
  members: TeamMember[];
}

interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  photo: string;
  linkedIn?: string;
}
```

#### 3. Form Components

**EligibilityForm Component**
- Multi-field form with validation
- City dropdown, age range selector, salary/rent inputs
- Co-owner count selector (2-5)
- Email and phone inputs
- Submit handler with UTM capture

```typescript
interface EligibilityFormProps {
  onSubmit: (data: EligibilityData) => Promise<void>;
}

interface EligibilityData {
  city: string;
  ageRange: string;
  monthlyRent: number;
  monthlySalary: number;
  coOwnerCount: number;
  email: string;
  phone: string;
  utmParams?: UTMParams;
}

interface UTMParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}
```

**SignupForm Component**
- Full registration form with all required fields
- Consent checkboxes with links to policies
- Privacy notice for GDPR/India compliance
- Multi-step form option for better UX

```typescript
interface SignupFormProps {
  onSubmit: (data: SignupData) => Promise<void>;
}

interface SignupData {
  name: string;
  email: string;
  phone: string;
  city: string;
  currentRent: number;
  livingType: 'solo' | 'shared' | 'coliving' | 'family';
  privacyConsent: boolean;
  marketingConsent: boolean;
}
```

**ContactForm Component**
- Simple contact form for general inquiries
- Name, email, subject, message fields
- Submit to serverless function

```typescript
interface ContactFormProps {
  onSubmit: (data: ContactData) => Promise<void>;
}

interface ContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
}
```

**NewsletterForm Component**
- Single email input with submit button
- Inline validation
- Success/error states

```typescript
interface NewsletterFormProps {
  onSubmit: (email: string) => Promise<void>;
  inline?: boolean;
}
```

#### 4. UI Components

**Button Component**
- Variants: primary, secondary, outline, ghost
- Sizes: small, medium, large
- Loading and disabled states
- Accessible with proper ARIA labels

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
}
```

**Modal Component**
- Accessible dialog with focus trap
- Close on ESC key or backdrop click
- Animated entrance/exit
- Used for signup form

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
```

**Card Component**
- Reusable card container
- Variants for different sections
- Hover effects

```typescript
interface CardProps {
  variant?: 'default' | 'feature' | 'team' | 'listing';
  children: React.ReactNode;
  className?: string;
}
```

### API Interfaces

#### Form Submission Endpoint

```typescript
// POST /api/submit-form
interface FormSubmissionRequest {
  formType: 'eligibility' | 'signup' | 'contact' | 'newsletter';
  data: EligibilityData | SignupData | ContactData | { email: string };
  timestamp: string;
  utmParams?: UTMParams;
}

interface FormSubmissionResponse {
  success: boolean;
  message: string;
  leadId?: string;
}
```

#### Analytics Events

```typescript
interface AnalyticsEvent {
  eventName: string;
  eventCategory: 'engagement' | 'conversion' | 'navigation';
  eventLabel?: string;
  eventValue?: number;
  customParams?: Record<string, any>;
}
```

## Data Models

### Lead Data Model

```typescript
interface Lead {
  id: string;
  type: 'eligibility' | 'signup' | 'newsletter';
  email: string;
  phone?: string;
  name?: string;
  city?: string;
  monthlyRent?: number;
  monthlySalary?: number;
  coOwnerCount?: number;
  livingType?: string;
  utmParams?: UTMParams;
  createdAt: string;
  source: string;
}
```

### Content Data Models

```typescript
interface SiteContent {
  hero: HeroContent;
  howItWorks: ProcessStep[];
  features: Feature[];
  pricing: PricingContent;
  marketplace: MarketplaceContent;
  roadmap: Milestone[];
  team: TeamMember[];
  faq: FAQItem[];
}

interface HeroContent {
  headline: string;
  subheadline: string;
  primaryCTAText: string;
  secondaryCTAText: string;
}

interface PricingContent {
  platformFee: string;
  marketplaceFee: string;
  registrationFee: string;
  spvManagementFee: string;
}

interface MarketplaceContent {
  exitProcess: string[];
  tradingFees: FeeStructure;
  mockListing: ListingCard;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}
```

### SEO Metadata Model

```typescript
interface PageMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  ogType: string;
  canonicalUrl: string;
  structuredData?: object;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After reviewing all testable properties from the prework analysis, I've identified opportunities to consolidate redundant properties:

**Consolidations:**
- Multiple "content is present" examples (3.1-3.5, 6.1-6.2, 7.1-7.3, etc.) can be consolidated into a single property about required content sections
- Form submission properties (4.3, 5.4, 20.2) can be consolidated into a single property about form data transmission
- Accessibility properties (13.2-13.5) are complementary and should remain separate as they test different aspects
- Meta tag properties (15.1, 15.2) can be consolidated into a single property about page metadata

**Properties to Keep:**
- Step card descriptions (2.2) - unique validation of content structure
- UTM parameter capture (4.2, 14.4) - critical for marketing attribution
- Form validation (5.3) - critical for data quality
- Responsive layout (12.3) - critical for mobile experience
- Image lazy loading (12.4) - critical for performance
- Keyboard navigation (13.2) - critical for accessibility
- Analytics event tracking (14.2, 14.3) - critical for conversion tracking

The consolidated properties below eliminate redundancy while maintaining comprehensive coverage of all functional requirements.

### Correctness Properties

Property 1: Step card completeness
*For any* step card rendered in the How It Works section, the card should contain both an icon and a one-line description
**Validates: Requirements 2.2**

Property 2: UTM parameter preservation
*For any* form submission, if UTM parameters are present in the URL when the user arrives, those parameters should be included in the form submission payload
**Validates: Requirements 4.2, 14.4**

Property 3: Form data transmission
*For any* form submission with valid data, the website should send a POST request to the configured endpoint with properly formatted JSON containing all form fields
**Validates: Requirements 4.3, 5.4, 20.2**

Property 4: Form validation blocking
*For any* form with invalid data (missing required fields or invalid format), the submission should be prevented and validation errors should be displayed
**Validates: Requirements 5.3**

Property 5: Market data source attribution
*For any* market statistic displayed in the Market & Validation section, if a source is available, it should be cited alongside the statistic
**Validates: Requirements 8.3**

Property 6: Milestone descriptions
*For any* milestone displayed in the roadmap, the milestone should include a description field explaining that phase
**Validates: Requirements 9.4**

Property 7: Team member credentials
*For any* team member displayed in the Team section, the member card should include credentials or experience information
**Validates: Requirements 10.2**

Property 8: Responsive layout adaptation
*For any* viewport width below 768px (mobile breakpoint), all page sections should display in a single-column layout optimized for mobile viewing
**Validates: Requirements 12.3**

Property 9: Image lazy loading
*For any* image element positioned below the initial viewport (below the fold), the image should have lazy loading enabled
**Validates: Requirements 12.4**

Property 10: Keyboard navigation accessibility
*For any* interactive element (buttons, links, form inputs), keyboard navigation should work correctly with visible focus indicators and logical tab order
**Validates: Requirements 13.2**

Property 11: Image alt text presence
*For any* meaningful image (non-decorative), the image element should include descriptive alt text
**Validates: Requirements 13.3**

Property 12: Color contrast compliance
*For any* text element, the color contrast ratio between text and background should be at least 4.5:1
**Validates: Requirements 13.4**

Property 13: ARIA attribute presence
*For any* interactive element that requires additional context for screen readers, appropriate ARIA labels and roles should be present
**Validates: Requirements 13.5**

Property 14: CTA analytics tracking
*For any* CTA button click, a custom analytics event should be fired to the analytics platform with the button identifier
**Validates: Requirements 14.2**

Property 15: Form conversion tracking
*For any* successful form submission, a conversion event should be tracked in the analytics platform with form type and relevant parameters
**Validates: Requirements 14.3**

Property 16: Page metadata uniqueness
*For any* page in the website, the page should have unique title and description meta tags that differ from other pages
**Validates: Requirements 15.1**

Property 17: Open Graph tag presence
*For any* page in the website, the page should include Open Graph meta tags for title, description, image, and type
**Validates: Requirements 15.2**

Property 18: Architectural comment presence
*For any* complex component or utility function (over 50 lines or with non-obvious logic), explanatory comments should be present describing the architectural decision or approach
**Validates: Requirements 16.4**

Property 19: Form data formatting validation
*For any* form submission test, the test should verify that the data payload is correctly formatted according to the expected schema before transmission
**Validates: Requirements 17.3**

Property 20: Typography consistency
*For any* heading element (h1-h6), the computed font family should be from the serif font stack, and for any body text element (p, li, span), the computed font family should be from the sans-serif font stack
**Validates: Requirements 18.1**

Property 21: Spacing scale consistency
*For any* spacing value applied via CSS (margin, padding, gap), the value should come from the defined spacing scale (multiples of 4px or 8px base unit)
**Validates: Requirements 18.3**

Property 22: Icon set consistency
*For any* icon used throughout the website, the icon should come from the same icon library (Lucide React)
**Validates: Requirements 19.3**

Property 23: Error message user-friendliness
*For any* form submission error response, the website should display a user-friendly error message (not raw error codes or technical jargon) and maintain form state for retry
**Validates: Requirements 20.5**

## Error Handling

### Form Submission Errors

**Client-Side Validation Errors**
- Display inline validation messages next to invalid fields
- Highlight invalid fields with red border and error icon
- Prevent form submission until all validation passes
- Maintain user input during validation (don't clear fields)

**Network Errors**
- Display toast notification: "Connection error. Please check your internet and try again."
- Keep form data intact for retry
- Provide retry button
- Log error to console for debugging

**Server Errors (4xx, 5xx)**
- Display user-friendly message: "Something went wrong. Please try again or contact support."
- Log full error details to console and error tracking service
- Provide fallback contact email if form repeatedly fails
- Track error events in analytics

**Timeout Errors**
- Set 30-second timeout for form submissions
- Display message: "Request is taking longer than expected. Please try again."
- Allow user to retry or cancel

### Image Loading Errors

**Missing Images**
- Use placeholder images with appropriate alt text
- Log missing image paths to console
- Gracefully degrade to background color or pattern

**Failed Image Loads**
- Catch image load errors with onError handler
- Replace with placeholder or hide image container
- Ensure layout doesn't break

### Analytics Errors

**GA4 Script Fails to Load**
- Wrap analytics calls in try-catch blocks
- Fail silently without breaking user experience
- Log analytics failures to console only (not user-facing)

**Event Tracking Failures**
- Queue failed events for retry
- Don't block user actions if tracking fails
- Ensure core functionality works without analytics

### Accessibility Errors

**Focus Management**
- Ensure focus is never lost (always on a focusable element)
- Trap focus within modals
- Return focus to trigger element when modal closes

**Screen Reader Announcements**
- Use ARIA live regions for dynamic content updates
- Announce form validation errors
- Announce success/error messages after form submission

## Testing Strategy

### Unit Testing

The website will use Vitest and React Testing Library for unit testing. Unit tests will focus on:

**Component Rendering**
- Verify components render with correct props
- Test conditional rendering logic
- Verify correct HTML structure and classes

**Form Validation Logic**
- Test email format validation
- Test phone number format validation
- Test required field validation
- Test numeric field validation (salary, rent)
- Test co-owner count range (2-5)

**Utility Functions**
- Test UTM parameter extraction from URL
- Test form data formatting functions
- Test analytics event builders
- Test SEO metadata generators

**User Interactions**
- Test button click handlers
- Test form submission flow
- Test modal open/close behavior
- Test scroll-to-section functionality

**Example Unit Tests:**
```typescript
// Form validation
describe('validateEmail', () => {
  it('should accept valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });
  
  it('should reject invalid email addresses', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });
});

// Component rendering
describe('HeroSection', () => {
  it('should render headline and CTAs', () => {
    render(<HeroSection {...mockProps} />);
    expect(screen.getByText(/Turn rent into home ownership/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Get early access/i })).toBeInTheDocument();
  });
});
```

### Property-Based Testing

The website will use fast-check (JavaScript property-based testing library) for property-based tests. Each property-based test will run a minimum of 100 iterations with randomly generated inputs.

**Property Test Configuration:**
```typescript
import fc from 'fast-check';

// Configure to run 100 iterations minimum
const testConfig = { numRuns: 100 };
```

**Property Test Tagging:**
Each property-based test must include a comment tag referencing the design document property:

```typescript
/**
 * Feature: bhavan-marketing-site, Property 2: UTM parameter preservation
 * For any form submission, if UTM parameters are present in the URL,
 * those parameters should be included in the form submission payload
 */
test('UTM parameters are preserved in form submissions', () => {
  fc.assert(
    fc.property(
      fc.record({
        source: fc.string(),
        medium: fc.string(),
        campaign: fc.string(),
      }),
      (utmParams) => {
        // Test implementation
      }
    ),
    testConfig
  );
});
```

**Property Tests to Implement:**

1. **Property 2: UTM parameter preservation** - Generate random UTM parameters, verify they're included in form payloads
2. **Property 3: Form data transmission** - Generate random valid form data, verify POST request format
3. **Property 4: Form validation blocking** - Generate random invalid form data, verify submission is blocked
4. **Property 8: Responsive layout adaptation** - Generate random viewport widths below 768px, verify single-column layout
5. **Property 9: Image lazy loading** - Generate random image positions, verify lazy loading for below-fold images
6. **Property 10: Keyboard navigation** - Generate random interactive element sequences, verify tab order
7. **Property 12: Color contrast compliance** - Generate random text/background color combinations from design system, verify 4.5:1 ratio
8. **Property 14: CTA analytics tracking** - Generate random CTA clicks, verify analytics events fire
9. **Property 15: Form conversion tracking** - Generate random form submissions, verify conversion events
10. **Property 20: Typography consistency** - Generate random heading and body elements, verify font families

### Integration Testing

**Form Submission Flow**
- Test complete form fill and submission
- Verify data reaches mock endpoint
- Verify success/error UI feedback
- Test with various form types (eligibility, signup, contact)

**Navigation Flow**
- Test scroll-to-section links
- Test modal open/close
- Test page navigation
- Test back button behavior

**Analytics Integration**
- Test GA4 initialization
- Test event tracking on user actions
- Test UTM parameter capture and persistence

### Accessibility Testing

**Automated Testing**
- Use @axe-core/react for automated accessibility testing
- Run on all major components and pages
- Verify WCAG AA compliance

**Manual Testing Checklist**
- Keyboard-only navigation through entire site
- Screen reader testing (VoiceOver on macOS, NVDA on Windows)
- Color contrast verification with browser tools
- Focus indicator visibility
- Form error announcement testing

### Performance Testing

**Lighthouse CI**
- Run Lighthouse in CI pipeline
- Fail build if performance score < 90
- Monitor Core Web Vitals: LCP, FID, CLS
- Track bundle size and prevent regressions

**Manual Performance Testing**
- Test on slow 3G network
- Test on low-end mobile devices
- Verify lazy loading works correctly
- Check image optimization

### Visual Regression Testing (Optional)

If time allows, implement visual regression testing with Playwright:
- Capture screenshots of key pages
- Compare against baseline on each build
- Flag visual changes for review

## Deployment and Infrastructure

### Build Process

**Static Site Generation**
```bash
# Install dependencies
npm install

# Run tests
npm test

# Build static site
npm run build

# Output: /out directory with static HTML/CSS/JS
```

**Next.js Configuration for Static Export**
```javascript
// next.config.js
module.exports = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true, // Better compatibility with static hosts
};
```

### Environment Variables

**Required Environment Variables:**
```bash
# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Form Integration (choose one)
NEXT_PUBLIC_FORM_ENDPOINT=https://api.example.com/submit
# OR
NEXT_PUBLIC_NETLIFY_FORM=true
# OR
NEXT_PUBLIC_FORMSPREE_ID=xxxxx
# OR
NEXT_PUBLIC_ZAPIER_WEBHOOK=https://hooks.zapier.com/...

# Optional: Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://...
```

### Deployment Options

**Option 1: Vercel (Recommended)**
- Automatic deployments from Git
- Built-in CDN and edge network
- Serverless functions for form handling
- Preview deployments for PRs
- Custom domain support

**Option 2: Netlify**
- Automatic deployments from Git
- Built-in form handling (Netlify Forms)
- Serverless functions support
- Split testing capabilities
- Custom domain support

**Option 3: AWS S3 + CloudFront**
- Upload static files to S3 bucket
- Configure CloudFront for CDN
- Use Lambda@Edge for serverless functions
- More manual setup but full control

**Option 4: GitHub Pages**
- Free hosting for static sites
- Automatic deployment from repository
- Limited to client-side functionality
- No serverless functions (use external services)

### Serverless Functions

**Form Submission Handler (Vercel/Netlify)**
```typescript
// api/submit-form.ts
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { formType, data, utmParams } = req.body;

  // Validate payload
  if (!formType || !data) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  try {
    // Forward to CRM/email service
    await forwardToIntegration(formType, data, utmParams);
    
    return res.status(200).json({
      success: true,
      message: 'Form submitted successfully',
    });
  } catch (error) {
    console.error('Form submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Submission failed',
    });
  }
}
```

### CDN and Caching

**Cache Headers**
- HTML files: `Cache-Control: public, max-age=0, must-revalidate`
- Static assets (CSS, JS, images): `Cache-Control: public, max-age=31536000, immutable`
- Fonts: `Cache-Control: public, max-age=31536000, immutable`

**Asset Optimization**
- Minify HTML, CSS, JavaScript
- Compress images (WebP, AVIF)
- Enable Brotli/Gzip compression
- Use content hashing for cache busting

### Monitoring and Analytics

**Performance Monitoring**
- Google Analytics 4 for user behavior
- Core Web Vitals tracking
- Custom events for conversions
- UTM parameter tracking

**Error Tracking (Optional)**
- Sentry for JavaScript error tracking
- Track form submission failures
- Monitor API endpoint errors

**Uptime Monitoring**
- Use service like UptimeRobot or Pingdom
- Monitor homepage and key pages
- Alert on downtime

## Security Considerations

### Data Privacy

**GDPR and India Compliance**
- Display privacy notice on all forms
- Obtain explicit consent before data collection
- Provide links to full privacy policy
- Allow users to request data deletion (via contact form)

**Data Minimization**
- Only collect necessary information
- Don't store sensitive data client-side
- Use HTTPS for all connections
- Sanitize user inputs before submission

### Form Security

**Client-Side Validation**
- Validate all inputs before submission
- Prevent XSS with input sanitization
- Use Content Security Policy headers

**Server-Side Validation**
- Re-validate all data on serverless function
- Rate limiting to prevent spam
- CAPTCHA for high-value forms (optional)

**CORS Configuration**
- Restrict API endpoints to website domain
- Set appropriate CORS headers

### Third-Party Scripts

**Analytics and Tracking**
- Load GA4 asynchronously
- Use Consent Mode for GDPR compliance
- Allow users to opt-out of tracking

**Content Security Policy**
```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://www.google-analytics.com;
```

## Design System

### Typography

**Font Families**
- Headings: Playfair Display (serif) or Georgia fallback
- Body: Inter (sans-serif) or system font stack fallback
- Monospace: 'Courier New' for code snippets (if needed)

**Font Sizes (Tailwind Scale)**
```
xs: 0.75rem (12px)
sm: 0.875rem (14px)
base: 1rem (16px)
lg: 1.125rem (18px)
xl: 1.25rem (20px)
2xl: 1.5rem (24px)
3xl: 1.875rem (30px)
4xl: 2.25rem (36px)
5xl: 3rem (48px)
6xl: 3.75rem (60px)
```

**Font Weights**
- Light: 300
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

**Line Heights**
- Tight: 1.25 (headings)
- Normal: 1.5 (body)
- Relaxed: 1.75 (long-form content)

### Color Palette

**Neutral Base**
```
white: #FFFFFF
gray-50: #F9FAFB
gray-100: #F3F4F6
gray-200: #E5E7EB
gray-300: #D1D5DB
gray-400: #9CA3AF
gray-500: #6B7280
gray-600: #4B5563
gray-700: #374151
gray-800: #1F2937
gray-900: #111827
black: #000000
```

**Accent Color (Primary)**
```
primary-50: #EFF6FF
primary-100: #DBEAFE
primary-200: #BFDBFE
primary-300: #93C5FD
primary-400: #60A5FA
primary-500: #3B82F6 (main)
primary-600: #2563EB
primary-700: #1D4ED8
primary-800: #1E40AF
primary-900: #1E3A8A
```

**Semantic Colors**
```
success: #10B981
warning: #F59E0B
error: #EF4444
info: #3B82F6
```

### Spacing Scale

**Base Unit: 4px**
```
0: 0
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
5: 1.25rem (20px)
6: 1.5rem (24px)
8: 2rem (32px)
10: 2.5rem (40px)
12: 3rem (48px)
16: 4rem (64px)
20: 5rem (80px)
24: 6rem (96px)
32: 8rem (128px)
```

### Breakpoints

```
sm: 640px (mobile landscape)
md: 768px (tablet)
lg: 1024px (desktop)
xl: 1280px (large desktop)
2xl: 1536px (extra large)
```

### Component Styles

**Buttons**
```
Primary: bg-primary-600, text-white, hover:bg-primary-700
Secondary: bg-gray-200, text-gray-900, hover:bg-gray-300
Outline: border-2 border-primary-600, text-primary-600, hover:bg-primary-50
Ghost: text-primary-600, hover:bg-primary-50

Sizes:
- sm: px-3 py-1.5 text-sm
- md: px-4 py-2 text-base
- lg: px-6 py-3 text-lg
```

**Form Inputs**
```
Default: border border-gray-300, rounded-md, px-4 py-2
Focus: border-primary-500, ring-2 ring-primary-200
Error: border-error, ring-2 ring-error/20
Disabled: bg-gray-100, cursor-not-allowed
```

**Cards**
```
Default: bg-white, border border-gray-200, rounded-lg, p-6
Hover: shadow-lg transition-shadow
```

### Animations

**Transitions**
```
Fast: 150ms ease-in-out
Normal: 300ms ease-in-out
Slow: 500ms ease-in-out
```

**Common Animations**
- Fade in: opacity 0 → 1
- Slide up: translateY(20px) → 0
- Scale: scale(0.95) → 1
- Hover lift: translateY(0) → translateY(-4px)

## Content Strategy

### Microcopy

**Hero Section**
- Headline: "Turn rent into home ownership. Co-own a home with 2–5 people via a compliant SPV."
- Subheadline: "Match, form an SPV, pay the down payment collectively and move from rent to ownership."

**How It Works Steps**
1. "KYC & credit check — fast, secure onboarding."
2. "Match — connect 2–5 compatible co-owners."
3. "Form SPV — we create the legal entity digitally."
4. "Move in & exit — sell shares on our marketplace."

**CTAs**
- Primary: "Get Early Access"
- Secondary: "How It Works"
- Eligibility: "Check Your Eligibility"
- Contact: "Get in Touch"

**Form Success Messages**
- Eligibility: "Thanks! We'll review your information and reach out within 2 business days."
- Signup: "You're on the list! We'll notify you when Bhavan.ai launches in your city."
- Contact: "Message received. Our team will respond within 24 hours."
- Newsletter: "Subscribed! You'll receive updates about Bhavan.ai."

**Form Error Messages**
- Network error: "Connection error. Please check your internet and try again."
- Server error: "Something went wrong. Please try again or email us at hello@bhavan.ai"
- Validation error: "Please check the highlighted fields and try again."

### SEO Content

**Homepage Meta**
- Title: "Bhavan.ai - Co-own Your Home with Friends | Fractional Home Ownership"
- Description: "Turn rent into home ownership. Bhavan.ai enables 2-5 people to legally co-own residential homes through compliant SPVs. Check your eligibility today."

**How It Works Meta**
- Title: "How Bhavan.ai Works - 4 Steps to Co-Ownership"
- Description: "Learn how Bhavan.ai makes fractional home ownership simple: KYC verification, matching, SPV formation, and marketplace exit options."

**Eligibility Meta**
- Title: "Check Your Eligibility - Bhavan.ai"
- Description: "See if you qualify for fractional home ownership with Bhavan.ai. Quick eligibility check based on your city, income, and preferences."

## Future Enhancements

### Phase 2 Features (Post-Launch)

**Blog/Resources Section**
- Educational content about SPVs, co-ownership, NBFCs
- SEO-optimized articles
- CMS integration (Contentful, Sanity)

**Property Listings**
- Browse available properties
- Filter by city, price, co-owner count
- Property detail pages

**User Dashboard**
- Track application status
- View matched co-owners
- Document uploads

**Advanced Eligibility Calculator**
- Real-time affordability calculation
- Loan pre-qualification
- Down payment calculator

**Testimonials and Case Studies**
- User success stories
- Video testimonials
- Before/after scenarios

**Live Chat Support**
- Intercom or similar integration
- Real-time customer support
- Chatbot for common questions

### Technical Improvements

**Progressive Web App (PWA)**
- Offline support
- Add to home screen
- Push notifications

**Internationalization (i18n)**
- Multi-language support
- Regional content variations
- Currency localization

**A/B Testing**
- Test different headlines and CTAs
- Optimize conversion rates
- Data-driven improvements

**Advanced Analytics**
- Heatmaps (Hotjar, Clarity)
- Session recordings
- Funnel analysis

## Conclusion

This design document provides a comprehensive blueprint for building the Bhavan.ai marketing and lead-generation website. The architecture prioritizes performance, accessibility, and user experience while maintaining flexibility for future enhancements.

Key design decisions:
- Static site generation for optimal performance and SEO
- Component-based architecture for maintainability
- Comprehensive testing strategy including property-based tests
- Flexible form integration supporting multiple backends
- Mobile-first, accessible design system
- Clear error handling and user feedback

The implementation will follow the task list in tasks.md, building incrementally from core components to full pages, with testing integrated throughout the development process.
