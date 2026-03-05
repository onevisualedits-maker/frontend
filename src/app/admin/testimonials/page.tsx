
'use client';

import { useState } from 'react';
import {
    useCollection,
    useFirestore,
    useMemoFirebase,
    setDocumentNonBlocking,
} from '@/firebase';
import { collection, orderBy, query, doc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Star,
    CheckCircle2,
    XCircle,
    Trash2,
    Loader2,
    MessageSquareQuote,
    Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Tab = 'pending' | 'approved';

interface Testimonial {
    id: string;
    name: string;
    role: string;
    quote: string;
    rating: number;
    approved: boolean;
    createdAt: string;
}

export default function TestimonialsPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [tab, setTab] = useState<Tab>('pending');

    const testimonialsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'testimonials'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: all, isLoading } = useCollection(testimonialsQuery);
    const testimonials = (all || []) as Testimonial[];

    const pending = testimonials.filter(t => t.approved === false);
    const approved = testimonials.filter(t => t.approved === true || t.approved === undefined);
    const displayed = tab === 'pending' ? pending : approved;

    // ── Actions ───────────────────────────────────────────────────────────────
    function approve(t: Testimonial) {
        if (!firestore) return;
        setDocumentNonBlocking(doc(firestore, 'testimonials', t.id), { approved: true }, { merge: true });
        toast({ title: '✅ Approved', description: `${t.name}'s review is now live on the site.` });
    }

    function unpublish(t: Testimonial) {
        if (!firestore) return;
        setDocumentNonBlocking(doc(firestore, 'testimonials', t.id), { approved: false }, { merge: true });
        toast({ title: '🚫 Unpublished', description: `${t.name}'s review has been hidden from the site.` });
    }

    async function remove(t: Testimonial) {
        if (!firestore) return;
        await deleteDoc(doc(firestore, 'testimonials', t.id));
        toast({ title: '🗑️ Deleted', description: 'Testimonial permanently removed.' });
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-8 max-w-5xl">

            {/* Description */}
            <p className="text-muted-foreground">
                Client reviews submitted from the live site land here as <span className="text-yellow-400 font-semibold">Pending</span>. Approve them to publish on the homepage.
            </p>

            {/* Tabs */}
            <div className="flex gap-3">
                {(['pending', 'approved'] as Tab[]).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={cn(
                            'px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2',
                            tab === t
                                ? 'lavender-gradient text-white shadow-lg shadow-primary/20'
                                : 'glass-card text-muted-foreground hover:text-white'
                        )}
                    >
                        {t === 'pending' ? (
                            <>
                                <Clock className="w-4 h-4" />
                                Pending
                                {pending.length > 0 && (
                                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px] px-1.5">
                                        {pending.length}
                                    </Badge>
                                )}
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                Approved
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] px-1.5">
                                    {approved.length}
                                </Badge>
                            </>
                        )}
                    </button>
                ))}
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex items-center justify-center h-60">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : displayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-muted-foreground gap-4 glass-card rounded-3xl border border-white/5">
                    <MessageSquareQuote className="w-14 h-14 opacity-20" />
                    <p className="italic text-sm">
                        {tab === 'pending'
                            ? "No pending reviews — you're all caught up! 🎉"
                            : 'No approved testimonials yet. Approve some from the Pending tab.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {displayed.map(t => (
                        <div
                            key={t.id}
                            className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col md:flex-row gap-6 items-start hover:border-primary/20 transition-all duration-200"
                        >
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full lavender-gradient flex items-center justify-center text-white font-black text-base shrink-0 shadow-lg">
                                {t.name?.slice(0, 2).toUpperCase() || '??'}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap mb-1.5">
                                    <p className="font-bold text-base">{t.name}</p>
                                    {t.role && (
                                        <span className="text-xs text-muted-foreground border border-white/10 px-2 py-0.5 rounded-full">
                                            {t.role}
                                        </span>
                                    )}
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: t.rating || 5 }).map((_, i) => (
                                            <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed italic line-clamp-3">
                                    &ldquo;{t.quote}&rdquo;
                                </p>
                                <p className="text-[11px] text-muted-foreground/40 mt-2">
                                    Submitted:{' '}
                                    {t.createdAt
                                        ? new Date(t.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric',
                                        })
                                        : 'Unknown'}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 shrink-0 flex-wrap self-center">
                                {tab === 'pending' && (
                                    <Button
                                        size="sm"
                                        onClick={() => approve(t)}
                                        className="bg-green-500/15 hover:bg-green-500/30 text-green-400 border border-green-500/30 font-bold h-9 px-4"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve
                                    </Button>
                                )}
                                {tab === 'approved' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => unpublish(t)}
                                        className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border-yellow-500/30 font-bold h-9 px-4"
                                    >
                                        <XCircle className="w-4 h-4 mr-1.5" /> Unpublish
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => remove(t)}
                                    className="bg-destructive/10 hover:bg-destructive/25 text-destructive border-destructive/30 font-bold h-9 w-9 p-0"
                                    title="Delete permanently"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
