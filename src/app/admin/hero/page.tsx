'use client';

import { useState, useEffect, useRef } from 'react';
import { useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Loader2, Save, Upload, Image as ImageIcon, Video, Type,
    MousePointerClick, Trash2, Film, Eye, X, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const MAX_MB = 100;
const MAX_BYTES = MAX_MB * 1024 * 1024;

type MediaType = 'image' | 'video';

export default function AdminHeroManagement() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const heroRef = useMemoFirebase(() => doc(firestore, 'heroContent', 'singleton'), [firestore]);
    const { data: heroData, isLoading } = useDoc(heroRef);

    // ── form state ─────────────────────────────────────────────────────────────
    const [headline, setHeadline] = useState('');
    const [highlightWord, setHighlightWord] = useState('');
    const [subheadline, setSubheadline] = useState('');
    const [cta1Text, setCta1Text] = useState('');
    const [cta1Href, setCta1Href] = useState('');
    const [cta2Text, setCta2Text] = useState('');
    const [cta2Href, setCta2Href] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [mediaType, setMediaType] = useState<MediaType>('image');
    const [overlayOpacity, setOverlayOpacity] = useState(30);

    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── populate from Firestore ─────────────────────────────────────────────────
    useEffect(() => {
        if (heroData) {
            setHeadline(heroData.headline || 'Crafting Cinematic Stories');
            setHighlightWord(heroData.highlightWord || 'Cinematic');
            setSubheadline(heroData.subheadline || 'High-impact video editing for visionaries. Transforming raw footage into breathtaking visual experiences.');
            setCta1Text(heroData.cta1Text || 'View My Work');
            setCta1Href(heroData.cta1Href || '/work');
            setCta2Text(heroData.cta2Text || 'Book a Project');
            setCta2Href(heroData.cta2Href || '/contact');
            setMediaUrl(heroData.mediaUrl || '');
            setMediaType(heroData.mediaType || 'image');
            setOverlayOpacity(heroData.overlayOpacity ?? 30);
        }
    }, [heroData]);

    // ── upload handler ──────────────────────────────────────────────────────────
    async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_BYTES) {
            toast({ variant: 'destructive', title: 'File too large', description: `Max allowed size is ${MAX_MB} MB.` });
            return;
        }

        const detectedType: MediaType = file.type.startsWith('video/') ? 'video' : 'image';
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();

            if (data.success) {
                setMediaUrl(data.url);
                setMediaType(detectedType);
                toast({ title: 'Uploaded!', description: `${detectedType === 'video' ? 'Video' : 'Image'} uploaded. Don't forget to Save.` });
            } else {
                throw new Error(data.error);
            }
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Upload failed', description: err.message || 'Please try again.' });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    // ── save ────────────────────────────────────────────────────────────────────
    function handleSave() {
        setIsSaving(true);
        setDocumentNonBlocking(heroRef, {
            headline, highlightWord, subheadline,
            cta1Text, cta1Href, cta2Text, cta2Href,
            mediaUrl, mediaType, overlayOpacity,
            lastUpdated: new Date().toISOString(),
        }, { merge: true });
        setTimeout(() => {
            setIsSaving(false);
            toast({ title: 'Hero Saved!', description: 'Home page hero updated successfully.' });
        }, 600);
    }

    if (isLoading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    // ── rendered headline preview ────────────────────────────────────────────────
    const previewHeadline = headline
        ? headline.replace(highlightWord, `<span style="color:#7F2DFF">${highlightWord}</span>`)
        : 'Headline preview';

    return (
        <div className="space-y-8 max-w-6xl">
            {/* Page header */}
            <div className="flex justify-between items-end">
                <Button onClick={handleSave} disabled={isSaving} className="lavender-gradient h-12 px-8 font-bold shadow-xl">
                    {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                    {isSaving ? 'Saving...' : 'Save All'}
                </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* ── Left / middle: fields ── */}
                <div className="xl:col-span-2 space-y-6">

                    {/* ── Background Media ── */}
                    <Card className="glass-card border-white/10">
                        <CardHeader className="pb-4">
                            <CardTitle className="font-headline text-lg flex items-center gap-2">
                                <Film className="w-5 h-5 text-primary" /> Background Media
                            </CardTitle>
                            <CardDescription>Upload an image (JPG/PNG/WEBP) or video (MP4/WEBM) up to 100 MB.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Preview box */}
                            <div
                                className="relative w-full aspect-video rounded-2xl overflow-hidden glass-card border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer group transition-all hover:border-primary/50"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {mediaUrl ? (
                                    mediaType === 'video' ? (
                                        <video
                                            src={mediaUrl}
                                            className="absolute inset-0 w-full h-full object-cover"
                                            style={{ opacity: overlayOpacity / 100 }}
                                            autoPlay muted loop playsInline
                                        />
                                    ) : (
                                        <Image
                                            src={mediaUrl} alt="Hero preview" fill
                                            className="object-cover"
                                            style={{ opacity: overlayOpacity / 100 }}
                                        />
                                    )
                                ) : (
                                    <div className="text-center p-6">
                                        {isUploading
                                            ? <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-2" />
                                            : <Film className="w-10 h-10 text-muted-foreground mx-auto mb-2 group-hover:text-primary transition-colors" />}
                                        <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                            {isUploading ? 'Uploading…' : 'Click to upload image or video'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">Max 100 MB • JPG, PNG, WEBP, MP4, WEBM</p>
                                    </div>
                                )}

                                {/* Hover overlay */}
                                {mediaUrl && (
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                        <Upload className="w-8 h-8 text-white" />
                                        <span className="text-white text-sm font-bold">Replace media</span>
                                    </div>
                                )}

                                {/* Media type badge */}
                                {mediaUrl && (
                                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                                        {mediaType === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                                        {mediaType === 'video' ? 'Video' : 'Image'}
                                    </div>
                                )}
                            </div>

                            <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />

                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1 glass-card border-white/10 hover:border-primary/50" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                    {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                    {isUploading ? 'Uploading…' : 'Upload Media'}
                                </Button>
                                {mediaUrl && (
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => setMediaUrl('')}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>

                            {/* Manual URL */}
                            <div className="space-y-1 pt-2 border-t border-white/10">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Or paste URL directly</label>
                                <div className="flex gap-2">
                                    <Input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="https://..." className="glass-card border-white/10 h-10 text-sm flex-1" />
                                    <Button variant="outline" size="sm" className={`glass-card border-white/10 px-3 ${mediaType === 'video' ? 'border-primary text-primary' : ''}`} onClick={() => setMediaType(t => t === 'image' ? 'video' : 'image')}>
                                        {mediaType === 'video' ? <Video className="w-4 h-4 mr-1" /> : <ImageIcon className="w-4 h-4 mr-1" />}
                                        {mediaType}
                                    </Button>
                                </div>
                            </div>

                            {/* Overlay opacity */}
                            <div className="space-y-2 pt-2 border-t border-white/10">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Background Opacity</label>
                                    <span className="text-xs font-bold text-primary">{overlayOpacity}%</span>
                                </div>
                                <input
                                    type="range" min={5} max={80} value={overlayOpacity}
                                    onChange={e => setOverlayOpacity(Number(e.target.value))}
                                    className="w-full accent-violet-500"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Text Content ── */}
                    <Card className="glass-card border-white/10">
                        <CardHeader className="pb-4">
                            <CardTitle className="font-headline text-lg flex items-center gap-2">
                                <Type className="w-5 h-5 text-primary" /> Text Content
                            </CardTitle>
                            <CardDescription>Edit the headline, highlight word, and sub-heading shown over the hero.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Main Headline</label>
                                <Input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Crafting Cinematic Stories" className="glass-card border-white/10 h-12 text-base" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Highlighted Word (must appear in headline)</label>
                                <Input value={highlightWord} onChange={e => setHighlightWord(e.target.value)} placeholder="Cinematic" className="glass-card border-white/10 h-12 text-base" />
                                <p className="text-xs text-muted-foreground">This word will be highlighted in purple in the headline.</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sub-heading</label>
                                <Input value={subheadline} onChange={e => setSubheadline(e.target.value)} placeholder="High-impact video editing..." className="glass-card border-white/10 h-12 text-base" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── CTA Buttons ── */}
                    <Card className="glass-card border-white/10">
                        <CardHeader className="pb-4">
                            <CardTitle className="font-headline text-lg flex items-center gap-2">
                                <MousePointerClick className="w-5 h-5 text-primary" /> Call-to-Action Buttons
                            </CardTitle>
                            <CardDescription>Configure the two action buttons displayed in the hero.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2 p-4 rounded-xl bg-primary/5 border border-primary/20">
                                    <p className="text-xs font-bold uppercase tracking-widest text-primary">Primary Button</p>
                                    <Input value={cta1Text} onChange={e => setCta1Text(e.target.value)} placeholder="View My Work" className="glass-card border-white/10 h-10 text-sm" />
                                    <Input value={cta1Href} onChange={e => setCta1Href(e.target.value)} placeholder="/work" className="glass-card border-white/10 h-10 text-sm" />
                                </div>
                                <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Secondary Button</p>
                                    <Input value={cta2Text} onChange={e => setCta2Text(e.target.value)} placeholder="Book a Project" className="glass-card border-white/10 h-10 text-sm" />
                                    <Input value={cta2Href} onChange={e => setCta2Href(e.target.value)} placeholder="/contact" className="glass-card border-white/10 h-10 text-sm" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Right: live preview ── */}
                <div className="space-y-6">
                    <Card className="glass-card border-white/10 sticky top-6">
                        <CardHeader className="pb-4">
                            <CardTitle className="font-headline text-lg flex items-center gap-2">
                                <Eye className="w-5 h-5 text-primary" /> Live Preview
                            </CardTitle>
                            <CardDescription>How the hero will appear on the home page.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Mini hero preview */}
                            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/60 border border-white/10">
                                {/* Background */}
                                {mediaUrl && (
                                    mediaType === 'video' ? (
                                        <video src={mediaUrl} className="absolute inset-0 w-full h-full object-cover" style={{ opacity: overlayOpacity / 100 }} autoPlay muted loop playsInline />
                                    ) : (
                                        <Image src={mediaUrl} alt="preview" fill className="object-cover" style={{ opacity: overlayOpacity / 100 }} />
                                    )
                                )}
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />

                                {/* Text overlay */}
                                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-4">
                                    <h2 className="font-headline font-bold text-white text-sm leading-tight mb-1"
                                        dangerouslySetInnerHTML={{ __html: previewHeadline }} />
                                    <p className="text-white/70 text-[10px] mb-3 line-clamp-2 max-w-[90%]">{subheadline}</p>
                                    <div className="flex gap-2">
                                        {cta1Text && (
                                            <span className="text-[9px] px-2 py-1 rounded-full lavender-gradient text-white font-bold">{cta1Text}</span>
                                        )}
                                        {cta2Text && (
                                            <span className="text-[9px] px-2 py-1 rounded-full border border-white/30 text-white">{cta2Text}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Meta info */}
                            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span>Background type</span>
                                    <span className="text-foreground font-medium capitalize flex items-center gap-1">
                                        {mediaType === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                                        {mediaType}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span>Overlay opacity</span>
                                    <span className="text-foreground font-medium">{overlayOpacity}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Highlight word</span>
                                    <span className="text-primary font-bold">"{highlightWord}"</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
