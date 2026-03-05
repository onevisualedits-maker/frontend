"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Play, ArrowRight, Video, Zap, Scissors, Clapperboard,
  Award, Users, Tv, Star, CheckCircle, ChevronRight,
  Sparkles, Clock, FileText, MessageSquare, ExternalLink
} from 'lucide-react';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, limit } from 'firebase/firestore';
import { useRef } from 'react';

const PROCESS_STEPS = [
  { step: '01', title: 'Brief & Vision', desc: 'We align on your project goals, audience, tone, and style references.' },
  { step: '02', title: 'Raw Footage Review', desc: 'I analyse all delivered assets and create a structured edit plan.' },
  { step: '03', title: 'First Cut', desc: 'Rough edit delivered for story and pacing approval within agreed timelines.' },
  { step: '04', title: 'Refinement', desc: 'Sound design, colour grade, and motion graphics layered in with precision.' },
  { step: '05', title: 'Final Delivery', desc: 'Export in all required formats — web, broadcast, or social media ready.' },
];

const STATS = [
  { value: '850+', label: 'Projects Completed', icon: Clapperboard },
  { value: '200+', label: 'Happy Clients', icon: Users },
  { value: '7+', label: 'Years Experience', icon: Award },
  { value: '12', label: 'Industry Awards', icon: Star },
];

export default function Home() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-bg');
  const videoRef = useRef<HTMLVideoElement>(null);
  const firestore = useFirestore();

  // ── Hero content ─────────────────────────────────────────────────────────────
  const heroRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'heroContent', 'singleton');
  }, [firestore]);
  const { data: heroContent, isLoading: heroLoading } = useDoc(heroRef);

  const headline = heroContent?.headline || 'Crafting Cinematic Stories';
  const highlight = heroContent?.highlightWord || 'Cinematic';
  const subheadline = heroContent?.subheadline || 'High-impact video editing for visionaries. Transforming raw footage into breathtaking visual experiences.';
  const cta1Text = heroContent?.cta1Text || 'View My Work';
  const cta1Href = heroContent?.cta1Href || '/work';
  const cta2Text = heroContent?.cta2Text || 'Book a Project';
  const cta2Href = heroContent?.cta2Href || '/contact';
  const mediaUrl = heroContent?.mediaUrl || heroImg?.imageUrl || '';
  const mediaType = heroContent?.mediaType || 'image';
  const opacityPct = heroContent?.overlayOpacity ?? 30;
  const parts = headline.split(highlight);

  // ── Featured projects ─────────────────────────────────────────────────────────
  const featuredQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'projects'), orderBy('creationDate', 'desc'), limit(3));
  }, [firestore]);
  const { data: firebaseFeaturedWorks } = useCollection(featuredQuery);
  const featuredWorks = firebaseFeaturedWorks || [];

  // ── Latest blog posts ─────────────────────────────────────────────────────────
  const blogQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'blogPosts'), orderBy('publishDate', 'desc'), limit(2));
  }, [firestore]);
  const { data: blogPosts } = useCollection(blogQuery);

  // ── Services teaser ───────────────────────────────────────────────────────────
  const servicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'services'), orderBy('displayOrder', 'asc'), limit(4));
  }, [firestore]);
  const { data: services, isLoading: servicesLoading } = useCollection(servicesQuery);

  // ── Testimonials (approved only) ──────────────────────────────────────────────
  const testimonialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'testimonials'), orderBy('createdAt', 'desc'), limit(6));
  }, [firestore]);
  const { data: testimonials, isLoading: testimonialsLoading } = useCollection(testimonialsQuery);
  // Show ONLY explicitly admin-approved testimonials
  const approvedTestimonials = (testimonials || []).filter((t: any) => t.approved === true);

  return (
    <div className="flex flex-col gap-32 md:gap-48 pb-32 md:pb-48">

      {/* ══════════════════════════════════════════════════════════════════════
          § 1 — HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative h-[95vh] flex items-center overflow-hidden">
        {heroLoading ? (
          <div className="absolute inset-0 shimmer" />
        ) : (
          <div className="absolute inset-0 z-0">
            {mediaUrl && mediaType === 'video' ? (
              <video
                ref={videoRef}
                src={mediaUrl}
                className="absolute inset-0 w-full h-full object-cover scale-105"
                style={{ opacity: opacityPct / 100 }}
                autoPlay muted loop playsInline
                onEnded={() => { if (videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.play(); } }}
              />
            ) : (
              <Image src={mediaUrl} alt="Hero Background" fill className="object-cover scale-105" style={{ opacity: opacityPct / 100 }} priority />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
          {heroLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-14 bg-white/10 rounded-2xl max-w-xl mx-auto" />
              <div className="h-5 bg-white/10 rounded-xl max-w-md mx-auto" />
              <div className="flex gap-4 justify-center mt-8">
                <div className="h-12 w-36 bg-white/10 rounded-full" />
                <div className="h-12 w-36 bg-white/10 rounded-full" />
              </div>
            </div>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border-primary/30 text-xs font-bold uppercase tracking-widest text-primary mb-6 animate-fade-up">
                <Sparkles className="w-3 h-3" /> Available for new projects
              </div>
              <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-5 leading-tight animate-fade-up stagger-1">
                {parts[0]}<span className="lavender-text-gradient">{highlight}</span>{parts[1]}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-up stagger-2">
                {subheadline}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up stagger-3">
                <Button size="lg" asChild className="lavender-gradient h-12 px-7 text-base font-semibold group animate-glow-pulse">
                  <Link href={cta1Href}>
                    {cta1Text}
                    <Play className="ml-2 w-5 h-5 fill-current group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-7 text-base glass-card border-primary/20 hover:border-primary/50">
                  <Link href={cta2Href}>{cta2Text}</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════════
          § 3 — WHAT I DO (Features)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 w-full py-12 md:py-20">
        <div className="text-center mb-12 animate-fade-up">
          <p className="text-xs text-primary font-bold uppercase tracking-[4px] mb-3">What I Do</p>
          <h2 className="font-headline text-3xl md:text-4xl font-bold uppercase tracking-tighter">
            Premium <span className="text-primary">Craft</span> at Every Level
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Video, title: 'Precision Editing', desc: 'Every frame polished to perfection with industry-standard tools — Premiere Pro, DaVinci Resolve, After Effects.' },
            { icon: Zap, title: 'Lightning Delivery', desc: 'Meeting tight deadlines without ever compromising on visual quality or creative integrity.' },
            { icon: Scissors, title: 'Narrative Flow', desc: 'Expert storytelling that keeps audiences hooked from the first second to the last.' },
          ].map((feature, i) => (
            <div key={i} className={`glass-card p-8 rounded-2xl flex flex-col items-center text-center group hover:border-primary/40 transition-all duration-300 animate-fade-up stagger-${i + 1}`}>
              <div className="w-14 h-14 rounded-2xl lavender-gradient flex items-center justify-center mb-5 shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-headline font-bold text-lg mb-3 uppercase tracking-wide">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          § 4 — FEATURED WORK
      ══════════════════════════════════════════════════════════════════════ */}
      {featuredWorks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 w-full py-12 md:py-20">
          <div className="flex justify-between items-end mb-10 animate-fade-up">
            <div>
              <p className="text-xs text-primary font-bold uppercase tracking-[4px] mb-2">Portfolio</p>
              <h2 className="font-headline text-3xl md:text-4xl font-bold uppercase tracking-tighter">
                Featured <span className="text-primary">Work</span>
              </h2>
            </div>
            <Button variant="link" asChild className="text-primary text-sm group link-underline hidden sm:flex">
              <Link href="/work">View All <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredWorks.map((work, idx) => (
              <Link key={idx} href="/work" className={`group relative aspect-video overflow-hidden rounded-2xl glass-card animate-fade-up stagger-${idx + 1}`}>
                <Image
                  src={work.thumbnailUrl || 'https://picsum.photos/seed/placeholder/800/600'}
                  alt={work.title || 'Project'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-14 h-14 rounded-full lavender-gradient flex items-center justify-center shadow-2xl">
                    <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{work.category}</span>
                  <h4 className="font-headline font-bold text-base text-white mt-0.5">{work.title}</h4>
                  {work.year && <p className="text-xs text-white/50 mt-0.5">{work.year}</p>}
                </div>
              </Link>
            ))}
          </div>
          <div className="sm:hidden text-center mt-6 animate-fade-up">
            <Button variant="outline" asChild className="glass-card border-white/10">
              <Link href="/work">View All Projects <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          § 5 — HOW I WORK (Process)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 w-full py-12 md:py-20">
        <div className="text-center mb-12 animate-fade-up">
          <p className="text-xs text-primary font-bold uppercase tracking-[4px] mb-3">My Process</p>
          <h2 className="font-headline text-3xl md:text-4xl font-bold uppercase tracking-tighter">
            How I <span className="text-primary">Work</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-lg mx-auto">A streamlined workflow built to deliver excellence on every project, every time.</p>
        </div>
        <div className="relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {PROCESS_STEPS.map((step, i) => (
              <div key={i} className={`flex flex-col items-center text-center animate-fade-up stagger-${i + 1}`}>
                <div className="w-16 h-16 rounded-full lavender-gradient flex items-center justify-center font-headline font-black text-white text-lg mb-4 shadow-lg shadow-primary/30 relative z-10">
                  {step.step}
                </div>
                <h4 className="font-headline font-bold text-sm uppercase tracking-wide mb-2">{step.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          § 6 — SERVICES TEASER
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 w-full py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-up">
            <p className="text-xs text-primary font-bold uppercase tracking-[4px] mb-3">Services</p>
            <h2 className="font-headline text-3xl md:text-4xl font-bold uppercase tracking-tighter mb-4">
              Everything You Need <br /><span className="text-primary">Under One Roof</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              From quick social cuts to full-length cinematic productions — every project gets the same obsessive attention to detail.
            </p>
            <Button asChild className="lavender-gradient h-11 px-7 font-bold">
              <Link href="/services">Explore Services <ChevronRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
          <div className="space-y-4 animate-fade-up stagger-2">
            {servicesLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-16 glass-card rounded-xl shimmer" />)
            ) : (services && services.length > 0) ? (
              services.map((service: any, i: number) => (
                <div key={i} className={`glass-card p-5 rounded-xl flex items-center gap-5 group hover:border-primary/40 transition-all duration-300 animate-fade-up stagger-${i + 1}`}>
                  <div className="w-10 h-10 rounded-lg lavender-gradient flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-headline font-bold text-sm uppercase tracking-wide">{service.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{service.shortDescription}</p>
                  </div>
                  {service.priceInfo && (
                    <span className="text-primary font-bold text-sm shrink-0">{service.priceInfo}</span>
                  )}
                </div>
              ))
            ) : null}
          </div>
        </div>
      </section>

      {/* § 7 — TESTIMONIALS (hidden when none approved) */}
      {!testimonialsLoading && approvedTestimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 w-full py-12 md:py-20">
          <div className="text-center mb-12 animate-fade-up">
            <p className="text-xs text-primary font-bold uppercase tracking-[4px] mb-3">Testimonials</p>
            <h2 className="font-headline text-3xl md:text-4xl font-bold uppercase tracking-tighter">
              What Clients <span className="text-primary">Say</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {approvedTestimonials.map((t: any, i: number) => (
              <div key={i} className={`glass-card p-7 rounded-2xl flex flex-col gap-5 group hover:border-primary/40 transition-all duration-300 animate-fade-up stagger-${i + 1}`}>
                <div className="flex gap-1">
                  {Array.from({ length: t.rating || 5 }).map((_: unknown, s: number) => (
                    <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                  <div className="w-9 h-9 rounded-full lavender-gradient flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {t.avatar || t.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          § 8 — LATEST BLOG POSTS
      ══════════════════════════════════════════════════════════════════════ */}
      {blogPosts && blogPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 w-full py-12 md:py-20">
          <div className="flex justify-between items-end mb-10 animate-fade-up">
            <div>
              <p className="text-xs text-primary font-bold uppercase tracking-[4px] mb-2">Blog</p>
              <h2 className="font-headline text-3xl md:text-4xl font-bold uppercase tracking-tighter">
                Latest <span className="text-primary">Insights</span>
              </h2>
            </div>
            <Button variant="link" asChild className="text-primary text-sm group link-underline hidden sm:flex">
              <Link href="/blog">All Articles <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogPosts.map((post: any, idx: number) => (
              <Link key={idx} href="/blog" className={`group glass-card rounded-2xl overflow-hidden flex gap-0 hover:border-primary/40 transition-all duration-300 animate-fade-up stagger-${idx + 1}`}>
                <div className="relative w-32 shrink-0 aspect-square bg-black/40">
                  <Image
                    src={post.featuredImageUrl || 'https://picsum.photos/seed/blog/400/400'}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col justify-between min-w-0">
                  <div>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{post.categoryId || 'Blog'}</span>
                    <h3 className="font-headline font-bold text-base mt-1 leading-tight group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Clock className="w-3 h-3" />
                    {post.readTime ? `${post.readTime} min read` : new Date(post.publishDate).toLocaleDateString()}
                    <span className="ml-auto text-primary font-bold flex items-center gap-1">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          § 9 — CTA BANNER
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 w-full py-12 md:py-20 animate-fade-up">
        <div className="lavender-gradient p-10 md:p-16 rounded-3xl shadow-2xl relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/5 blur-3xl" />

          <div className="relative z-10">
            <MessageSquare className="w-8 h-8 text-white/60 mx-auto mb-4" />
            <h2 className="font-headline text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Ready to bring your vision <br className="hidden md:block" /> to life?
            </h2>
            <p className="text-white/80 text-base mb-8 max-w-xl mx-auto leading-relaxed">
              Let's collaborate on your next project. Professional editing that makes your content impossible to ignore.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="h-12 px-8 text-base font-bold shadow-xl hover:shadow-white/20">
                <Link href="/contact">Start a Conversation</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base font-bold border-white/30 text-white hover:bg-white/10 hover:border-white">
                <Link href="/work">See My Work</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
