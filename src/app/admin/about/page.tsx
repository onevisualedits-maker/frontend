'use client';

import { useState, useEffect } from 'react';
import { useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Save, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminAboutManagement() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const aboutRef = useMemoFirebase(() => doc(firestore, 'aboutPageContent', 'singleton'), [firestore]);
  const { data: aboutData, isLoading } = useDoc(aboutRef);
  
  const [content, setContent] = useState('');

  useEffect(() => {
    if (aboutData) {
      setContent(aboutData.content || '');
    }
  }, [aboutData]);

  function handleSave() {
    setDocumentNonBlocking(aboutRef, {
      id: 'singleton',
      content,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    
    toast({
      title: "Success",
      description: "About page content updated successfully.",
    });
  }

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-headline text-4xl font-bold uppercase tracking-tighter mb-2">
          Manage <span className="text-primary">About Page</span>
        </h1>
        <p className="text-muted-foreground">Edit the main narrative and content for your about page.</p>
      </div>

      <Card className="glass-card border-white/10 shadow-2xl overflow-hidden">
        <CardHeader className="bg-primary/5 p-8 border-b border-white/10">
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Info className="text-primary w-6 h-6" /> Page Content
          </CardTitle>
          <CardDescription>
            Use Markdown or plain text to describe your journey, vision, and expertise.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Bio Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your story here..."
              className="min-h-[400px] glass-card border-white/10 p-6 text-lg leading-relaxed focus:ring-primary"
            />
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSave} className="lavender-gradient h-14 px-10 font-bold text-lg shadow-xl">
              <Save className="w-5 h-5 mr-2" /> Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="glass-card p-8 rounded-2xl border-white/5 bg-secondary/5">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-secondary" /> Pro Tip
        </h3>
        <p className="text-sm text-muted-foreground">
          Keep your story authentic and focus on the emotional impact of your editing. Mention specific achievements but keep it readable for clients looking for a creative partner.
        </p>
      </div>
    </div>
  );
}
