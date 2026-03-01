'use client';

import { useState } from 'react';
import { Star, X, Send, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase';

export function GiveReviewButton() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const reviewsColRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'testimonials');
    }, [firestore]);

    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [quote, setQuote] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    function reset() {
        setRating(0); setHovered(0);
        setName(''); setRole(''); setQuote('');
        setDone(false);
    }

    async function handleSubmit() {
        if (!name.trim() || !quote.trim() || rating === 0) {
            toast({ variant: 'destructive', title: 'Please fill in your name, review, and a star rating.' });
            return;
        }
        if (!reviewsColRef) return;
        setLoading(true);
        try {
            addDocumentNonBlocking(reviewsColRef, {
                name: name.trim(),
                role: role.trim(),
                quote: quote.trim(),
                rating,
                avatar: name.trim().split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2),
                createdAt: new Date().toISOString(),
                approved: false, // admin must approve before it shows publicly
            });
            setDone(true);
            toast({ title: 'Review submitted! 🎉', description: 'Thank you — your review will appear after approval.' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {/* Floating trigger button */}
            <button
                onClick={() => { setOpen(true); reset(); }}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 lavender-gradient text-white text-xs font-bold uppercase tracking-widest px-4 py-3 rounded-full shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all animate-glow-pulse"
                aria-label="Give a review"
            >
                <Star className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">Give Review</span>
            </button>

            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Modal card */}
            {open && (
                <div className="fixed bottom-20 right-6 z-[70] w-[340px] sm:w-[380px] glass-card border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                    {/* Header */}
                    <div className="lavender-gradient px-5 py-4 flex items-center justify-between">
                        <div>
                            <h3 className="font-headline font-bold text-white text-sm uppercase tracking-wider">Leave a Review</h3>
                            <p className="text-white/70 text-[11px] mt-0.5">Your feedback means the world 🙏</p>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>

                    {done ? (
                        <div className="p-8 text-center">
                            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                            <p className="font-bold text-base mb-1">Thank you, {name}!</p>
                            <p className="text-xs text-muted-foreground">Your review has been submitted and will be published after approval.</p>
                            <Button onClick={() => setOpen(false)} className="lavender-gradient mt-5 h-9 px-6 font-bold text-sm">Close</Button>
                        </div>
                    ) : (
                        <div className="p-5 space-y-4">
                            {/* Star rating */}
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Rating</p>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <button
                                            key={s}
                                            onMouseEnter={() => setHovered(s)}
                                            onMouseLeave={() => setHovered(0)}
                                            onClick={() => setRating(s)}
                                            className="transition-transform hover:scale-125"
                                        >
                                            <Star
                                                className={`w-7 h-7 transition-colors ${s <= (hovered || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Your Name *</label>
                                <input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Rahul Sharma"
                                    className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder:text-white/30"
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Role / Company</label>
                                <input
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                    placeholder="e.g. YouTuber · 500K subs"
                                    className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder:text-white/30"
                                />
                            </div>

                            {/* Review */}
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Your Review *</label>
                                <textarea
                                    value={quote}
                                    onChange={e => setQuote(e.target.value)}
                                    placeholder="What was your experience working with Jeevan?"
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder:text-white/30 resize-none"
                                />
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={loading || !name || !quote || rating === 0}
                                className="lavender-gradient w-full h-10 font-bold text-sm"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                Submit Review
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
