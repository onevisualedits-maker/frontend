'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Play, Pause, Volume2, VolumeX,
    Maximize, Minimize, ExternalLink, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── URL detectors ────────────────────────────────────────────────────────────

function getYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    for (const re of patterns) {
        const m = url.match(re);
        if (m) return m[1];
    }
    return null;
}

function getVimeoId(url: string): string | null {
    const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return m ? m[1] : null;
}

type SourceType = 'youtube' | 'vimeo' | 'direct' | 'unknown';

function detectSource(url: string): SourceType {
    if (!url) return 'unknown';
    if (getYouTubeId(url)) return 'youtube';
    if (getVimeoId(url)) return 'vimeo';
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) return 'direct';
    // Also treat Cloudinary video URLs as direct if they have video in path
    if (url.includes('res.cloudinary.com') && url.match(/\/video\//)) return 'direct';
    return 'unknown';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(s: number) {
    if (!isFinite(s) || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface VideoPlayerProps {
    url: string;
    thumbnail?: string;
    title?: string;
    autoPlay?: boolean;
}

// ─── Embed iframe (YouTube / Vimeo) ──────────────────────────────────────────

function EmbedPlayer({ embedUrl, thumbnail, onLoaded }: { embedUrl: string; thumbnail?: string; onLoaded: () => void }) {
    const [started, setStarted] = useState(false);

    function handleStart() {
        setStarted(true);
        setTimeout(onLoaded, 800);
    }

    if (!started) {
        return (
            <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                onClick={handleStart}
            >
                {thumbnail && (
                    <img
                        src={thumbnail}
                        alt="Video thumbnail"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />

                {/* Play button */}
                <div className="relative z-10 w-20 h-20 rounded-full lavender-gradient flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:scale-110 transition-transform animate-glow-pulse">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>

                <p className="absolute bottom-6 text-white/70 text-sm font-medium tracking-wide">
                    Click to play
                </p>
            </div>
        );
    }

    return (
        <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            title="Video player"
            onLoad={onLoaded}
        />
    );
}

// ─── Direct video player (fixed AbortError) ───────────────────────────────────

function DirectPlayer({ url, thumbnail }: { url: string; thumbnail?: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Track actual video state — driven by video events, NOT toggled optimistically
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    // Ref to track in-flight play() promise to avoid AbortError
    const playPromise = useRef<Promise<void> | null>(null);

    const resetHideTimer = useCallback(() => {
        setShowControls(true);
        clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setShowControls(false), 2500);
    }, []);

    // ── Safe play/pause: always await the play promise before pausing ──────────
    const safePlay = useCallback(async () => {
        const v = videoRef.current;
        if (!v) return;
        setIsLoading(true);
        try {
            playPromise.current = v.play();
            await playPromise.current;
            playPromise.current = null;
        } catch (err: any) {
            playPromise.current = null;
            // AbortError = pause was called before play finished — safe to ignore
            if (err?.name !== 'AbortError') {
                console.error('Video play error:', err);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const safePause = useCallback(async () => {
        const v = videoRef.current;
        if (!v) return;
        // If a play() is in-flight, wait for it before pausing
        if (playPromise.current) {
            try { await playPromise.current; } catch { /* already handled above */ }
            playPromise.current = null;
        }
        v.pause();
    }, []);

    const togglePlay = useCallback(async (e?: React.MouseEvent) => {
        e?.stopPropagation();
        const v = videoRef.current;
        if (!v) return;
        if (v.paused || v.ended) {
            await safePlay();
        } else {
            await safePause();
        }
        resetHideTimer();
    }, [safePlay, safePause, resetHideTimer]);

    function toggleMute() {
        if (!videoRef.current) return;
        const next = !muted;
        videoRef.current.muted = next;
        setMuted(next);
    }

    function handleTimeUpdate() {
        const v = videoRef.current;
        if (!v) return;
        setCurrentTime(v.currentTime);
        setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
    }

    function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
        const v = videoRef.current;
        if (!v || !v.duration) return;
        v.currentTime = v.duration * (Number(e.target.value) / 100);
    }

    function toggleFullscreen() {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;

        const onLoadedMetadata = () => setDuration(v.duration);
        const onPlay = () => setPlaying(true);
        const onPause = () => setPlaying(false);
        const onEnded = () => { setPlaying(false); setShowControls(true); };
        const onWaiting = () => setIsLoading(true);
        const onCanPlay = () => setIsLoading(false);
        const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);

        v.addEventListener('loadedmetadata', onLoadedMetadata);
        v.addEventListener('play', onPlay);
        v.addEventListener('pause', onPause);
        v.addEventListener('ended', onEnded);
        v.addEventListener('waiting', onWaiting);
        v.addEventListener('canplay', onCanPlay);
        document.addEventListener('fullscreenchange', onFullscreenChange);

        return () => {
            v.removeEventListener('loadedmetadata', onLoadedMetadata);
            v.removeEventListener('play', onPlay);
            v.removeEventListener('pause', onPause);
            v.removeEventListener('ended', onEnded);
            v.removeEventListener('waiting', onWaiting);
            v.removeEventListener('canplay', onCanPlay);
            document.removeEventListener('fullscreenchange', onFullscreenChange);
            clearTimeout(hideTimer.current);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 bg-black select-none"
            onMouseMove={resetHideTimer}
            onClick={(e) => togglePlay(e)}
        >
            <video
                ref={videoRef}
                src={url}
                poster={thumbnail}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                playsInline
                preload="metadata"
            />

            {/* Buffering spinner */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="w-14 h-14 rounded-full bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-7 h-7 text-white animate-spin" />
                    </div>
                </div>
            )}

            {/* Controls overlay */}
            <div
                className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Gradient */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                {/* Bottom controls bar */}
                <div className="relative z-10 px-4 pb-4 space-y-2">
                    {/* Progress bar */}
                    <input
                        type="range" min={0} max={100} value={progress}
                        onChange={handleSeek}
                        onClick={e => e.stopPropagation()}
                        className="w-full h-1 accent-violet-500 cursor-pointer rounded-full"
                        style={{ background: `linear-gradient(to right, #7F2DFF ${progress}%, rgba(255,255,255,0.2) ${progress}%)` }}
                    />

                    {/* Controls row */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); togglePlay(e); }}
                                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                {playing
                                    ? <Pause className="w-4 h-4 text-white fill-white" />
                                    : <Play className="w-4 h-4 text-white fill-white ml-0.5" />}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                {muted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                            </button>
                            <span className="text-white/70 text-xs font-mono tabular-nums">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            {isFullscreen ? <Minimize className="w-4 h-4 text-white" /> : <Maximize className="w-4 h-4 text-white" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Initial big play button overlay when paused */}
            {!playing && !isLoading && (
                <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer pointer-events-none"
                >
                    {!duration && thumbnail && (
                        <img src={thumbnail} alt="thumb" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                    )}
                    <div className="relative z-10 w-20 h-20 rounded-full lavender-gradient flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:scale-110 transition-transform animate-glow-pulse">
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main exported component ──────────────────────────────────────────────────

export function VideoPlayer({ url, thumbnail, title, autoPlay = false }: VideoPlayerProps) {
    const [loading, setLoading] = useState(false);
    const source = detectSource(url);

    if (!url) {
        return (
            <div className="aspect-video w-full bg-black/60 rounded-2xl flex items-center justify-center border border-white/10">
                <div className="text-center text-muted-foreground">
                    <Play className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No video URL provided</p>
                </div>
            </div>
        );
    }

    // Build embed URLs
    let embedUrl = '';
    if (source === 'youtube') {
        const id = getYouTubeId(url);
        embedUrl = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&color=white`;
    }
    if (source === 'vimeo') {
        const id = getVimeoId(url);
        embedUrl = `https://player.vimeo.com/video/${id}?autoplay=1&color=7F2DFF&title=0&byline=0&portrait=0`;
    }

    return (
        <div className="w-full space-y-3">
            {/* Player container */}
            <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                {loading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                )}

                {(source === 'youtube' || source === 'vimeo') && (
                    <EmbedPlayer
                        embedUrl={embedUrl}
                        thumbnail={thumbnail}
                        onLoaded={() => setLoading(false)}
                    />
                )}

                {source === 'direct' && (
                    <DirectPlayer url={url} thumbnail={thumbnail} />
                )}

                {source === 'unknown' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-4 p-8 text-center">
                        {thumbnail && <img src={thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />}
                        <Play className="w-12 h-12 text-primary opacity-60 relative z-10" />
                        <p className="text-muted-foreground text-sm relative z-10">Video preview not available in browser.</p>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative z-10"
                        >
                            <Button className="lavender-gradient h-10 px-6 font-bold">
                                <ExternalLink className="w-4 h-4 mr-2" /> Open Video
                            </Button>
                        </a>
                    </div>
                )}
            </div>

            {/* Source badge */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border ${source === 'youtube' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                        source === 'vimeo' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                            source === 'direct' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                                'bg-white/5 border-white/10 text-muted-foreground'
                        }`}>
                        {source === 'youtube' ? '▶ YouTube' :
                            source === 'vimeo' ? '◉ Vimeo' :
                                source === 'direct' ? '⬢ Direct' : '? Unknown'}
                    </span>
                </div>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                    Open original <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </div>
    );
}
