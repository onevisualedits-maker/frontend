
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight, Video, Zap, Scissors } from 'lucide-react';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';

export default function Home() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-bg');
  const featuredWorks = PlaceHolderImages.filter(img => img.id.startsWith('project-')).slice(0, 3);

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImg?.imageUrl || ''}
            alt="Hero Background"
            fill
            className="object-cover opacity-30 scale-105"
            priority
            data-ai-hint="lavender abstract"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
          <h1 className="font-headline text-5xl md:text-8xl font-bold tracking-tight mb-6 leading-tight">
            Crafting <span className="lavender-text-gradient">Cinematic</span> Stories
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            High-impact video editing for visionaries. Transforming raw footage into breathtaking visual experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="lavender-gradient h-14 px-8 text-lg font-semibold group">
              <Link href="/work">
                View My Work
                <Play className="ml-2 w-5 h-5 fill-current group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-14 px-8 text-lg glass-card border-primary/20 hover:border-primary/50">
              <Link href="/contact">Book a Project</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats/Features snippet */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Video, title: "Precision Editing", desc: "Every frame polished to perfection with industry-standard software." },
            { icon: Zap, title: "Lightning Fast", desc: "Meeting tight deadlines without compromising on visual quality." },
            { icon: Scissors, title: "Narrative Flow", desc: "Expert storytelling that keeps your audience hooked from start to finish." }
          ].map((feature, i) => (
            <div key={i} className="glass-card p-8 rounded-2xl flex flex-col items-center text-center">
              <feature.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-headline font-bold text-xl mb-2 uppercase tracking-wide">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects Preview */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-headline text-4xl font-bold mb-4 uppercase tracking-tighter">Featured <span className="text-primary">Work</span></h2>
            <p className="text-muted-foreground text-lg">A glimpse into recent productions.</p>
          </div>
          <Button variant="link" asChild className="text-primary text-lg group">
            <Link href="/work">
              View All Projects <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredWorks.map((work, idx) => (
            <Link key={idx} href="/work" className="group relative aspect-video overflow-hidden rounded-xl glass-card">
              <Image
                src={work.imageUrl}
                alt={work.description}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                data-ai-hint={work.imageHint}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <Play className="w-12 h-12 text-white fill-current opacity-80" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform">
                <h4 className="font-headline font-bold text-lg text-white drop-shadow-md">{work.description}</h4>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 w-full text-center">
        <div className="lavender-gradient p-12 md:p-20 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mb-6 relative z-10 leading-tight">Ready to bring your vision <br className="hidden md:block"/> to life?</h2>
          <p className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto relative z-10">
            Let's collaborate on your next project. Professional editing that makes your content stand out.
          </p>
          <Button size="lg" variant="secondary" asChild className="h-14 px-10 text-lg font-bold shadow-lg hover:shadow-primary/40 relative z-10">
            <Link href="/contact">Start a Conversation</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
