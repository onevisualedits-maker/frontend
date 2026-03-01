
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';
import { Calendar, User, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const blogPosts = [
  {
    title: "The Art of the Jump Cut: When to Use It",
    excerpt: "Exploring the technical and psychological impact of one of editing's most famous transitions.",
    date: "March 12, 2024",
    author: "Jeevan",
    image: PlaceHolderImages.find(img => img.id === 'blog-1')?.imageUrl || ''
  },
  {
    title: "Mastering Color Grading in Resolve",
    excerpt: "A deep dive into node structures and achieving a cinematic look from log footage.",
    date: "February 28, 2024",
    author: "Jeevan",
    image: PlaceHolderImages.find(img => img.id === 'project-2')?.imageUrl || ''
  },
  {
    title: "Efficiency Hacks for Premiere Pro 2024",
    excerpt: "Keyboard shortcuts and workflow optimizations that saved me 10 hours a week.",
    date: "February 15, 2024",
    author: "Jeevan",
    image: PlaceHolderImages.find(img => img.id === 'project-3')?.imageUrl || ''
  }
];

export default function BlogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div className="max-w-2xl">
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-6">
            Insights & <span className="text-primary">Process</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Thoughts on video production, industry trends, and the creative journey.
          </p>
        </div>
        <Button asChild className="lavender-gradient group">
          <Link href="/blog/generator">
            <Sparkles className="w-4 h-4 mr-2" /> AI Post Ideas
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {blogPosts.map((post, idx) => (
          <article key={idx} className="group glass-card rounded-3xl overflow-hidden flex flex-col h-full hover:border-primary/50 transition-colors">
            <div className="relative aspect-video">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-center gap-4 text-xs text-muted-foreground font-bold uppercase tracking-widest mb-4">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
              </div>
              <h2 className="font-headline text-2xl font-bold mb-4 group-hover:text-primary transition-colors">{post.title}</h2>
              <p className="text-muted-foreground mb-6 line-clamp-2">
                {post.excerpt}
              </p>
              <div className="mt-auto">
                <Link href="#" className="flex items-center text-sm font-bold text-primary uppercase tracking-widest hover:gap-2 transition-all">
                  Read Article <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Featured Newsletter CTA */}
      <div className="mt-32 glass-card p-12 rounded-[3rem] text-center border-primary/20 bg-primary/5">
        <h2 className="font-headline text-3xl font-bold uppercase mb-4 tracking-tighter">Stay in the loop</h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Get editing tips, industry news, and my latest project breakdowns delivered straight to your inbox.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-grow glass-card border-white/10 px-6 py-3 rounded-full text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button className="lavender-gradient px-8 py-3 rounded-full font-bold">Subscribe</Button>
        </div>
      </div>
    </div>
  );
}
