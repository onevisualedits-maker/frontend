"use client";

import Image from 'next/image';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';
import { Scissors, Award, Users, Tv } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function AboutPage() {
  const placeholderImg = PlaceHolderImages.find(img => img.id === 'about-jeevan');

  const firestore = useFirestore();
  const aboutRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'aboutPageContent', 'singleton');
  }, [firestore]);

  const { data: aboutData, isLoading } = useDoc(aboutRef);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center animate-pulse">
          <div className="max-w-sm mx-auto w-full aspect-[4/5] rounded-3xl bg-white/5 shimmer" />
          <div className="space-y-4">
            <div className="h-12 bg-white/10 rounded-2xl w-3/4" />
            <div className="h-4 bg-white/10 rounded-xl w-1/2" />
            <div className="h-4 bg-white/5 rounded-xl w-full" />
            <div className="h-4 bg-white/5 rounded-xl w-5/6" />
            <div className="h-4 bg-white/5 rounded-xl w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="relative group max-w-sm mx-auto w-full animate-fade-up">
          <div className="absolute -inset-4 lavender-gradient opacity-20 blur-2xl group-hover:opacity-40 transition-opacity rounded-full" />
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden glass-card shadow-xl animate-float">
            <Image
              src={aboutData?.profileImageUrl || placeholderImg?.imageUrl || ''}
              alt={aboutData?.header || 'JeevanEditz Profile'}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          {/* Floating Stats */}
          <div className="absolute -bottom-4 -right-4 glass-card p-4 rounded-xl shadow-lg hidden md:block">
            <p className="text-2xl font-bold lavender-text-gradient font-headline">7+ Years</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Industry Experience</p>
          </div>
        </div>

        <div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-3 leading-none animate-fade-up">
            {aboutData?.header
              ? <span dangerouslySetInnerHTML={{ __html: aboutData.header.replace('Jeevan', '<span class="text-primary">Jeevan</span>') }} />
              : <>I am <span className="text-primary">Jeevan</span> <br /> the Editor.</>}
          </h1>
          {aboutData?.tagline && (
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-4 animate-fade-up stagger-1">{aboutData.tagline}</p>
          )}
          <div className="space-y-4 text-base text-muted-foreground leading-relaxed whitespace-pre-wrap animate-fade-up stagger-2">
            {aboutData?.content || `I believe every frame tells a story. Based in a digital-first studio, I’ve spent the last decade perfecting the art of visual rhythm and cinematic narrative.\n\nFrom raw footage to viral hits, I collaborate with creators and brands who aren't afraid to push creative boundaries. My approach combines technical precision with an intuitive sense of timing, emotion, and pace.\n\nWhether it's a 30-second commercial or a 20-minute documentary, my goal is the same: to create a visual experience that resonates long after the screen goes black.`}
          </div>

          <div className="grid grid-cols-2 gap-6 mt-10">
            {[
              { icon: Users, label: "Clients Worldwide", value: "200+" },
              { icon: Tv, label: "Projects Completed", value: "850+" },
              { icon: Award, label: "Creative Awards", value: "12" },
              { icon: Scissors, label: "Frames Cut", value: "1M+" }
            ].map((stat, i) => (
              <div key={i} className={`flex items-center gap-4 animate-fade-up stagger-${i + 3}`}>
                <div className="w-10 h-10 rounded-lg glass-card flex items-center justify-center text-primary">
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-bold font-headline">{stat.value}</p>
                  <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-tighter">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-20">
        <h2 className="font-headline text-3xl font-bold uppercase tracking-tighter text-center mb-10">My Artistic <span className="text-primary">Vision</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Emotional Resonance", desc: "Editing is more than cutting clips; it's about pacing the emotional heartbeat of the story." },
            { title: "Visual Precision", desc: "Every pixel and frame is scrutinized to ensure a seamless and high-fidelity visual experience." },
            { title: "Adaptive Style", desc: "I pride myself on being a stylistic chameleon, matching the specific aesthetic of any brand or creator." }
          ].map((vision, i) => (
            <div key={i} className={`glass-card p-6 rounded-2xl text-center border-t-4 border-t-primary animate-scale-in stagger-${i + 1}`}>
              <h3 className="font-headline text-lg font-bold mb-2 uppercase">{vision.title}</h3>
              <p className="text-sm text-muted-foreground">{vision.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
