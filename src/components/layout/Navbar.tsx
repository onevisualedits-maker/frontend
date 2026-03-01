
"use client";

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Work', href: '/work' },
  { name: 'Services', href: '/services' },
  { name: 'About', href: '/about' },
  { name: 'Blog', href: '/blog' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Hide Navbar on admin, login and setup pages
  const isAdminPath = pathname?.startsWith('/admin');
  const isAuthPath = pathname === '/login' || pathname === '/setup';
  
  if (isAdminPath || isAuthPath) return null;

  return (
    <nav className="sticky top-0 z-50 w-full glass-card border-b-0 border-x-0 rounded-none bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <PlayCircle className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-headline font-bold text-xl tracking-tight uppercase">
              Frame<span className="text-primary">Craft</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Button asChild className="lavender-gradient hover:opacity-90 transition-opacity">
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground p-2 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className={cn(
        "md:hidden absolute w-full glass-card border-x-0 transition-all duration-300 ease-in-out",
        isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
      )}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-base font-medium hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <div className="px-3 py-2">
            <Button asChild className="w-full lavender-gradient">
              <Link href="/contact" onClick={() => setIsOpen(false)}>Get in Touch</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
