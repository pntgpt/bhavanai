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

## Features

- ✅ Static site generation for optimal performance
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for utility-first styling
- ✅ Responsive design (mobile-first)
- ✅ SEO optimized with meta tags and structured data
- ✅ WCAG AA accessibility compliance
- ✅ Google Analytics 4 integration
- ✅ Form submission with multiple backend options
- ✅ Lazy loading for images
- ✅ Optimized for Lighthouse score > 90

## License

ISC

## Contact

For questions or support, contact: hello@bhavan.ai
