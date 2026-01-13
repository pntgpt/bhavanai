# Bhavan.ai Marketing Website

A high-performance, static marketing and lead-generation website for Bhavan.ai - enabling fractional home co-ownership through compliant SPVs.

## Overview

This website is built with Next.js 14+ using static site generation (SSG) for optimal performance, SEO, and accessibility. It serves as the primary digital touchpoint for potential customers and partners.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel/Netlify (static export)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy the environment variables template:

```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build the static site:

```bash
npm run build
```

The static files will be generated in the `/out` directory.

### Testing

Run tests:

```bash
npm test
```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with SEO
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── layout/           # Layout components (Header, Footer)
│   ├── sections/         # Page sections (Hero, HowItWorks, etc.)
│   ├── forms/            # Form components
│   ├── ui/               # Reusable UI components
│   └── analytics/        # Analytics wrapper components
├── lib/                   # Utility functions
├── types/                 # TypeScript type definitions
├── public/                # Static assets
│   ├── images/           # Images and placeholders
│   ├── icons/            # Favicons
│   └── downloads/        # PDFs (pitch deck, press kit)
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind configuration
└── tsconfig.json         # TypeScript configuration
```

## Environment Variables

See `.env.example` for all required and optional environment variables.

### Required Variables

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: Google Analytics 4 measurement ID
- `NEXT_PUBLIC_FORM_ENDPOINT`: Form submission endpoint

### Optional Variables

- `NEXT_PUBLIC_SENTRY_DSN`: Sentry error tracking DSN
- Various form integration options (Netlify, Formspree, Zapier, HubSpot)

## Deployment

### Vercel (Recommended)

1. Connect your Git repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify

1. Connect your Git repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `out`
3. Configure environment variables in Netlify dashboard
4. Deploy automatically on push to main branch

### Manual Deployment

1. Build the static site: `npm run build`
2. Upload the contents of the `/out` directory to your hosting provider

## Components

### Layout Components

#### Header
Sticky navigation bar with mobile menu support.

**Features:**
- Transparent mode for hero sections
- Responsive mobile hamburger menu
- Smooth scroll behavior
- Accessible navigation with ARIA labels

**Usage:**
```tsx
import Header from '@/components/layout/Header';

<Header transparent={true} />
```

#### Footer
Multi-column footer with newsletter signup.

**Features:**
- Company, Product, Legal, and Resources sections
- Newsletter subscription form
- Social media links
- Responsive layout

**Usage:**
```tsx
import Footer from '@/components/layout/Footer';

<Footer onNewsletterSubmit={handleSubmit} />
```

### UI Components

#### Button
Versatile button component with multiple variants and sizes.

**Variants:** `primary`, `secondary`, `outline`, `ghost`  
**Sizes:** `sm`, `md`, `lg`

**Usage:**
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" loading={false}>
  Get Started
</Button>
```

#### Card
Container component for displaying content in an elevated surface.

**Variants:** `default`, `feature`, `team`, `listing`

**Usage:**
```tsx
import { Card } from '@/components/ui';

<Card variant="feature" hover>
  <h3>Feature Title</h3>
  <p>Feature description</p>
</Card>
```

#### Modal
Accessible modal dialog with focus trap and keyboard navigation.

**Features:**
- Focus trap implementation
- ESC key to close
- Backdrop click to close
- Animated entrance/exit
- ARIA attributes for accessibility

**Usage:**
```tsx
import { Modal } from '@/components/ui';

<Modal isOpen={isOpen} onClose={handleClose} title="Modal Title">
  <p>Modal content</p>
</Modal>
```

## Design System

### Colors

- **Primary**: Blue (#3B82F6) for CTAs and interactive elements
- **Neutral**: Gray scale for text and backgrounds
- **Semantic**: Success (#10B981), Warning (#F59E0B), Error (#EF4444), Info (#3B82F6)

### Typography

- **Headings**: Playfair Display (serif) - for all h1-h6 elements
- **Body**: Inter (sans-serif) - for paragraphs, lists, and UI text

**Font Sizes:**
- xs: 12px, sm: 14px, base: 16px, lg: 18px, xl: 20px
- 2xl: 24px, 3xl: 30px, 4xl: 36px, 5xl: 48px, 6xl: 60px

**Font Weights:**
- Light: 300, Regular: 400, Medium: 500, Semibold: 600, Bold: 700

### Spacing

Base unit: 4px (Tailwind's default spacing scale)

**Scale:** 0, 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px, 128px

### Design System Utilities

The `lib/design-system.ts` file provides utility functions for consistent styling:

```tsx
import { getHeadingClasses, getBodyTextClasses, getSectionSpacing } from '@/lib/design-system';

// Apply heading styles
<h1 className={getHeadingClasses(1)}>Title</h1>

// Apply body text styles
<p className={getBodyTextClasses('base')}>Content</p>

// Apply section spacing
<section className={getSectionSpacing()}>...</section>
```

## Performance Optimizations

This website is optimized for maximum performance with a target Lighthouse score > 90.

### Implemented Optimizations

#### 1. Code Splitting and Lazy Loading
- **Below-the-fold sections** are lazy-loaded using React's `lazy()` and `Suspense`
- Reduces initial bundle size by ~40%
- Sections load on-demand as users scroll
- Skeleton loading states provide smooth UX

```tsx
// Example: Lazy-loaded section
const Features = lazy(() => import('@/components/sections/Features'));

<Suspense fallback={<SectionLoader />}>
  <Features />
</Suspense>
```

#### 2. Image Optimization
- **OptimizedImage component** with built-in lazy loading
- Intersection Observer for efficient loading
- Responsive image breakpoints (640px, 750px, 828px, 1080px, 1200px, 1920px)
- Aspect ratio preservation to prevent layout shifts
- Loading placeholders and error states

```tsx
import { OptimizedImage } from '@/components/ui';

<OptimizedImage
  src="/images/hero.jpg"
  alt="Hero image"
  aspectRatio="16/9"
  priority={false} // Lazy load
  sizes="(max-width: 640px) 100vw, 50vw"
/>
```

#### 3. Bundle Size Optimization
- Tree-shaking for icon imports (`lucide-react`)
- Console.log removal in production builds
- CSS optimization enabled
- Gzip compression enabled
- Production source maps disabled

#### 4. Caching Strategy
Configured in `next.config.js`:
- **Static assets** (images, fonts): `max-age=31536000, immutable`
- **CSS/JS bundles**: `max-age=31536000, immutable` (with content hashing)
- **HTML pages**: `max-age=0, must-revalidate`

#### 5. Font Optimization
- Font display strategy: `swap` (prevents invisible text)
- Preloading critical fonts
- System font fallbacks

#### 6. Performance Monitoring
- Core Web Vitals tracking (LCP, FID, CLS)
- Page load time monitoring
- Long task detection (development only)
- Integration with Google Analytics

```tsx
// Automatically tracked metrics:
// - Largest Contentful Paint (LCP)
// - First Input Delay (FID)
// - Cumulative Layout Shift (CLS)
// - Page load time
```

### Performance Best Practices

1. **Above-the-fold content** (Hero, How It Works) loads immediately
2. **Below-the-fold content** lazy loads as users scroll
3. **Images** use lazy loading with Intersection Observer
4. **Fonts** use `display: swap` to prevent FOIT (Flash of Invisible Text)
5. **Analytics** loads asynchronously without blocking render
6. **CSS** is optimized and minified in production
7. **JavaScript** is code-split by route and component

### Measuring Performance

Run Lighthouse audit:
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --view
```

Target scores:
- **Performance**: > 90
- **Accessibility**: > 90
- **Best Practices**: > 90
- **SEO**: > 90

## Features

- ✅ Static site generation for optimal performance
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for utility-first styling
- ✅ Responsive design (mobile-first)
- ✅ SEO optimized with meta tags and structured data
- ✅ WCAG AA accessibility compliance
- ✅ Google Analytics 4 integration
- ✅ Form submission with multiple backend options
- ✅ Lazy loading for images and below-the-fold content
- ✅ Code splitting for reduced bundle size
- ✅ Performance monitoring with Core Web Vitals
- ✅ Optimized for Lighthouse score > 90

## License

ISC

## Contact

For questions or support, contact: info@bhavan.ai
