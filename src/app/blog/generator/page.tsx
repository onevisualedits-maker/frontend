
"use client";

import { useState } from 'react';
import { generateBlogIdeas } from '@/ai/flows/generate-blog-ideas-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, Loader2, Lightbulb, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BlogGeneratorPage() {
  const [keywords, setKeywords] = useState('');
  const [ideas, setIdeas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!keywords) return;
    setLoading(true);
    try {
      const result = await generateBlogIdeas({ keywords });
      setIdeas(result.blogIdeas);
    } catch (error) {
      console.error("Failed to generate ideas:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
      <Link href="/blog" className="flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Blog
      </Link>

      <div className="text-center mb-16">
        <h1 className="font-headline text-5xl font-bold tracking-tighter uppercase mb-4">
          AI Idea <span className="text-primary">Generator</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Running low on creative spark? Let AI help you brainstorm your next viral article.
        </p>
      </div>

      <Card className="glass-card border-primary/20 shadow-2xl overflow-hidden mb-12">
        <CardHeader className="bg-primary/5 p-8">
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Sparkles className="text-primary w-6 h-6" /> What's on your mind?
          </CardTitle>
          <CardDescription>
            Enter keywords or industry trends like "Davinci Resolve", "AI in Cinema", or "Storytelling Tips".
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="e.g., Color Grading, Motion Graphics 2024..."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="glass-card border-white/20 h-12 text-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <Button
              onClick={handleGenerate}
              disabled={loading || !keywords}
              className="lavender-gradient h-12 px-8 font-bold min-w-[160px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
              Generate Ideas
            </Button>
          </div>
        </CardContent>
      </Card>

      {ideas.length > 0 && (
        <div className="space-y-6">
          <h3 className="font-headline text-2xl font-bold uppercase flex items-center gap-2">
            <Lightbulb className="text-primary" /> Generated Ideas
          </h3>
          <div className="grid gap-4">
            {ideas.map((idea, idx) => (
              <div
                key={idx}
                className="glass-card p-6 rounded-2xl border-l-4 border-l-primary flex justify-between items-center group hover:bg-white/5 transition-colors animate-in slide-in-from-bottom-2 duration-300"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <p className="text-lg font-medium">{idea}</p>
                <Button variant="ghost" className="text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Use This
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
