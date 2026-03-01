'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { KeyRound, Mail, Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { TurnstileCaptcha } from '@/components/ui/TurnstileCaptcha';
import { getAuthErrorMessage } from '@/lib/auth-errors';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [captchaError, setCaptchaError] = useState(false);

    const auth = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleCaptchaVerify = useCallback((token: string) => {
        setCaptchaToken(token);
        setCaptchaError(false);
    }, []);

    const handleCaptchaExpire = useCallback(() => {
        setCaptchaToken(null);
    }, []);

    const handleCaptchaError = useCallback(() => {
        setCaptchaToken(null);
        setCaptchaError(true);
    }, []);

    async function handleReset(e: React.FormEvent) {
        e.preventDefault();

        if (!captchaToken) {
            toast({
                variant: 'destructive',
                title: 'Security Check Required',
                description: 'Please complete the CAPTCHA verification before resetting your password.',
            });
            return;
        }

        setLoading(true);
        try {
            if (!auth) throw new Error('auth/internal-error');
            await sendPasswordResetEmail(auth, email);
            toast({
                title: 'Reset Email Sent',
                description: 'Check your inbox for password reset instructions.',
            });
            router.push('/login');
        } catch (error: unknown) {
            toast({
                variant: 'destructive',
                title: 'Reset Failed',
                description: getAuthErrorMessage(error),
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="absolute top-8 left-8">
                <Link href="/login" className="flex items-center text-muted-foreground hover:text-primary transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Login
                </Link>
            </div>

            <Card className="w-full max-w-md glass-card border-white/10 shadow-2xl">
                <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-2xl lavender-gradient flex items-center justify-center text-white shadow-xl -rotate-3">
                            <KeyRound className="w-10 h-10" />
                        </div>
                    </div>
                    <CardTitle className="font-headline text-3xl uppercase tracking-tighter">
                        Reset <span className="text-primary">Password</span>
                    </CardTitle>
                    <CardDescription>Enter your email to receive a password reset link.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleReset} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-2">
                                <Mail className="w-3 h-3" /> Email Address
                            </label>
                            <Input
                                id="reset-email"
                                type="email"
                                placeholder="admin@jeevaneditz.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                className="glass-card border-white/10 h-12"
                            />
                        </div>

                        {/* Cloudflare Turnstile CAPTCHA */}
                        <div className="space-y-1">
                            <TurnstileCaptcha
                                onVerify={handleCaptchaVerify}
                                onExpire={handleCaptchaExpire}
                                onError={handleCaptchaError}
                            />
                            {captchaError && (
                                <p className="text-xs text-destructive flex items-center gap-1 justify-center mt-1">
                                    <ShieldAlert className="w-3 h-3" />
                                    CAPTCHA failed to load. Please refresh the page.
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            id="reset-submit"
                            disabled={loading || !captchaToken}
                            className="w-full h-14 text-lg font-bold lavender-gradient shadow-xl"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Send Reset Link'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
