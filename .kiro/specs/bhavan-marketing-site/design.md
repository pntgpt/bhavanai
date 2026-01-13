# Design Document

## Overview

The Bhavan.ai marketing website is a static, performance-optimized lead-generation platform built with Next.js 14+ using static site generation (SSG). The architecture prioritizes fast load times, accessibility, SEO optimization, and seamless lead capture through serverless form integrations.

The site will be deployed as a collection of pre-rendered HTML pages with minimal client-side JavaScript, ensuring excellent performance scores and broad compatibility. All dynamic functionality (form submissions, analytics) will be handled through client-side JavaScript that progressively enhances the static foundation.

## Architecture

### Technology Stack

- **Framework**: Next.js 14+ with App Router deployed on Cloudflare Pages
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for utility-first styling with custom design tokens
- **Authentication**: Custom auth implementation using Cloudflare Workers and D1
- **Database**: Cloudflare D1 (SQLite) for user and property data
- **Session Storage**: Cloudflare Durable Objects or KV for session management
- **Forms**: Client-side validation with Cloudflare Pages Functions for backend
- **Analytics**: Google Analytics 4 (GA4) with custom event tracking
- **Image Storage**: Cloudflare R2 for property images
- **Icons**: Lucide React for consistent, lightweight iconography
- **Testing**: Vitest for unit tests, React Testing Library for component tests
- **Deployment**: Cloudflare Pages with D1 database and Pages Functions

### Architecture Principles

1. **Hybrid Rendering**: Marketing pages use static generation, authenticated pages use server-side rendering
2. **Progressive Enhancement**: Core content accessible without JavaScript, enhanced features require JS
3. **Mobile-First**: Responsive design starting from mobile breakpoints
4. **Accessibility-First**: WCAG AA compliance built into every component
5. **Performance-First**: Lighthouse score > 90 through optimization and lazy loading
6. **SEO-First**: Semantic HTML, meta tags, structured data on every page
7. **Security-First**: Role-based access control, secure session management, input validation

### Directory Structure

```
bhavan-marketing-site/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Homepage (static)
│   │   ├── layout.tsx         # Root layout with SEO
│   │   ├── login/             # Login page (dynamic)
│   │   ├── signup/            # Registration page (dynamic)
│   │   ├── dashboard/         # Protected dashboard routes
│   │   │   ├── admin/        # Admin dashboard
│   │   │   ├── broker/       # Broker dashboard
│   │   │   ├── ca/           # CA dashboard
│   │   │   └── lawyer/       # Lawyer dashboard
│   │   ├── eligibility/       # Eligibility checker page (static)
│   │   ├── marketplace/       # Marketplace info page (static)
│   │   ├── pricing/           # Pricing page (static)
│   │   ├── roadmap/           # Roadmap page (static)
│   │   ├── team/              # Team page (static)
│   │   ├── properties/        # Public property listings (dynamic)
│   │   ├── privacy/           # Privacy policy page (static)
│   │   ├── terms/             # Terms of service page (static)
│   │   └── faq/               # FAQ page (static)
│   ├── components/            # React components
│   │   ├── layout/           # Layout components (Header, Footer)
│   │   ├── sections/         # Page sections (Hero, HowItWorks, etc.)
│   │   ├── forms/            # Form components
│   │   ├── ui/               # Reusable UI components
│   │   ├── dashboard/        # Dashboard-specific components
│   │   └── analytics/        # Analytics wrapper components
│   ├── lib/                   # Utility functions
│   │   ├── analytics.ts      # GA4 integration
│   │   ├── auth.ts           # Authentication utilities
│   │   ├── db.ts             # Database client
│   │   ├── forms.ts          # Form submission logic
│   │   ├── validation.ts     # Form validation
│   │   └── seo.ts            # SEO utilities
│   ├── types/                 # TypeScript type definitions
│   ├── styles/                # Global styles and Tailwind config
│   ├── middleware.ts          # Auth middleware for protected routes
│   └── public/                # Static assets
│       ├── images/           # Images and placeholders
│       ├── icons/            # Favicons
│       └── downloads/        # PDFs (pitch deck, press kit)
├── prisma/                    # Database schema and migrations
│   ├── schema.prisma         # Prisma schema
│   └── migrations/           # Database migrations
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

#### 5. Authentication Components

**LoginForm Component**
- Email and password inputs
- Remember me checkbox
- Submit handler with error display
- Loading state during authentication

```typescript
interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  error?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}
```

**RegistrationForm Component**
- Name, email, phone inputs
- User type selector (Broker, CA, Lawyer)
- Terms acceptance checkbox
- Submit handler for pending account creation

```typescript
interface RegistrationFormProps {
  onSubmit: (data: RegistrationData) => Promise<void>;
}

interface RegistrationData {
  name: string;
  email: string;
  phone: string;
  userType: 'broker' | 'ca' | 'lawyer';
  termsAccepted: boolean;
}
```

#### 6. Dashboard Components

**AdminDashboard Component**
- Navigation tabs for different admin functions
- User management section
- Property approval section
- Analytics overview

```typescript
interface AdminDashboardProps {
  user: AuthenticatedUser;
}

interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'broker' | 'ca' | 'lawyer';
}
```

**UserManagementTable Component**
- List of all users with status
- Approve/reject pending users
- Create new user button
- Reset password action
- Deactivate user action

```typescript
interface UserManagementTableProps {
  users: User[];
  onApprove: (userId: string) => Promise<void>;
  onReject: (userId: string) => Promise<void>;
  onResetPassword: (userId: string) => Promise<void>;
  onDeactivate: (userId: string) => Promise<void>;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'broker' | 'ca' | 'lawyer';
  status: 'pending' | 'active' | 'inactive';
  createdAt: string;
}
```

**PropertyApprovalTable Component**
- List of properties pending approval
- Property details preview
- Approve/reject actions
- Filter by broker

```typescript
interface PropertyApprovalTableProps {
  properties: Property[];
  onApprove: (propertyId: string) => Promise<void>;
  onReject: (propertyId: string, reason: string) => Promise<void>;
}

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  coOwnerCount: number;
  images: string[];
  brokerId: string;
  brokerName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}
```

**BrokerDashboard Component**
- My properties list
- Add new property button
- Edit/delete property actions
- Submit for approval action

```typescript
interface BrokerDashboardProps {
  user: AuthenticatedUser;
  properties: Property[];
}
```

**PropertyForm Component**
- Property details inputs (title, description, location, price)
- Co-owner count selector
- Image upload
- Submit for approval

```typescript
interface PropertyFormProps {
  property?: Property; // For editing
  onSubmit: (data: PropertyFormData) => Promise<void>;
  onCancel: () => void;
}

interface PropertyFormData {
  title: string;
  description: string;
  location: string;
  price: number;
  coOwnerCount: number;
  images: File[];
}
```

**CADashboard Component**
- Placeholder for CA-specific functionality
- Coming soon message

```typescript
interface CADashboardProps {
  user: AuthenticatedUser;
}
```

**LawyerDashboard Component**
- Placeholder for lawyer-specific functionality
- Coming soon message

```typescript
interface LawyerDashboardProps {
  user: AuthenticatedUser;
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

#### Authentication Endpoints

```typescript
// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
}

// POST /api/auth/register
interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  userType: 'broker' | 'ca' | 'lawyer';
}

interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: string;
}

// POST /api/auth/logout
interface LogoutResponse {
  success: boolean;
}

// GET /api/auth/session
interface SessionResponse {
  authenticated: boolean;
  user?: AuthenticatedUser;
}
```

#### User Management Endpoints

```typescript
// GET /api/admin/users
interface GetUsersResponse {
  users: User[];
}

// POST /api/admin/users
interface CreateUserRequest {
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'broker' | 'ca' | 'lawyer';
  password: string;
}

interface CreateUserResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// PATCH /api/admin/users/:id/approve
interface ApproveUserResponse {
  success: boolean;
  message: string;
}

// PATCH /api/admin/users/:id/reset-password
interface ResetPasswordRequest {
  newPassword: string;
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// PATCH /api/admin/users/:id/deactivate
interface DeactivateUserResponse {
  success: boolean;
  message: string;
}
```

#### Property Management Endpoints

```typescript
// GET /api/properties (public - only approved)
interface GetPublicPropertiesResponse {
  properties: Property[];
}

// GET /api/broker/properties (broker's own properties)
interface GetBrokerPropertiesResponse {
  properties: Property[];
}

// GET /api/admin/properties (all properties)
interface GetAllPropertiesResponse {
  properties: Property[];
}

// POST /api/broker/properties
interface CreatePropertyRequest {
  title: string;
  description: string;
  location: string;
  price: number;
  coOwnerCount: number;
  images: string[]; // URLs after upload
}

interface CreatePropertyResponse {
  success: boolean;
  property?: Property;
  error?: string;
}

// PATCH /api/broker/properties/:id
interface UpdatePropertyRequest {
  title?: string;
  description?: string;
  location?: string;
  price?: number;
  coOwnerCount?: number;
  images?: string[];
}

interface UpdatePropertyResponse {
  success: boolean;
  property?: Property;
  error?: string;
}

// DELETE /api/broker/properties/:id
interface DeletePropertyResponse {
  success: boolean;
  message: string;
}

// PATCH /api/admin/properties/:id/approve
interface ApprovePropertyResponse {
  success: boolean;
  message: string;
}

// PATCH /api/admin/properties/:id/reject
interface RejectPropertyRequest {
  reason: string;
}

interface RejectPropertyResponse {
  success: boolean;
  message: string;
}
```

## Data Models

### Authentication and Authorization

#### Authentication Flow

**Login Process:**
1. User submits email and password via LoginForm
2. Credentials sent to `/api/auth/login` endpoint
3. Server validates credentials against database (bcrypt password comparison)
4. On success: Create secure session with HTTP-only cookie, return user data
5. On failure: Return error message, allow retry
6. Client redirects to role-specific dashboard on success

**Registration Process:**
1. User submits registration form with name, email, phone, user type
2. Data sent to `/api/auth/register` endpoint
3. Server creates user with PENDING status and hashed temporary password
4. Server sends notification to admins
5. Client displays "Our team will reach out shortly" message
6. Admin approves user and sends credentials separately

**Session Management:**
1. Sessions stored in database with expiration timestamp
2. HTTP-only, secure cookies prevent XSS attacks
3. Session validated on every protected route access
4. Sessions expire after 24 hours of inactivity
5. Logout destroys session and clears cookies

#### Authorization Model

**Role Hierarchy:**
- **Admin**: Full access to all features, user management, property management
- **Broker**: Property CRUD operations, submit for approval, view own properties
- **CA**: Access to CA dashboard (placeholder functionality)
- **Lawyer**: Access to Lawyer dashboard (placeholder functionality)

**Route Protection:**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const session = await getSession(request);
  
  // Protect all /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Role-based access control
    const role = session.user.role;
    const path = request.nextUrl.pathname;
    
    if (path.startsWith('/dashboard/admin') && role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 });
    }
    
    if (path.startsWith('/dashboard/broker') && role !== 'broker') {
      return new NextResponse('Forbidden', { status: 403 });
    }
    
    // Similar checks for CA and Lawyer
  }
  
  return NextResponse.next();
}
```

**API Route Protection:**
```typescript
// lib/auth.ts
export async function requireAuth(req: NextRequest, allowedRoles?: Role[]) {
  const session = await getSession(req);
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    throw new Error('Forbidden');
  }
  
  return session.user;
}

// Usage in API route
export async function POST(req: NextRequest) {
  const user = await requireAuth(req, ['broker', 'admin']);
  // Handle property creation
}
```

#### Password Security

**Hashing:**
- Use bcrypt with salt rounds = 12
- Never store plain text passwords
- Hash passwords before database insertion

```typescript
import bcrypt from 'bcrypt';

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

**Password Reset:**
- Admin can reset any user's password
- Generate temporary password
- Hash before storing
- Notify user via email/phone

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

### Database Schema

The database schema is defined in SQL for Cloudflare D1 (SQLite). See the Deployment section for the complete schema.

**Key Tables:**
- `users`: User accounts with roles and status
- `properties`: Property listings with approval workflow
- `sessions`: Authentication sessions with expiration

**TypeScript Interfaces (for type safety):**

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string; // Hashed with bcrypt
  role: 'admin' | 'broker' | 'ca' | 'lawyer';
  status: 'pending' | 'active' | 'inactive';
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  co_owner_count: number;
  images: string; // JSON string array of R2 URLs
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  broker_id: string;
  created_at: number;
  updated_at: number;
}

interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: number;
  created_at: number;
}
```

**Database Helper Functions:**

```typescript
// lib/db.ts
export async function getUser(env: Env, email: string): Promise<User | null> {
  return await env.DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email).first();
}

export async function createUser(env: Env, user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
  const id = crypto.randomUUID();
  const now = Date.now();
  
  await env.DB.prepare(
    'INSERT INTO users (id, name, email, phone, password, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, user.name, user.email, user.phone, user.password, user.role, user.status, now, now).run();
  
  return { ...user, id, created_at: now, updated_at: now };
}

export async function getProperties(env: Env, filters?: { status?: string; broker_id?: string }): Promise<Property[]> {
  let query = 'SELECT * FROM properties WHERE 1=1';
  const bindings: any[] = [];
  
  if (filters?.status) {
    query += ' AND status = ?';
    bindings.push(filters.status);
  }
  
  if (filters?.broker_id) {
    query += ' AND broker_id = ?';
    bindings.push(filters.broker_id);
  }
  
  query += ' ORDER BY created_at DESC';
  
  const result = await env.DB.prepare(query).bind(...bindings).all();
  return result.results as Property[];
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

Property 24: Login authentication validation
*For any* login attempt with valid credentials, the system should create a secure session and redirect to the appropriate role-specific dashboard
**Validates: Requirements 21.3**

Property 25: Failed login error display
*For any* login attempt with invalid credentials, the system should display an error message and allow retry without clearing the email field
**Validates: Requirements 21.4**

Property 26: Registration pending status
*For any* successful registration submission, the system should create a user account with pending status and display the confirmation message
**Validates: Requirements 22.3, 22.4**

Property 27: Broker property creation pending status
*For any* property created by a broker, the property should be created with pending approval status
**Validates: Requirements 23.2**

Property 28: Property approval visibility
*For any* property with approved status, the property should appear in the public /properties page listing
**Validates: Requirements 24.4**

Property 29: Property rejection exclusion
*For any* property with rejected or pending status, the property should not appear in the public /properties page listing
**Validates: Requirements 24.5**

Property 30: Admin property access
*For any* property in the system, an authenticated admin user should be able to view and edit that property regardless of which broker created it
**Validates: Requirements 25.2**

Property 31: Admin user approval activation
*For any* pending user account, when an admin approves it, the user status should change to active
**Validates: Requirements 26.2**

Property 32: Role-based dashboard routing
*For any* authenticated user, after successful login, the system should redirect to the dashboard corresponding to their role (admin → /dashboard/admin, broker → /dashboard/broker, etc.)
**Validates: Requirements 21.3, 27.1, 27.2**

Property 33: Unauthorized access prevention
*For any* protected route, when accessed by an unauthenticated user, the system should redirect to the login page
**Validates: Requirements 28.4**

Property 34: Role permission enforcement
*For any* protected route requiring specific role permissions, when accessed by a user without those permissions, the system should display a 403 Forbidden error
**Validates: Requirements 27.5, 28.5**

Property 35: Session expiration
*For any* user session inactive for 24 hours, the system should expire the session and require re-authentication on next access
**Validates: Requirements 28.2**

Property 36: Password hashing
*For any* user password stored in the database, the password should be hashed using bcrypt (not stored in plain text)
**Validates: Requirements 21.2** (implied security requirement)

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

### Authentication Errors

**Invalid Credentials**
- Display message: "Invalid email or password. Please try again."
- Keep email field populated
- Clear password field for security
- Log failed attempts for security monitoring

**Session Expiration**
- Detect expired session on protected route access
- Redirect to login with message: "Your session has expired. Please log in again."
- Preserve intended destination for post-login redirect

**Unauthorized Access**
- Display 403 Forbidden page with clear message
- Provide link back to appropriate dashboard
- Log unauthorized access attempts

**Account Pending Approval**
- Display message: "Your account is pending approval. We'll notify you once it's activated."
- Prevent login for pending accounts
- Provide contact information for inquiries

### Property Management Errors

**Property Creation Failures**
- Validate all required fields client-side
- Display inline errors for invalid data
- Server-side validation with detailed error messages
- Maintain form state on error

**Image Upload Errors**
- File size limit: 5MB per image
- Allowed formats: JPEG, PNG, WebP
- Display error: "Image must be under 5MB and in JPEG, PNG, or WebP format"
- Allow retry without losing other form data

**Property Approval/Rejection Errors**
- Verify admin permissions before action
- Display success/error toast notifications
- Refresh property list after action
- Log all approval/rejection actions for audit

**Concurrent Edit Conflicts**
- Detect if property was modified by another user
- Display warning: "This property was recently updated. Please refresh and try again."
- Prevent data loss from overwriting recent changes

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

**Authentication Logic**
- Test password hashing with bcrypt
- Test session creation and validation
- Test role-based access control logic
- Test session expiration detection

**Property Management Logic**
- Test property status transitions (pending → approved/rejected)
- Test property filtering by status
- Test broker property ownership validation
- Test admin property access across all brokers

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

// Authentication
describe('hashPassword', () => {
  it('should hash passwords with bcrypt', async () => {
    const password = 'testPassword123';
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(await verifyPassword(password, hash)).toBe(true);
  });
});

// Authorization
describe('requireAuth', () => {
  it('should throw error for unauthenticated requests', async () => {
    const req = new NextRequest('http://localhost/api/test');
    await expect(requireAuth(req)).rejects.toThrow('Unauthorized');
  });
  
  it('should allow access for authenticated users with correct role', async () => {
    const req = createAuthenticatedRequest({ role: 'admin' });
    const user = await requireAuth(req, ['admin']);
    expect(user.role).toBe('admin');
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
11. **Property 24: Login authentication validation** - Generate random valid credentials, verify session creation and dashboard redirect
12. **Property 27: Broker property creation pending status** - Generate random property data, verify pending status on creation
13. **Property 28: Property approval visibility** - Generate random properties with approved status, verify they appear in public listing
14. **Property 29: Property rejection exclusion** - Generate random properties with rejected/pending status, verify they don't appear in public listing
15. **Property 32: Role-based dashboard routing** - Generate random authenticated users with different roles, verify correct dashboard redirect
16. **Property 33: Unauthorized access prevention** - Generate random unauthenticated requests to protected routes, verify redirect to login
17. **Property 34: Role permission enforcement** - Generate random authenticated users accessing routes outside their permissions, verify 403 error
18. **Property 36: Password hashing** - Generate random passwords, verify they are hashed with bcrypt before storage

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

**Authentication Flow**
- Test complete login flow from form to dashboard
- Test registration flow and pending account creation
- Test logout and session destruction
- Test session expiration and re-authentication
- Test role-based dashboard access

**Property Management Flow**
- Test broker property creation and submission for approval
- Test admin property approval workflow
- Test admin property rejection with reason
- Test property visibility on public listing after approval
- Test broker editing their own properties
- Test admin editing any property

**User Management Flow**
- Test admin approving pending user accounts
- Test admin creating new users with roles
- Test admin resetting user passwords
- Test admin deactivating users

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
  // Note: Cannot use full static export with authentication
  // Marketing pages can be statically generated
  // Dashboard pages require server-side rendering
  images: {
    domains: ['res.cloudinary.com'], // Add image hosting domains
  },
  experimental: {
    serverActions: true, // Enable server actions for forms
  },
};
```

### Database Setup

**Initial Setup:**
```bash
# Create D1 database
wrangler d1 create bhavan-db

# This will output database_id - add it to wrangler.toml

# Create schema
wrangler d1 execute bhavan-db --file=./schema.sql
```

**Seed Initial Admin User:**
```typescript
// scripts/seed-admin.ts
import { hash } from 'bcryptjs';

const adminUser = {
  id: crypto.randomUUID(),
  name: 'Admin User',
  email: 'admin@bhavan.ai',
  phone: '+911234567890',
  password: await hash('admin123', 12),
  role: 'admin',
  status: 'active',
  created_at: Date.now(),
  updated_at: Date.now()
};

// Run via wrangler d1 execute
const sql = `INSERT INTO users (id, name, email, phone, password, role, status, created_at, updated_at) 
VALUES ('${adminUser.id}', '${adminUser.name}', '${adminUser.email}', '${adminUser.phone}', '${adminUser.password}', '${adminUser.role}', '${adminUser.status}', ${adminUser.created_at}, ${adminUser.updated_at})`;

console.log(sql);
```

Run seed:
```bash
# Generate SQL and run
node scripts/seed-admin.ts > seed.sql
wrangler d1 execute bhavan-db --file=./seed.sql
```

**Local Development:**
```bash
# Run D1 locally
wrangler pages dev out --d1=DB=bhavan-db

# Or use local SQLite file for development
# Create local.db and run migrations
sqlite3 local.db < schema.sql
```

### Environment Variables

**Wrangler Configuration (wrangler.toml):**
```toml
name = "bhavan-website"
compatibility_date = "2024-12-01"
pages_build_output_dir = "out"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "bhavan-db"
database_id = "your-database-id-here"

# R2 Buckets
[[r2_buckets]]
binding = "IMAGES"
bucket_name = "bhavan-images"

[[r2_buckets]]
binding = "ASSETS"
bucket_name = "bhavan-website"

# Environment Variables
[vars]
ENVIRONMENT = "production"
NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-XXXXXXXXXX"
BCRYPT_SALT_ROUNDS = "12"
SESSION_DURATION_MS = "86400000"  # 24 hours
```

**Secrets (set via wrangler):**
```bash
# Set secrets (not in wrangler.toml for security)
wrangler pages secret put JWT_SECRET
wrangler pages secret put ADMIN_EMAIL
```

**Local Development (.dev.vars):**
```bash
# .dev.vars (for local development only, not committed to git)
ENVIRONMENT=development
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Deployment Options

### Deployment Options

#### Cloudflare Pages + D1 + R2 (Selected Approach)

This approach keeps everything within the Cloudflare ecosystem:

**Architecture:**
- **Cloudflare Pages**: Host Next.js application with automatic builds from Git
- **Cloudflare D1**: SQLite database for users, properties, and sessions
- **Cloudflare R2**: Object storage for property images
- **Cloudflare Pages Functions**: Serverless API endpoints for authentication and data operations
- **Cloudflare Workers KV**: Fast key-value storage for session tokens (optional, can use D1)

**Benefits:**
- Single platform for entire application
- Excellent global performance via Cloudflare's edge network
- Cost-effective (generous free tier)
- Integrated with existing Cloudflare setup
- No need to manage separate database hosting
- Built-in DDoS protection and security

**Implementation Details:**

**1. Database Setup (D1):**
```bash
# Create D1 database
wrangler d1 create bhavan-db

# Create tables
wrangler d1 execute bhavan-db --file=./schema.sql
```

**2. Database Schema (SQL for D1):**
```sql
-- schema.sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'broker', 'ca', 'lawyer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'inactive')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  price REAL NOT NULL,
  co_owner_count INTEGER NOT NULL,
  images TEXT NOT NULL, -- JSON array of R2 URLs
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  broker_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (broker_id) REFERENCES users(id)
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_properties_broker ON properties(broker_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user ON sessions(user_id);
```

**3. Wrangler Configuration:**
```toml
# wrangler.toml
name = "bhavan-website"
compatibility_date = "2024-12-01"
pages_build_output_dir = "out"

# D1 Database binding
[[d1_databases]]
binding = "DB"
database_name = "bhavan-db"
database_id = "your-database-id"

# R2 bucket for images
[[r2_buckets]]
binding = "IMAGES"
bucket_name = "bhavan-images"

# Environment variables
[vars]
ENVIRONMENT = "production"
```

**4. Pages Functions Structure:**
```
functions/
├── api/
│   ├── auth/
│   │   ├── login.ts
│   │   ├── register.ts
│   │   ├── logout.ts
│   │   └── session.ts
│   ├── admin/
│   │   ├── users.ts
│   │   └── properties.ts
│   ├── broker/
│   │   └── properties.ts
│   └── properties/
│       └── public.ts
└── _middleware.ts  # Auth middleware
```

**5. Authentication Implementation:**
```typescript
// functions/api/auth/login.ts
import { hash, compare } from 'bcryptjs';

export async function onRequestPost(context) {
  const { request, env } = context;
  const { email, password } = await request.json();
  
  // Query user from D1
  const result = await env.DB.prepare(
    'SELECT * FROM users WHERE email = ? AND status = ?'
  ).bind(email, 'active').first();
  
  if (!result) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Verify password
  const valid = await compare(password, result.password);
  if (!valid) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Create session
  const sessionId = crypto.randomUUID();
  const token = crypto.randomUUID();
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  
  await env.DB.prepare(
    'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)'
  ).bind(sessionId, result.id, token, expiresAt).run();
  
  // Set HTTP-only cookie
  return new Response(JSON.stringify({
    success: true,
    user: {
      id: result.id,
      name: result.name,
      email: result.email,
      role: result.role
    }
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `session=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${24 * 60 * 60}; Path=/`
    }
  });
}
```

**6. Middleware for Route Protection:**
```typescript
// functions/_middleware.ts
export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  
  // Protect dashboard routes
  if (url.pathname.startsWith('/dashboard')) {
    const cookie = request.headers.get('Cookie');
    const sessionToken = cookie?.match(/session=([^;]+)/)?.[1];
    
    if (!sessionToken) {
      return Response.redirect(new URL('/login', request.url), 302);
    }
    
    // Validate session
    const session = await env.DB.prepare(
      'SELECT s.*, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > ?'
    ).bind(sessionToken, Date.now()).first();
    
    if (!session) {
      return Response.redirect(new URL('/login', request.url), 302);
    }
    
    // Role-based access control
    const role = session.role;
    if (url.pathname.startsWith('/dashboard/admin') && role !== 'admin') {
      return new Response('Forbidden', { status: 403 });
    }
    if (url.pathname.startsWith('/dashboard/broker') && role !== 'broker') {
      return new Response('Forbidden', { status: 403 });
    }
    
    // Attach user to request context
    context.data.user = session;
  }
  
  return next();
}
```

**7. Image Upload to R2:**
```typescript
// functions/api/upload.ts
export async function onRequestPost(context) {
  const { request, env } = context;
  const formData = await request.formData();
  const file = formData.get('image');
  
  if (!file) {
    return new Response(JSON.stringify({ error: 'No file provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Generate unique filename
  const filename = `${crypto.randomUUID()}-${file.name}`;
  
  // Upload to R2
  await env.IMAGES.put(filename, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });
  
  // Return public URL
  const url = `https://images.bhavan.ai/${filename}`;
  return new Response(JSON.stringify({ url }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

**Deployment Process:**
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create bhavan-db

# Run migrations
wrangler d1 execute bhavan-db --file=./schema.sql

# Create R2 bucket for images
wrangler r2 bucket create bhavan-images

# Deploy to Cloudflare Pages
npm run build
wrangler pages deploy out
```

**Considerations:**
- D1 is currently in open beta (production-ready as of 2024)
- SQLite has some limitations compared to PostgreSQL (no full-text search, simpler querying)
- Pages Functions have 100ms CPU time limit (sufficient for most operations)
- R2 has no egress fees (cost-effective for images)
- Can migrate to Cloudflare Workers + Durable Objects for more complex features later

This approach keeps your entire stack on Cloudflare, maintains excellent performance, and is cost-effective.

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

### Authentication Security

**Password Security:**
- Hash all passwords with bcrypt (salt rounds = 12)
- Never store plain text passwords
- Enforce minimum password length (8 characters)
- Require password complexity (optional, can be added later)

**Session Security:**
- Use HTTP-only cookies to prevent XSS attacks
- Set Secure flag on cookies (HTTPS only)
- Set SameSite=Lax to prevent CSRF
- Implement session expiration (24 hours)
- Regenerate session ID on login

**Brute Force Protection:**
- Rate limit login attempts (5 attempts per 15 minutes)
- Lock account after 10 failed attempts
- Log all failed login attempts
- Implement CAPTCHA after 3 failed attempts (optional)

### Authorization Security

**Role-Based Access Control:**
- Validate user role on every protected route
- Check permissions at both middleware and API level
- Never trust client-side role information
- Log unauthorized access attempts

**API Security:**
- Validate authentication on all protected API routes
- Check role permissions before data access
- Sanitize all user inputs
- Use parameterized queries to prevent SQL injection

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
- Encrypt sensitive data at rest (database encryption)

**Personal Data Protection:**
- Hash passwords before storage
- Encrypt sensitive user information
- Implement data retention policies
- Provide data deletion on request
- Comply with GDPR and Indian data protection laws

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
- Server error: "Something went wrong. Please try again or email us at info@bhavan.ai"
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

This design document provides a comprehensive blueprint for building the Bhavan.ai marketing and property management platform. The architecture balances static generation for marketing pages with dynamic server-side rendering for authenticated dashboards, prioritizing performance, security, accessibility, and user experience.

Key design decisions:
- Hybrid rendering: static for marketing, dynamic for dashboards
- Role-based access control with four user types (Admin, Broker, CA, Lawyer)
- Secure authentication with bcrypt password hashing and HTTP-only sessions
- Property approval workflow ensuring quality control
- Component-based architecture for maintainability
- Comprehensive testing strategy including property-based tests
- PostgreSQL database with Prisma ORM for type-safe data access
- Flexible deployment options supporting various hosting platforms
- Mobile-first, accessible design system
- Clear error handling and user feedback

The implementation will follow the task list in tasks.md, building incrementally from database setup and authentication to property management and role-specific dashboards, with testing integrated throughout the development process.
