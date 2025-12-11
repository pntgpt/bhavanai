import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  Hero, 
  HowItWorks, 
  Features, 
  Marketplace, 
  Pricing, 
  Market,
  Roadmap,
  Team
} from '@/components/sections';

/**
 * Homepage component
 * 
 * Main landing page for Bhavan.ai featuring:
 * - Hero section with headline and CTAs (Task 3)
 * - How It Works section with 4-step process (Task 3)
 * - Features section with platform capabilities (Task 4)
 * - Marketplace section with exit process (Task 4)
 * - Pricing section with fee structure (Task 4)
 * - Market & Validation section with statistics (Task 4)
 * - Roadmap section with 6-month timeline (Task 5)
 * - Team section with founder information (Task 5)
 * 
 * Requirements: 1.1-1.5, 2.1-2.5, 3.1-3.5, 6.1-6.5, 7.1-7.5, 8.1-8.5, 9.1-9.5, 10.1-10.4
 */
export default function Home() {
  return (
    <>
      <Header transparent />
      <main id="main-content">
        {/* Hero Section - Requirements 1.1-1.5 */}
        <Hero />
        
        {/* How It Works Section - Requirements 2.1-2.5 */}
        <HowItWorks />
        
        {/* Features Section - Requirements 3.1-3.5 */}
        <Features />
        
        {/* Marketplace Section - Requirements 6.1-6.5 */}
        <Marketplace />
        
        {/* Pricing Section - Requirements 7.1-7.5 */}
        <Pricing />
        
        {/* Market & Validation Section - Requirements 8.1-8.5 */}
        <Market />
        
        {/* Roadmap Section - Requirements 9.1-9.5 */}
        <Roadmap />
        
        {/* Team Section - Requirements 10.1-10.4 */}
        <Team />
      </main>
      <Footer />
    </>
  );
}
