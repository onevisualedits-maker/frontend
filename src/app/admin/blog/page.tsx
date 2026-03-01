
'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit2, FileText, Save, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function AdminBlogManagement() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const publishedQuery = useMemoFirebase(() => collection(firestore, 'blogPosts'), [firestore]);
  const draftsQuery = useMemoFirebase(() => collection(firestore, 'adminBlogDrafts'), [firestore]);
  
  const { data: publishedPosts, isLoading: loadingPub } = useCollection(publishedQuery);
  const { data: drafts, isLoading: loadingDrafts } = useCollection(draftsQuery);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('published');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    publishDate: new Date().toISOString(),
    isPublished: true,
    categoryId: 'general',
    featuredImageUrl: ''
  });

  function resetForm() {
    setFormData({
      title: '',
      slug: '',
      content: '',
      publishDate: new Date().toISOString(),
      isPublished: true,
      categoryId: 'general',
      featuredImageUrl: ''
    });
    setEditingPost(null);
  }

  function handleSave(asDraft: boolean) {
    if (!formData.title || !formData.content) return;

    const postData = { ...formData, isPublished: !asDraft };
    const targetCollection = asDraft ? 'adminBlogDrafts' : 'blogPosts';

    if (editingPost) {
      // If moving between collections, delete from old and add to new
      const oldCollection = editingPost.isPublished ? 'blogPosts' : 'adminBlogDrafts';
      if (oldCollection !== targetCollection) {
        deleteDocumentNonBlocking(doc(firestore, oldCollection, editingPost.id));
        addDocumentNonBlocking(collection(firestore, targetCollection), postData);
      } else {
        updateDocumentNonBlocking(doc(firestore, targetCollection, editingPost.id), postData);
      }
      toast({ title: "Post Updated", description: "Your changes have been saved." });
    } else {
      addDocumentNonBlocking(collection(firestore, targetCollection), postData);
      toast({ title: "Post Created", description: asDraft ? "Draft saved successfully." : "Post published live!" });
    }

    setIsDialogOpen(false);
    resetForm();
  }

  function handleDelete(id: string, isPub: boolean) {
    if (confirm('Permanently delete this article?')) {
      const col = isPub ? 'blogPosts' : 'adminBlogDrafts';
      deleteDocumentNonBlocking(doc(firestore, col, id));
    }
  }

  const PostCard = ({ post, isPub }: { post: any, isPub: boolean }) => (
    <Card className="glass-card border-white/10 group">
      <CardHeader className="flex flex-row items-start justify-between p-6">
        <div>
          <h3 className="font-headline font-bold text-xl mb-1">{post.title}</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">{post.slug} • {new Date(post.publishDate).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => { setEditingPost(post); setFormData(post); setIsDialogOpen(true); }}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(post.id, isPub)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <p className="text-sm text-muted-foreground line-clamp-2 italic">"{post.content.substring(0, 150)}..."</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-headline text-4xl font-bold uppercase tracking-tighter mb-2">
            Blog <span className="text-primary">Studio</span>
          </h1>
          <p className="text-muted-foreground">Write, manage, and publish industry insights.</p>
        </div>
        
        <div className="flex gap-4">
          <Button variant="outline" asChild className="glass-card">
            <Link href="/blog/generator"><Sparkles className="w-4 h-4 mr-2" /> Idea Gen</Link>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="lavender-gradient h-12 px-6 font-bold shadow-lg">
                <Plus className="w-5 h-5 mr-2" /> Write Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl glass-card border-white/10 h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-headline uppercase text-2xl">
                  {editingPost ? 'Edit Article' : 'New Blog Post'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Title</label>
                    <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="glass-card border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Slug (URL)</label>
                    <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="glass-card border-white/10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Content (Rich Text / Markdown Support)</label>
                  <Textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="glass-card border-white/10 min-h-[300px]" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Featured Image URL</label>
                    <Input value={formData.featuredImageUrl} onChange={e => setFormData({...formData, featuredImageUrl: e.target.value})} className="glass-card border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</label>
                    <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full h-10 px-3 rounded-md border border-white/10 bg-card text-sm">
                      <option value="general">General</option>
                      <option value="tips">Editing Tips</option>
                      <option value="industry">Industry News</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <Button variant="outline" onClick={() => handleSave(true)} className="glass-card h-12 px-8">
                    <EyeOff className="w-4 h-4 mr-2" /> Save Draft
                  </Button>
                  <Button onClick={() => handleSave(false)} className="lavender-gradient h-12 px-8 font-bold">
                    <Save className="w-4 h-4 mr-2" /> Publish Live
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="published" className="w-full">
        <TabsList className="glass-card p-1 mb-8">
          <TabsTrigger value="published" className="px-10 font-bold uppercase tracking-tighter">Published ({publishedPosts?.length || 0})</TabsTrigger>
          <TabsTrigger value="drafts" className="px-10 font-bold uppercase tracking-tighter">Drafts ({drafts?.length || 0})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="published" className="space-y-6">
          {loadingPub ? <p>Loading articles...</p> : publishedPosts?.map(p => <PostCard key={p.id} post={p} isPub={true} />)}
          {publishedPosts?.length === 0 && <p className="text-center py-20 text-muted-foreground italic">No live posts yet.</p>}
        </TabsContent>
        
        <TabsContent value="drafts" className="space-y-6">
          {loadingDrafts ? <p>Loading drafts...</p> : drafts?.map(p => <PostCard key={p.id} post={p} isPub={false} />)}
          {drafts?.length === 0 && <p className="text-center py-20 text-muted-foreground italic">No drafts currently.</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
