
import { Check, Scissors, Zap, Film, Award, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const services = [
  {
    icon: Scissors,
    title: "Cinematic Editing",
    desc: "Complete narrative-driven video editing for high-end productions.",
    features: ["4K Footage Support", "Sound Design", "Standard Color Grade", "2 Revision Rounds"]
  },
  {
    icon: Film,
    title: "Commercial & Ad",
    desc: "Short-form, high-impact videos designed to capture attention and convert.",
    features: ["VFX Integration", "Motion Graphics", "Stock Media Sourcing", "Fast Turnaround"]
  },
  {
    icon: Zap,
    title: "Social Media Kits",
    desc: "Optimized content for TikTok, Reels, and Shorts to boost your digital presence.",
    features: ["Vertical Formatting", "Captions & Subtitles", "Viral Hook Editing", "Bulk Discounts"]
  }
];

const packages = [
  {
    name: "Standard",
    price: "499",
    desc: "Perfect for content creators and YouTubers.",
    features: ["Up to 10 min raw footage", "Standard transitions", "Royalty-free music", "7-day delivery", "1 Revision"],
    popular: false
  },
  {
    name: "Professional",
    price: "999",
    desc: "Best for brands and high-quality storytelling.",
    features: ["Unlimited raw footage", "Advanced color grading", "Custom sound design", "4-day delivery", "3 Revisions", "Motion Graphics"],
    popular: true
  },
  {
    name: "Masterclass",
    price: "1999",
    desc: "Full-scale production for epic results.",
    features: ["Multi-cam sync", "Full VFX & Compositing", "Priority Support", "2-day delivery", "Unlimited Revisions", "Source Files Provided"],
    popular: false
  }
];

export default function ServicesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
      <div className="text-center mb-24">
        <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-6">
          Premium <span className="text-primary">Services</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Tailored video solutions for creators, startups, and established brands.
        </p>
      </div>

      {/* Service Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-32">
        {services.map((service, idx) => (
          <div key={idx} className="glass-card p-10 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <service.icon className="w-24 h-24 text-primary" />
            </div>
            <service.icon className="w-12 h-12 text-primary mb-6" />
            <h3 className="font-headline text-2xl font-bold mb-4 uppercase tracking-wide">{service.title}</h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">{service.desc}</p>
            <ul className="space-y-3">
              {service.features.map((f, i) => (
                <li key={i} className="flex items-center text-sm text-foreground/80">
                  <Check className="w-4 h-4 text-primary mr-3 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Pricing Table */}
      <div className="mb-24">
        <div className="text-center mb-16">
          <h2 className="font-headline text-4xl font-bold uppercase tracking-tighter mb-4">Investment <span className="text-primary">Plans</span></h2>
          <p className="text-muted-foreground">Transparent pricing for every scale of production.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {packages.map((pkg, idx) => (
            <div
              key={idx}
              className={`relative flex flex-col p-8 rounded-[2rem] border transition-all ${
                pkg.popular
                  ? "bg-primary/5 border-primary shadow-2xl scale-105 z-10"
                  : "glass-card border-white/5"
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 lavender-gradient px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-white flex items-center gap-1 shadow-lg">
                  <Star className="w-3 h-3 fill-current" /> Most Popular
                </div>
              )}
              <div className="mb-8">
                <h3 className="font-headline text-2xl font-bold uppercase mb-2">{pkg.name}</h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-4xl font-bold">$</span>
                  <span className="text-6xl font-bold tracking-tighter">{pkg.price}</span>
                  <span className="text-muted-foreground ml-1">/project</span>
                </div>
                <p className="text-sm text-muted-foreground">{pkg.desc}</p>
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-center text-sm">
                    <Award className="w-4 h-4 text-primary mr-3 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                variant={pkg.popular ? "default" : "outline"}
                asChild
                className={`w-full font-bold h-12 ${pkg.popular ? "lavender-gradient" : "glass-card hover:border-primary/50"}`}
              >
                <Link href="/contact">Choose {pkg.name}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Sneak Peek */}
      <div className="glass-card p-12 rounded-[2rem] text-center border-primary/20 bg-primary/5">
        <h3 className="font-headline text-2xl font-bold uppercase mb-4">Need something custom?</h3>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Every project is unique. If you have a complex production or specific requirements, let's discuss a tailored quote just for you.
        </p>
        <Button size="lg" asChild className="lavender-gradient">
          <Link href="/contact">Get a Custom Quote</Link>
        </Button>
      </div>
    </div>
  );
}
