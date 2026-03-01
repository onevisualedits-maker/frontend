
import Link from 'next/link';
import { Youtube, Instagram, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card/30 border-t border-border mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="font-headline font-bold text-2xl uppercase tracking-tighter">
              Frame<span className="text-primary">Craft</span>
            </span>
            <p className="mt-4 text-muted-foreground max-w-xs">
              Elevating visuals and crafting stories through cinematic video editing for creators and brands worldwide.
            </p>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/work" className="hover:text-primary">My Work</Link></li>
              <li><Link href="/services" className="hover:text-primary">Services</Link></li>
              <li><Link href="/about" className="hover:text-primary">About Jeevan</Link></li>
              <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary"><Youtube className="w-5 h-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="w-5 h-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="w-5 h-5" /></Link>
              <Link href="mailto:contact@jeevaneditz.com" className="text-muted-foreground hover:text-primary"><Mail className="w-5 h-5" /></Link>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} JeevanEditz. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
