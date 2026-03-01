
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
      <Link href="/" className="flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
      </Link>
      
      <div className="glass-card p-12 rounded-[3rem] border-primary/10">
        <h1 className="font-headline text-4xl font-bold uppercase mb-8 tracking-tighter">Privacy <span className="text-primary">Policy</span></h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-wide mb-2">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you fill out our contact form or subscribe to our newsletter. This includes your name, email address, and any project details you share.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-wide mb-2">2. How We Use Your Information</h2>
            <p>We use the information we collect to communicate with you about your project inquiries, send you newsletters if you've subscribed, and improve our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-wide mb-2">3. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing and against accidental loss, destruction, or damage.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-wide mb-2">4. Third-Party Services</h2>
            <p>We may use third-party services like Google Analytics or email providers. These services have their own privacy policies governing how they handle your data.</p>
          </section>

          <section>
            <p className="text-sm mt-12">Last updated: {new Date().toLocaleDateString()}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
