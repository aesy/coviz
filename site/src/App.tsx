import { Footer } from '@/components/Footer/Footer';
import { Formats } from '@/components/Formats/Formats';
import { Hero } from '@/components/Hero/Hero';
import { Install } from '@/components/Install/Install';
import { Navbar } from '@/components/Navbar/Navbar';
import { Output } from '@/components/Output/Output';
import { page } from '@/components/shared/shared.css';

export default function App() {
  return (
    <div className={page}>
      <Navbar />
      <main id="top">
        <Hero />
        <Formats />
        <Output />
        <Install />
      </main>
      <Footer />
    </div>
  );
}
