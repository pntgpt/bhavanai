import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

/**
 * Homepage component
 * This is the main landing page for Bhavan.ai
 * Will be populated with Hero, HowItWorks, Features, and other sections in subsequent tasks
 */
export default function Home() {
  return (
    <>
      <Header transparent />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-16 pt-32">
          <h1 className="text-5xl font-bold text-center mb-4">
            Turn rent into home ownership
          </h1>
          <p className="text-xl text-center text-gray-600">
            Co-own a home with 2–5 people via a compliant SPV
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
