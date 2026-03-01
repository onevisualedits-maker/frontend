"use client";

import { Star, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

export default function ServicesPage() {
  const firestore = useFirestore();
  const servicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'services'), orderBy('displayOrder', 'asc'));
  }, [firestore]);

  const { data: firebaseServices, isLoading } = useCollection(servicesQuery);
  const packages = firebaseServices || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-14">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-4 animate-fade-up">
          Premium <span className="text-primary">Services</span>
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto animate-fade-up stagger-2">
          Tailored video solutions for creators, startups, and established brands.
        </p>
      </div>

      {/* Packages from Firestore */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 glass-card rounded-[2rem] shimmer" />
          ))}
        </div>
      ) : packages.length > 0 ? (
        <div className="mb-16">
          <div className="text-center mb-10 animate-fade-up">
            <h2 className="font-headline text-3xl font-bold uppercase tracking-tighter mb-3">
              Investment <span className="text-primary">Plans</span>
            </h2>
            <p className="text-sm text-muted-foreground">Transparent pricing for every scale of production.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {packages.map((pkg, idx) => (
              <div
                key={idx}
                className={`relative flex flex-col p-8 rounded-[2rem] border transition-all animate-scale-in stagger-${idx + 1} ${pkg.popular
                    ? 'bg-primary/5 border-primary shadow-2xl scale-105 z-10'
                    : 'glass-card border-white/5'
                  }`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 lavender-gradient px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-white flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3 fill-current" /> Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="font-headline text-2xl font-bold uppercase mb-2">{pkg.title}</h3>
                  <div className="flex items-baseline mb-2">
                    <span className="text-4xl font-bold text-primary">{pkg.priceInfo}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{pkg.shortDescription}</p>
                </div>

                {pkg.longDescription && (
                  <ul className="flex-1 space-y-4 mb-8">
                    {pkg.longDescription.split('\n').filter(Boolean).map((f: string, i: number) => (
                      <li key={i} className="flex items-center text-sm">
                        <Award className="w-4 h-4 text-primary mr-3 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                <Button
                  size="lg"
                  variant={pkg.popular ? 'default' : 'outline'}
                  asChild
                  className={`w-full font-bold h-12 ${pkg.popular ? 'lavender-gradient' : 'glass-card hover:border-primary/50'}`}
                >
                  <Link href="/contact">Choose {pkg.title}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Custom Quote CTA — always visible */}
      <div className="glass-card p-8 rounded-2xl text-center border-primary/20 bg-primary/5 animate-fade-up">
        <h3 className="font-headline text-xl font-bold uppercase mb-3">Need something custom?</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xl mx-auto">
          Every project is unique. If you have a complex production or specific requirements, let&apos;s discuss a tailored quote just for you.
        </p>
        <Button size="lg" asChild className="lavender-gradient">
          <Link href="/contact">Get a Custom Quote</Link>
        </Button>
      </div>
    </div>
  );
}
