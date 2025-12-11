import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Hero, HowItWorks } from '@/components/sections';

/**
 * Homepage component
 * 
 * Main landing page for Bhavan.ai featuring:
 * - Hero section with headline and CTAs (Task 3)
 * - How It Works section with 4-step process (Task 3)
 * - Additional sections will be added in subsequent tasks
 * 
 * Requirements: 1.1-1.5, 2.1-2.5
 */
export default function Home() {
  return (
    <>
      <Header transparent />
      <main>
        {/* Hero Section - Requirements 1.1-1.5 */}
        <Hero />
        
        {/* How It Works Section - Requirements 2.1-2.5 */}
        <HowItWorks />
        
        {/* Additional sections will be added in task 4 and beyond */}
      </main>
      <Footer />
    </>
  );
}
