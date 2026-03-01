'use client';

import { useState, useEffect, useRef } from 'react';
import { useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Save, Info, Upload, ImageIcon, User, FileText, Type, X, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function AdminAboutManagement() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const aboutRef = useMemoFirebase(() => doc(firestore, 'aboutPageContent', 'singleton'), [firestore]);
  const { data: aboutData, isLoading } = useDoc(aboutRef);

  const [header, setHeader] = useState('');
  const [tagline, setTagline] = useState('');
  const [content, setContent] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aboutData) {
      setHeader(aboutData.header || '');
      setTagline(aboutData.tagline || '');
      setContent(aboutData.content || '');
      setProfileImageUrl(aboutData.profileImageUrl || '');
    }
  }, [aboutData]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        setProfileImageUrl(data.url);
        toast({ title: 'Image Uploaded!', description: 'Profile image updated. Remember to save.' });
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload image. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  }

  function handleSave() {
    setIsSaving(true);
    setDocumentNonBlocking(aboutRef, {
      id: 'singleton',
      header,
      tagline,
      content,
      profileImageUrl,
      lastUpdated: new Date().toISOString(),
    }, { merge: true });

    setTimeout(() => {
      setIsSaving(false);
      toast({ title: 'Saved!', description: 'About page updated successfully.' });
    }, 600);
  }

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-headline text-4xl font-bold uppercase tracking-tighter mb-2">
            Manage <span className="text-primary">About Page</span>
          </h1>
          <p className="text-muted-foreground">Edit your header, bio, and profile image for the public About page.</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="lavender-gradient h-12 px-8 font-bold shadow-xl"
        >
          {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left: Fields ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Header field */}
          <Card className="glass-card border-white/10">
            <CardHeader className="pb-4">
              <CardTitle className="font-headline text-lg flex items-center gap-2">
                <Type className="w-5 h-5 text-primary" /> Page Header
              </CardTitle>
              <CardDescription>The large headline on the About page (e.g. "I am Jeevan the Editor.")</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={header}
                onChange={e => setHeader(e.target.value)}
                placeholder='e.g. I am Jeevan the Editor.'
                className="glass-card border-white/10 h-12 text-base"
              />
            </CardContent>
          </Card>

          {/* Tagline field */}
          <Card className="glass-card border-white/10">
            <CardHeader className="pb-4">
              <CardTitle className="font-headline text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Tagline / Sub-heading
              </CardTitle>
              <CardDescription>A short punchy line shown beneath the header.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder='e.g. 7+ Years of Cinematic Excellence'
                className="glass-card border-white/10 h-12 text-base"
              />
            </CardContent>
          </Card>

          {/* Bio field */}
          <Card className="glass-card border-white/10">
            <CardHeader className="pb-4">
              <CardTitle className="font-headline text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Bio Content
              </CardTitle>
              <CardDescription>Your story — who you are, what you do, and what drives you. Plain text, use new lines for paragraphs.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write your story here..."
                className="min-h-[260px] glass-card border-white/10 p-4 text-base leading-relaxed focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-2">{content.length} characters</p>
            </CardContent>
          </Card>
        </div>

        {/* ── Right: Image uploader + preview ── */}
        <div className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader className="pb-4">
              <CardTitle className="font-headline text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" /> Profile Image
              </CardTitle>
              <CardDescription>Shown on the About page. Square or portrait works best (4:5 ratio).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image preview */}
              <div
                className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden glass-card border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer group transition-all hover:border-primary/50"
                onClick={() => fileInputRef.current?.click()}
              >
                {profileImageUrl ? (
                  <>
                    <Image
                      src={profileImageUrl}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <Upload className="w-8 h-8 text-white" />
                      <span className="text-white text-sm font-bold">Change Image</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    {isUploading ? (
                      <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
                    ) : (
                      <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
                    )}
                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {isUploading ? 'Uploading...' : 'Click to upload photo'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP</p>
                  </div>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />

              {/* Upload button */}
              <Button
                variant="outline"
                className="w-full glass-card border-white/10 hover:border-primary/50"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {isUploading ? 'Uploading...' : 'Upload New Image'}
              </Button>

              {/* Clear image */}
              {profileImageUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setProfileImageUrl('')}
                >
                  <X className="w-4 h-4 mr-2" /> Remove Image
                </Button>
              )}

              {/* URL field (manual override) */}
              <div className="space-y-1 pt-2 border-t border-white/10">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Or paste image URL</label>
                <Input
                  value={profileImageUrl}
                  onChange={e => setProfileImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="glass-card border-white/10 h-10 text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Live preview snippet */}
          <div className="glass-card p-5 rounded-2xl border-white/5 bg-secondary/5 space-y-2">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-secondary" /> Live Preview
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-foreground font-bold block mb-0.5">{header || 'Header will appear here'}</span>
              <span className="text-primary text-xs block mb-1">{tagline || 'Tagline appears here'}</span>
              {(content || 'Your bio will appear here...').substring(0, 120)}{content.length > 120 ? '...' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
