
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Star, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { cn } from '@/lib/utils';

const schema = z.object({
    name: z.string().min(2, 'Name is required'),
    role: z.string().optional(),
    quote: z.string().min(15, 'Please write at least 15 characters'),
    rating: z.number().min(1).max(5),
});

type FormValues = z.infer<typeof schema>;

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(s => (
                <button
                    key={s}
                    type="button"
                    onClick={() => onChange(s)}
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    className="transition-transform hover:scale-125"
                >
                    <Star
                        className={cn(
                            'w-8 h-8 transition-colors',
                            s <= (hover || value)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-white/20'
                        )}
                    />
                </button>
            ))}
        </div>
    );
}

export default function TestimonialsSubmitPage() {
    const firestore = useFirestore();
    const [submitted, setSubmitted] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', role: '', quote: '', rating: 5 },
    });

    async function onSubmit(values: FormValues) {
        if (!firestore) return;
        addDocumentNonBlocking(collection(firestore, 'testimonials'), {
            ...values,
            approved: false,          // goes to admin Pending queue
            createdAt: new Date().toISOString(),
        });
        setSubmitted(true);
    }

    if (submitted) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 gap-6">
                <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <div>
                    <h2 className="font-headline text-3xl font-bold uppercase tracking-tighter mb-3">
                        Thank You!
                    </h2>
                    <p className="text-muted-foreground max-w-md">
                        Your review has been submitted successfully. Once approved, it will appear on the site.
                    </p>
                </div>
                <Button variant="outline" className="glass-card" onClick={() => { form.reset(); setSubmitted(false); }}>
                    Submit another review
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
                <p className="text-xs text-primary font-bold uppercase tracking-[4px] mb-3">Clients</p>
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-4">
                    Leave a <span className="text-primary">Review</span>
                </h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Worked with Jeevan? Share your experience — reviews are reviewed before going live.
                </p>
            </div>

            <div className="glass-card p-10 rounded-[3rem] shadow-2xl border-primary/10">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="uppercase tracking-widest text-[10px] font-bold">Your Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Jane Smith" {...field} className="glass-card border-white/10 h-12" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="uppercase tracking-widest text-[10px] font-bold">Role / Company</FormLabel>
                                        <FormControl>
                                            <Input placeholder="CEO at AwesomeCo" {...field} className="glass-card border-white/10 h-12" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="uppercase tracking-widest text-[10px] font-bold">Star Rating *</FormLabel>
                                    <FormControl>
                                        <StarPicker value={field.value} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="quote"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="uppercase tracking-widest text-[10px] font-bold">Your Review *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Tell us about your experience working with Jeevan..."
                                            className="min-h-[160px] glass-card border-white/10 resize-none p-4"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full h-14 text-lg font-bold lavender-gradient shadow-xl hover:shadow-primary/40 transition-shadow">
                            Submit Review <Send className="ml-2 w-5 h-5" />
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
