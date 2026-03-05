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
import { Badge } from '@/components/ui/badge';
import {
  Plus, Trash2, Edit2, Video, ExternalLink, Save,
  Upload, Loader2, X, Film, Clock, Calendar, Tag, Search,
  Link2, HardDriveUpload, CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { uploadToCloudinary } from '@/lib/cloudinary-direct-upload';

const CATEGORIES = ['Music Video', 'Commercial', 'Wedding', 'Travel', 'Vlog', 'Documentary', 'Short Film'];

const EMPTY_FORM = {
  title: '',
  slug: '',
  description: '',
  videoUrl: '',
  thumbnailUrl: '',
  category: 'Travel',
  year: new Date().getFullYear().toString(),
  duration: '',
  client: '',
};

type FormData = typeof EMPTY_FORM;

// ── Detect whether a URL points to a direct video file (not YouTube/Vimeo) ───
function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|avi|mkv)(\?.*)?$/i.test(url) ||
    (url.includes('res.cloudinary.com') && url.includes('/video/'));
}

// ── Derive a clean Cloudinary video preview URL ───────────────────────────────
function getCloudinaryVideoThumb(videoUrl: string): string | null {
  if (!videoUrl.includes('res.cloudinary.com')) return null;
  return videoUrl.replace(/\.[^.?]+(\?.*)?$/, '.jpg$1');
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ── Read video duration from a local File before uploading ────────────────────
function readVideoDuration(file: File): Promise<string> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const totalSecs = Math.round(video.duration);
      URL.revokeObjectURL(url);
      video.src = '';
      if (!isFinite(totalSecs) || totalSecs <= 0) { resolve(''); return; }
      const m = Math.floor(totalSecs / 60);
      const s = totalSecs % 60;
      resolve(`${m}:${s.toString().padStart(2, '0')}`);
    };
    video.onerror = () => { URL.revokeObjectURL(url); resolve(''); };
    video.src = url;
  });
}

export default function AdminProjectsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const projectsQuery = useMemoFirebase(() => collection(firestore, 'projects'), [firestore]);
  const { data: projects, isLoading } = useCollection(projectsQuery);

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({ ...EMPTY_FORM });

  // Upload states
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoDragOver, setVideoDragOver] = useState(false);

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  function openAdd() {
    setEditingProject(null);
    setFormData({ ...EMPTY_FORM, year: new Date().getFullYear().toString() });
    setVideoUploadProgress(0);
    setPanelOpen(true);
  }

  function openEdit(project: any) {
    setEditingProject(project);
    setFormData({ ...EMPTY_FORM, ...project });
    setVideoUploadProgress(0);
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setEditingProject(null);
    setVideoUploadProgress(0);
  }

  function set(field: keyof FormData, value: string) {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'title' && !editingProject) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  }

  // ── Thumbnail upload ──────────────────────────────────────────────────────────
  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingThumb(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        set('thumbnailUrl', data.url);
        toast({ title: 'Thumbnail uploaded!' });
      } else throw new Error(data.error);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Upload failed', description: err.message });
    } finally {
      setIsUploadingThumb(false);
      if (thumbInputRef.current) thumbInputRef.current.value = '';
    }
  }

  // ── Video file upload (direct browser → Cloudinary, no server proxy) ─────────
  async function uploadVideoFile(file: File) {
    const MAX_MB = 100;
    if (file.size > MAX_MB * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'File too large', description: `Maximum video size is ${MAX_MB} MB.` });
      return;
    }

    setIsUploadingVideo(true);
    setVideoUploadProgress(0);

    // ── Auto-read duration from local file metadata (before any network) ──────
    const detectedDuration = await readVideoDuration(file);
    if (detectedDuration && !formData.duration) {
      set('duration', detectedDuration);
    }

    try {
      const result = await uploadToCloudinary(
        file,
        (e) => setVideoUploadProgress(e.percent),
        'jeevan_uploads',
      );

      set('videoUrl', result.secure_url);

      // Auto-fill thumbnail from Cloudinary video poster if none set
      if (!formData.thumbnailUrl) {
        const thumb = getCloudinaryVideoThumb(result.secure_url);
        if (thumb) set('thumbnailUrl', thumb);
      }

      setVideoUploadProgress(100);
      toast({ title: 'Video uploaded!', description: 'The video URL has been saved to the project.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Video upload failed', description: err.message });
      setVideoUploadProgress(0);
    } finally {
      setIsUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  }

  function handleVideoFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadVideoFile(file);
  }

  function handleVideoDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setVideoDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      uploadVideoFile(file);
    } else {
      toast({ variant: 'destructive', title: 'Invalid file', description: 'Please drop a video file.' });
    }
  }

  // ── Save / Delete ─────────────────────────────────────────────────────────────
  function handleSave() {
    if (!formData.title.trim()) {
      toast({ variant: 'destructive', title: 'Title is required' });
      return;
    }
    if (editingProject) {
      updateDocumentNonBlocking(doc(firestore, 'projects', editingProject.id), formData);
      toast({ title: 'Project updated', description: formData.title });
    } else {
      addDocumentNonBlocking(collection(firestore, 'projects'), {
        ...formData,
        creationDate: new Date().toISOString(),
        displayOrder: (projects?.length || 0) + 1,
      });
      toast({ title: 'Project added', description: formData.title });
    }
    closePanel();
  }

  function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteDocumentNonBlocking(doc(firestore, 'projects', id));
    toast({ title: 'Project deleted' });
  }

  // ── Filtering ─────────────────────────────────────────────────────────────────
  const filtered = (projects || []).filter(p => {
    const matchCat = filterCat === 'All' || p.category === filterCat;
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const catCounts = (projects || []).reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8 relative">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <Button onClick={openAdd} className="lavender-gradient h-11 px-6 font-bold shadow-lg shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Add Project
        </Button>
      </div>

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: projects?.length || 0, icon: Film, color: 'text-blue-400' },
          { label: 'Categories', value: Object.keys(catCounts).length, icon: Tag, color: 'text-purple-400' },
          { label: 'Most Recent', value: projects?.slice().sort((a, b) => b.creationDate?.localeCompare(a.creationDate || ''))[0]?.year || '—', icon: Calendar, color: 'text-green-400' },
          { label: 'With Duration', value: projects?.filter(p => p.duration).length || 0, icon: Clock, color: 'text-orange-400' },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-xl p-4 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color} shrink-0`} />
            <div>
              <p className="text-xl font-bold font-headline">{s.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search + Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search projects by title or category..."
            className="glass-card border-white/10 pl-9 h-10"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filterCat === cat ? 'lavender-gradient text-white shadow-lg' : 'glass-card text-muted-foreground hover:text-white hover:border-primary/40'}`}
            >
              {cat} {cat !== 'All' && catCounts[cat] ? `(${catCounts[cat]})` : cat === 'All' ? `(${projects?.length || 0})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* ── Project Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass-card rounded-2xl overflow-hidden">
              <div className="aspect-video shimmer" />
              <div className="p-4 space-y-2">
                <div className="h-4 shimmer rounded w-3/4" />
                <div className="h-3 shimmer rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-white/10 rounded-3xl">
          <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground font-medium">No projects found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter</p>
          <Button onClick={openAdd} className="lavender-gradient mt-6 h-10 px-6 font-bold">
            <Plus className="w-4 h-4 mr-2" /> Add First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(project => (
            <div key={project.id} className="glass-card border-white/10 rounded-2xl overflow-hidden group animate-fade-up">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-black/40">
                <Image
                  src={project.thumbnailUrl || 'https://picsum.photos/seed/placeholder/800/450'}
                  alt={project.title}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-70"
                />
                {/* Overlay actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <Button
                    size="icon"
                    className="lavender-gradient shadow-xl w-10 h-10 hover:scale-110 transition-transform"
                    onClick={() => openEdit(project)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  {project.videoUrl && (
                    <a href={project.videoUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="icon" variant="secondary" className="glass-card shadow-xl w-10 h-10 hover:scale-110 transition-transform">
                        {isDirectVideoUrl(project.videoUrl) ? <Video className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                      </Button>
                    </a>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="bg-destructive/80 hover:bg-destructive text-white shadow-xl w-10 h-10 hover:scale-110 transition-transform"
                    onClick={() => handleDelete(project.id, project.title)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Category badge */}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-black/70 backdrop-blur text-[10px] uppercase font-bold tracking-widest text-white border-0">
                    {project.category}
                  </Badge>
                </div>

                {/* Video type badge */}
                {project.videoUrl && (
                  <div className="absolute top-3 right-3">
                    <Badge className={`text-[10px] uppercase font-bold tracking-widest border-0 backdrop-blur ${isDirectVideoUrl(project.videoUrl) ? 'bg-emerald-500/80 text-white' : 'bg-blue-500/80 text-white'}`}>
                      {isDirectVideoUrl(project.videoUrl) ? '▶ Direct' : '🔗 Link'}
                    </Badge>
                  </div>
                )}

                {/* Duration badge */}
                {project.duration && (
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {project.duration}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-headline font-bold text-lg leading-tight truncate">{project.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {project.year}{project.client ? ` · ${project.client}` : ''}
                    </p>
                    {project.description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{project.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Slide-in Edit / Add Panel ── */}
      {panelOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={closePanel}
          />
          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-card/95 backdrop-blur-xl border-l border-white/10 z-50 overflow-y-auto shadow-2xl animate-scale-in">
            {/* Panel header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-white/10 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="font-headline text-xl font-bold uppercase tracking-tight">
                  {editingProject ? 'Edit Project' : 'New Project'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {editingProject ? 'Update project details' : 'Add a new portfolio piece'}
                </p>
              </div>
              <button onClick={closePanel} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* ── Thumbnail upload ── */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Thumbnail</label>
                <div
                  className="relative aspect-video w-full rounded-xl overflow-hidden glass-card border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer group hover:border-primary/50 transition-all"
                  onClick={() => thumbInputRef.current?.click()}
                >
                  {formData.thumbnailUrl ? (
                    <>
                      <Image src={formData.thumbnailUrl} alt="thumb" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      {isUploadingThumb ? <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" /> : <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2 group-hover:text-primary transition-colors" />}
                      <p className="text-xs text-muted-foreground">{isUploadingThumb ? 'Uploading…' : 'Click to upload thumbnail'}</p>
                    </div>
                  )}
                </div>
                <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
                <Input
                  value={formData.thumbnailUrl}
                  onChange={e => set('thumbnailUrl', e.target.value)}
                  placeholder="Or paste image URL…"
                  className="glass-card border-white/10 h-9 text-sm"
                />
              </div>

              {/* ── Title + Category ── */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Title *</label>
                  <Input value={formData.title} onChange={e => set('title', e.target.value)} placeholder="Project title" className="glass-card border-white/10 h-11" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Slug (URL)</label>
                  <Input value={formData.slug} onChange={e => set('slug', e.target.value)} placeholder="auto-generated" className="glass-card border-white/10 h-11 font-mono text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => set('category', e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-white/10 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Year</label>
                  <Input value={formData.year} onChange={e => set('year', e.target.value)} placeholder="2024" className="glass-card border-white/10 h-11" />
                </div>
              </div>

              {/* ── Client + Duration ── */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Client</label>
                  <Input value={formData.client} onChange={e => set('client', e.target.value)} placeholder="Client name" className="glass-card border-white/10 h-11" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Duration</label>
                  <Input value={formData.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 3:45" className="glass-card border-white/10 h-11" />
                </div>
              </div>

              {/* ════════════════════════════════════════════════════════
                  ── VIDEO SECTION (NEW) ──
              ════════════════════════════════════════════════════════ */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Video className="w-3.5 h-3.5" /> Video
                </label>

                {/* Status: video already set */}
                {formData.videoUrl && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold ${isDirectVideoUrl(formData.videoUrl) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    {isDirectVideoUrl(formData.videoUrl) ? 'Direct video file uploaded' : 'External video link set'}
                    <button
                      type="button"
                      onClick={() => set('videoUrl', '')}
                      className="ml-auto opacity-60 hover:opacity-100 transition-opacity"
                      title="Remove video"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Upload drop zone */}
                <div
                  className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${videoDragOver
                    ? 'border-primary bg-primary/10 scale-[1.01]'
                    : isUploadingVideo
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-white/20 hover:border-primary/40 hover:bg-white/5'
                    } cursor-pointer`}
                  onClick={() => !isUploadingVideo && videoInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setVideoDragOver(true); }}
                  onDragLeave={() => setVideoDragOver(false)}
                  onDrop={handleVideoDrop}
                >
                  <div className="flex flex-col items-center justify-center gap-2 py-6 px-4 text-center">
                    {isUploadingVideo ? (
                      <>
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-sm font-bold text-primary">Uploading video…</p>
                        {/* Progress bar */}
                        <div className="w-full max-w-xs bg-white/10 rounded-full h-1.5 mt-1">
                          <div
                            className="lavender-gradient h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${videoUploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{videoUploadProgress}% — do not close this panel</p>
                      </>
                    ) : (
                      <>
                        <HardDriveUpload className={`w-8 h-8 transition-colors ${videoDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div>
                          <p className="text-sm font-bold text-muted-foreground">
                            {videoDragOver ? 'Drop to upload' : 'Click or drag & drop a video'}
                          </p>
                          <p className="text-[11px] text-muted-foreground/60 mt-0.5">MP4, WebM, MOV · max 100 MB</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/*"
                  className="hidden"
                  onChange={handleVideoFileInput}
                />

                {/* Divider */}
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">or paste a URL</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* URL input */}
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={formData.videoUrl}
                    onChange={e => set('videoUrl', e.target.value)}
                    placeholder="https://vimeo.com/... or https://youtu.be/..."
                    className="glass-card border-white/10 h-11 pl-9 text-sm"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground/60">
                  Accepts: YouTube, Vimeo, or any direct MP4/WebM URL
                </p>
              </div>

              {/* ── Description ── */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Brief description of the project…"
                  className="glass-card border-white/10 min-h-[100px] text-sm"
                />
              </div>

              {/* ── Actions ── */}
              <div className="flex gap-3 pt-2 border-t border-white/10">
                <Button
                  onClick={handleSave}
                  disabled={isUploadingVideo || isUploadingThumb}
                  className="lavender-gradient flex-1 h-11 font-bold shadow-xl"
                >
                  {isUploadingVideo ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading…</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> {editingProject ? 'Save Changes' : 'Create Project'}</>
                  )}
                </Button>
                <Button variant="ghost" onClick={closePanel} disabled={isUploadingVideo} className="h-11 px-4 glass-card border-white/10">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
