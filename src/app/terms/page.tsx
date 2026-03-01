
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
      <Link href="/" className="flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
      </Link>
      
      <div className="glass-card p-12 rounded-[3rem] border-primary/10">
        <h1 className="font-headline text-4xl font-bold uppercase mb-8 tracking-tighter">Terms of <span className="text-primary">Service</span></h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-wide mb-2">1. Acceptance of Terms</h2>
            <p>By accessing and using this website, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-wide mb-2">2. Intellectual Property</h2>
            <p>All content on this site, including video previews, images, and text, is the property of JeevanEditz unless otherwise noted. You may not reproduce or use this content without explicit permission.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-wide mb-2">3. Service Agreements</h2>
            <p>Specific project terms, including pricing and timelines, are handled via separate contracts signed between the client and JeevanEditz before work commences.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-wide mb-2">4. Limitation of Liability</h2>
            <p>JeevanEditz will not be liable for any indirect, incidental, or consequential damages resulting from the use of our services or this website.</p>
          </section>

          <section>
            <p className="text-sm mt-12">Last updated: {new Date().toLocaleDateString()}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
