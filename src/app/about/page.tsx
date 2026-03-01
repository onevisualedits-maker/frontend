
import Image from 'next/image';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';
import { Scissors, Award, Users, Tv } from 'lucide-react';

export default function AboutPage() {
  const profileImg = PlaceHolderImages.find(img => img.id === 'about-jeevan');

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="relative group">
          <div className="absolute -inset-4 lavender-gradient opacity-20 blur-2xl group-hover:opacity-40 transition-opacity rounded-full" />
          <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden glass-card shadow-2xl">
            <Image
              src={profileImg?.imageUrl || ''}
              alt="JeevanEditz Profile"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              data-ai-hint="professional video editor"
            />
          </div>
          {/* Floating Stats */}
          <div className="absolute -bottom-6 -right-6 glass-card p-6 rounded-2xl shadow-xl hidden md:block">
            <p className="text-3xl font-bold lavender-text-gradient font-headline">7+ Years</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Industry Experience</p>
          </div>
        </div>

        <div>
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-8 leading-none">
            I am <span className="text-primary">Jeevan</span> <br /> the Editor.
          </h1>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              I believe every frame tells a story. Based in a digital-first studio, I’ve spent the last decade perfecting the art of visual rhythm and cinematic narrative.
            </p>
            <p>
              From raw footage to viral hits, I collaborate with creators and brands who aren't afraid to push creative boundaries. My approach combines technical precision with an intuitive sense of timing, emotion, and pace.
            </p>
            <p>
              Whether it's a 30-second commercial or a 20-minute documentary, my goal is the same: to create a visual experience that resonates long after the screen goes black.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-12">
            {[
              { icon: Users, label: "Clients Worldwide", value: "200+" },
              { icon: Tv, label: "Projects Completed", value: "850+" },
              { icon: Award, label: "Creative Awards", value: "12" },
              { icon: Scissors, label: "Frames Cut", value: "1M+" }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center text-primary">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xl font-bold font-headline">{stat.value}</p>
                  <p className="text-xs uppercase text-muted-foreground font-bold tracking-tighter">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-32">
        <h2 className="font-headline text-4xl font-bold uppercase tracking-tighter text-center mb-16">My Artistic <span className="text-primary">Vision</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Emotional Resonance", desc: "Editing is more than cutting clips; it's about pacing the emotional heartbeat of the story." },
            { title: "Visual Precision", desc: "Every pixel and frame is scrutinized to ensure a seamless and high-fidelity visual experience." },
            { title: "Adaptive Style", desc: "I pride myself on being a stylistic chameleon, matching the specific aesthetic of any brand or creator." }
          ].map((vision, i) => (
            <div key={i} className="glass-card p-10 rounded-3xl text-center border-t-4 border-t-primary">
              <h3 className="font-headline text-xl font-bold mb-4 uppercase">{vision.title}</h3>
              <p className="text-muted-foreground">{vision.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
