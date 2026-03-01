"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';
import { Calendar, User, ArrowRight, Sparkles, Loader2, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BlogPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const blogQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'blogPosts'), orderBy('publishDate', 'desc'));
  }, [firestore]);

  const { data: firebasePosts, isLoading } = useCollection(blogQuery);
  const blogPosts = firebasePosts || [];

  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [subEmail, setSubEmail] = useState('');
  const [subLoading, setSubLoading] = useState(false);
  const [subDone, setSubDone] = useState(false);

  async function handleSubscribe() {
    if (!subEmail || subDone) return;
    setSubLoading(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setSubDone(true);
        toast({
          title: data.alreadySubscribed ? 'Already subscribed! 🎉' : 'Subscribed! 🎉',
          description: data.alreadySubscribed
            ? "You're already on the list."
            : "You'll get an email when a new article drops.",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Subscription failed', description: err.message || 'Please try again.' });
    } finally {
      setSubLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div className="max-w-2xl">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-4 animate-fade-up">
            Insights & <span className="text-primary">Process</span>
          </h1>
          <p className="text-base text-muted-foreground animate-fade-up stagger-2">
            Thoughts on video production, industry trends, and the creative journey.
          </p>
        </div>
        <div className="animate-fade-up stagger-3">
          <Button asChild className="lavender-gradient group">
            <Link href="/blog/generator">
              <Sparkles className="w-4 h-4 mr-2" /> AI Post Ideas
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {isLoading && <p className="col-span-full py-20 text-center text-muted-foreground shimmer rounded-2xl">Loading posts...</p>}
        {blogPosts.map((post: any, idx) => (
          <article
            key={idx}
            onClick={() => setSelectedPost(post)}
            className={`group glass-card rounded-3xl overflow-hidden flex flex-col h-full hover:border-primary/50 cursor-pointer animate-fade-up stagger-${Math.min(idx + 1, 6)}`}
          >
            <div className="relative aspect-video">
              <Image
                src={post.featuredImageUrl || 'https://picsum.photos/seed/placeholder/800/600'}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-center gap-4 text-xs text-muted-foreground font-bold uppercase tracking-widest mb-4">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.publishDate).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author || 'Jeevan'}</span>
              </div>
              <h2 className="font-headline text-2xl font-bold mb-4 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h2>
              <p className="text-muted-foreground mb-6 line-clamp-3">
                {post.content ? `${post.content.substring(0, 150)}...` : ''}
              </p>
              <div className="mt-auto">
                <span className="flex items-center text-sm font-bold text-primary uppercase tracking-widest hover:gap-2 transition-all link-underline">
                  Read Article <ArrowRight className="ml-2 w-4 h-4" />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Newsletter CTA */}
      <div className="mt-20 glass-card p-8 rounded-3xl text-center border-primary/20 bg-primary/5 animate-fade-up">
        <h2 className="font-headline text-2xl font-bold uppercase mb-3 tracking-tighter">Stay in the loop</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-lg mx-auto">
          Get editing tips, industry news, and my latest project breakdowns delivered straight to your inbox.
        </p>

        {subDone ? (
          <div className="flex items-center justify-center gap-2 text-green-400 font-bold animate-fade-up">
            <CheckCircle className="w-5 h-5" /> You&apos;re subscribed!
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={subEmail}
              onChange={e => setSubEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
              placeholder="your@email.com"
              className="flex-grow glass-card border-white/10 px-6 py-3 rounded-full text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button
              onClick={handleSubscribe}
              disabled={subLoading || !subEmail}
              className="lavender-gradient px-8 py-3 rounded-full font-bold"
            >
              {subLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
            </Button>
          </div>
        )}
      </div>
      {/* ── Blog Post Modal ── */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background/98 border-white/10 shadow-2xl p-0 gap-0">
          {selectedPost && (
            <div className="animate-fade-in">
              <div className="relative aspect-video w-full rounded-t-xl overflow-hidden">
                <Image src={selectedPost.featuredImageUrl || 'https://picsum.photos/seed/p/1200/600'} alt={selectedPost.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
              </div>

              <div className="px-6 md:px-12 py-8 md:py-12 -mt-20 relative z-10">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="bg-primary/20 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded">
                    {selectedPost.categoryId || 'Article'}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedPost.readTime || '5'} min read
                  </div>
                </div>

                <DialogTitle className="font-headline text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-8">
                  {selectedPost.title}
                </DialogTitle>

                <div className="flex items-center gap-4 py-6 border-y border-white/10 mb-10">
                  <div className="w-10 h-10 rounded-full lavender-gradient flex items-center justify-center text-white font-black">
                    {selectedPost.author?.[0] || 'J'}
                  </div>
                  <div>
                    <p className="font-bold text-sm tracking-tight">{selectedPost.author || 'Jeevan'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(selectedPost.publishDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="prose prose-invert prose-violet max-w-none text-muted-foreground leading-relaxed selection:bg-primary/30">
                  <div className="whitespace-pre-wrap text-lg font-body">
                    {selectedPost.content}
                  </div>
                </div>

                <div className="mt-16 pt-8 border-t border-white/10 text-center">
                  <Button onClick={() => setSelectedPost(null)} variant="ghost" className="text-muted-foreground hover:text-primary">
                    Close Article
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
