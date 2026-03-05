'use client';

import { useState, useRef } from 'react';
import {
  useCollection, useFirestore, useMemoFirebase,
  addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Trash2, Edit2, Save, X, Upload, Loader2,
  Eye, EyeOff, Sparkles, FileText, Search, Calendar, Tag, Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';

const CATEGORIES = ['General', 'Editing Tips', 'Industry News', 'Colour Grading', 'Motion Graphics', 'Behind the Scenes'];

const EMPTY_FORM = {
  title: '',
  slug: '',
  content: '',
  publishDate: new Date().toISOString().split('T')[0],
  categoryId: 'General',
  featuredImageUrl: '',
  author: 'Jeevan',
  readTime: '',
};

type FormData = typeof EMPTY_FORM;

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AdminBlogManagement() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const publishedQuery = useMemoFirebase(() => collection(firestore, 'blogPosts'), [firestore]);
  const draftsQuery = useMemoFirebase(() => collection(firestore, 'adminBlogDrafts'), [firestore]);

  const { data: publishedPosts, isLoading: loadingPub } = useCollection(publishedQuery);
  const { data: drafts, isLoading: loadingDrafts } = useCollection(draftsQuery);

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({ ...EMPTY_FORM });
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set(field: keyof FormData, value: string) {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-generate slug from title
      if (field === 'title' && !editingPost) updated.slug = slugify(value);
      return updated;
    });
  }

  function openAdd() {
    setEditingPost(null);
    setFormData({ ...EMPTY_FORM, publishDate: new Date().toISOString().split('T')[0] });
    setPanelOpen(true);
  }

  function openEdit(post: any, isPub: boolean) {
    setEditingPost({ ...post, isPub });
    setFormData({ ...EMPTY_FORM, ...post });
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setEditingPost(null);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        set('featuredImageUrl', data.url);
        toast({ title: 'Image uploaded!' });
      } else throw new Error(data.error);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Upload failed', description: err.message });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleSave(asDraft: boolean) {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({ variant: 'destructive', title: 'Title and content are required' });
      return;
    }

    const postData = { ...formData, isPublished: !asDraft, publishDate: formData.publishDate || new Date().toISOString() };
    const targetCol = asDraft ? 'adminBlogDrafts' : 'blogPosts';

    if (editingPost) {
      const oldCol = editingPost.isPub ? 'blogPosts' : 'adminBlogDrafts';
      if (oldCol !== targetCol) {
        deleteDocumentNonBlocking(doc(firestore, oldCol, editingPost.id));
        addDocumentNonBlocking(collection(firestore, targetCol), postData);
      } else {
        updateDocumentNonBlocking(doc(firestore, targetCol, editingPost.id), postData);
      }
    } else {
      addDocumentNonBlocking(collection(firestore, targetCol), postData);
    }

    // ── Auto-notify subscribers when publishing live ──────────────────────────
    if (!asDraft) {
      fetch('/api/notify-subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': process.env.NEXT_PUBLIC_INTERNAL_SECRET || '',
        },
        body: JSON.stringify(postData),
      })
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            toast({
              title: `Newsletter sent to ${d.sent} subscriber${d.sent !== 1 ? 's' : ''}!`,
              description: d.failed ? `${d.failed} failed to deliver.` : 'All emails delivered.',
            });
          }
        })
        .catch(() => {/* silent — notify failure doesn't block publish */ });
    }

    toast({ title: asDraft ? 'Draft saved' : 'Published!', description: formData.title });
    closePanel();
  }

  function handleDelete(id: string, isPub: boolean, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteDocumentNonBlocking(doc(firestore, isPub ? 'blogPosts' : 'adminBlogDrafts', id));
    toast({ title: 'Post deleted' });
  }

  function filterPosts(posts: any[]) {
    if (!search) return posts;
    return posts.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()) || p.categoryId?.toLowerCase().includes(search.toLowerCase()));
  }

  const PostCard = ({ post, isPub }: { post: any; isPub: boolean }) => (
    <div className="glass-card border-white/10 rounded-2xl overflow-hidden group animate-fade-up">
      <div className="flex gap-4 p-0">
        {/* Featured image */}
        <div className="relative w-36 shrink-0 aspect-video bg-black/40">
          {post.featuredImageUrl ? (
            <Image src={post.featuredImageUrl} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-muted-foreground opacity-30" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-4 pr-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge className="text-[10px] uppercase font-bold tracking-widest bg-primary/20 text-primary border-0 px-2">
                  {post.categoryId || 'General'}
                </Badge>
                {post.readTime && <span className="text-[10px] text-muted-foreground">{post.readTime} min read</span>}
              </div>
              <h3 className="font-headline font-bold text-base leading-tight truncate">{post.title}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(post.publishDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                {post.slug && (
                  <span className="text-[10px] text-muted-foreground font-mono">/{post.slug}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                {post.content?.substring(0, 120)}…
              </p>
            </div>

            {/* Action buttons — shown on hover */}
            <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10" onClick={() => openEdit(post, isPub)}>
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(post.id, isPub, post.title)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const EmptyState = ({ label, onAdd }: { label: string; onAdd: () => void }) => (
    <div className="text-center py-24 border-2 border-dashed border-white/10 rounded-3xl">
      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
      <p className="text-muted-foreground font-medium">{label}</p>
      <Button onClick={onAdd} className="lavender-gradient mt-6 h-10 px-6 font-bold">
        <Plus className="w-4 h-4 mr-2" /> Write First Article
      </Button>
    </div>
  );

  return (
    <div className="space-y-8 relative">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex gap-3">
          <Button variant="outline" asChild className="glass-card border-white/10 h-11 hover:border-primary/40">
            <Link href="/blog/generator"><Sparkles className="w-4 h-4 mr-2 text-primary" /> AI Ideas</Link>
          </Button>
          <Button onClick={openAdd} className="lavender-gradient h-11 px-6 font-bold shadow-lg">
            <Plus className="w-4 h-4 mr-2" /> Write Article
          </Button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Published', value: publishedPosts?.length || 0, icon: Eye, color: 'text-green-400' },
          { label: 'Drafts', value: drafts?.length || 0, icon: EyeOff, color: 'text-yellow-400' },
          { label: 'Categories Used', value: [...new Set([...(publishedPosts || []), ...(drafts || [])].map(p => p.categoryId).filter(Boolean))].length, icon: Tag, color: 'text-purple-400' },
          { label: 'With Images', value: [...(publishedPosts || []), ...(drafts || [])].filter(p => p.featuredImageUrl).length, icon: ImageIcon, color: 'text-blue-400' },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-xl p-4 flex items-center gap-3">
            <s.icon className={`w-7 h-7 ${s.color} shrink-0`} />
            <div>
              <p className="text-xl font-bold font-headline">{s.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles…" className="glass-card border-white/10 pl-9 h-10" />
        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"><X className="w-4 h-4" /></button>}
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="published">
        <TabsList className="glass-card p-1 mb-6">
          <TabsTrigger value="published" className="px-8 font-bold uppercase tracking-tight text-sm">
            Published ({publishedPosts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="drafts" className="px-8 font-bold uppercase tracking-tight text-sm">
            Drafts ({drafts?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="published" className="space-y-4">
          {loadingPub ? (
            [1, 2, 3].map(i => <div key={i} className="h-28 glass-card rounded-2xl shimmer" />)
          ) : filterPosts(publishedPosts || []).length === 0 ? (
            <EmptyState label="No published posts yet." onAdd={openAdd} />
          ) : (
            filterPosts(publishedPosts || []).map(p => <PostCard key={p.id} post={p} isPub={true} />)
          )}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          {loadingDrafts ? (
            [1, 2].map(i => <div key={i} className="h-28 glass-card rounded-2xl shimmer" />)
          ) : filterPosts(drafts || []).length === 0 ? (
            <EmptyState label="No drafts currently." onAdd={openAdd} />
          ) : (
            filterPosts(drafts || []).map(p => <PostCard key={p.id} post={p} isPub={false} />)
          )}
        </TabsContent>
      </Tabs>

      {/* ── Slide-in Panel ── */}
      {panelOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={closePanel} />
          <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-card/95 backdrop-blur-xl border-l border-white/10 z-50 overflow-y-auto shadow-2xl animate-scale-in">
            {/* Panel header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-white/10 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="font-headline text-xl font-bold uppercase tracking-tight">
                  {editingPost ? 'Edit Article' : 'New Article'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {editingPost ? 'Update post content and settings' : 'Write and publish a new blog post'}
                </p>
              </div>
              <button onClick={closePanel} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Featured image uploader */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Featured Image</label>
                <div
                  className="relative aspect-video w-full rounded-xl overflow-hidden glass-card border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer group hover:border-primary/50 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.featuredImageUrl ? (
                    <>
                      <Image src={formData.featuredImageUrl} alt="Featured" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      {isUploading ? <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" /> : <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2 group-hover:text-primary transition-colors" />}
                      <p className="text-xs text-muted-foreground">{isUploading ? 'Uploading…' : 'Click to upload featured image'}</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <Input value={formData.featuredImageUrl} onChange={e => set('featuredImageUrl', e.target.value)} placeholder="Or paste image URL…" className="glass-card border-white/10 h-9 text-sm" />
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Title *</label>
                <Input value={formData.title} onChange={e => set('title', e.target.value)} placeholder="Article headline…" className="glass-card border-white/10 h-11" />
              </div>

              {/* Slug + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Slug (URL)</label>
                  <Input value={formData.slug} onChange={e => set('slug', e.target.value)} placeholder="auto-generated" className="glass-card border-white/10 h-11 font-mono text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={e => set('categoryId', e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-white/10 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Author + Read time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Author</label>
                  <Input value={formData.author} onChange={e => set('author', e.target.value)} placeholder="Jeevan" className="glass-card border-white/10 h-11" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Read Time (mins)</label>
                  <Input value={formData.readTime} onChange={e => set('readTime', e.target.value)} placeholder="e.g. 5" className="glass-card border-white/10 h-11" />
                </div>
              </div>

              {/* Publish date */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Publish Date</label>
                <Input type="date" value={formData.publishDate} onChange={e => set('publishDate', e.target.value)} className="glass-card border-white/10 h-11" />
              </div>

              {/* Content */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Content *</label>
                <Textarea
                  value={formData.content}
                  onChange={e => set('content', e.target.value)}
                  placeholder="Write your article here…"
                  className="glass-card border-white/10 min-h-[260px] text-sm leading-relaxed"
                />
                <p className="text-xs text-muted-foreground">{formData.content.length} characters</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-white/10">
                <Button onClick={() => handleSave(false)} className="lavender-gradient flex-1 h-11 font-bold shadow-xl">
                  <Eye className="w-4 h-4 mr-2" /> Publish Live
                </Button>
                <Button onClick={() => handleSave(true)} variant="outline" className="glass-card border-white/10 h-11 px-5">
                  <EyeOff className="w-4 h-4 mr-2" /> Save Draft
                </Button>
                <Button variant="ghost" onClick={closePanel} className="h-11 px-4 glass-card border-white/10">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
