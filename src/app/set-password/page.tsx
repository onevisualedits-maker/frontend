'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useAuth, useFirestore, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, UserPlus, Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { TurnstileCaptcha } from '@/components/ui/TurnstileCaptcha';
import { getAuthErrorMessage } from '@/lib/auth-errors';

export default function SetPasswordPage() {
    return (
        <Suspense fallback={<div className="h-screen flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>}>
            <SetPasswordContent />
        </Suspense>
    );
}

function SetPasswordContent() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [inviteId, setInviteId] = useState<string | null>(null);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [captchaError, setCaptchaError] = useState(false);

    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const paramInviteId = searchParams.get('inviteId');
    const { toast } = useToast();

    useEffect(() => {
        async function verifyInvite() {
            if (!email || !paramInviteId || !firestore) {
                setVerifying(false);
                return;
            }

            try {
                const inviteRef = doc(firestore, 'invitations', paramInviteId);
                const snapshot = await getDoc(inviteRef);

                if (snapshot.exists() && snapshot.data().email === email.toLowerCase()) {
                    setInviteId(snapshot.id);
                } else {
                    console.error('Invite does not match email or does not exist.');
                }
            } catch (err) {
                console.error('Invite lookup failed:', err);
            } finally {
                setVerifying(false);
            }
        }

        verifyInvite();
    }, [email, paramInviteId, firestore]);

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

    async function handleSetup(e: React.FormEvent) {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Error', description: 'Passwords do not match.' });
            return;
        }

        if (password.length < 6) {
            toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 6 characters.' });
            return;
        }

        if (!inviteId || !email || !firestore) {
            toast({ variant: 'destructive', title: 'Invalid Invite', description: 'This invitation is invalid or has expired.' });
            return;
        }

        if (!captchaToken) {
            toast({
                variant: 'destructive',
                title: 'Security Check Required',
                description: 'Please complete the CAPTCHA verification.',
            });
            return;
        }

        setLoading(true);

        try {
            if (!auth) throw new Error('auth/internal-error');
            const { user } = await createUserWithEmailAndPassword(auth, email, password);

            // Assign Admin Role
            const adminRef = doc(firestore, 'roles_admin', user.uid);
            setDocumentNonBlocking(adminRef, {
                email: user.email,
                setupDate: new Date().toISOString(),
                role: 'admin',
            }, { merge: true });

            // Clean up Invite
            deleteDocumentNonBlocking(doc(firestore, 'invitations', inviteId));

            toast({
                title: 'Account Created',
                description: 'Welcome to the Admin Portal. You are now logged in.',
            });

            router.push('/admin');
        } catch (error: unknown) {
            toast({
                variant: 'destructive',
                title: 'Setup Failed',
                description: getAuthErrorMessage(error),
            });
        } finally {
            setLoading(false);
        }
    }

    if (verifying) {
        return <div className="h-screen flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
    }

    if (!email || !inviteId) {
        return (
            <div className="h-screen flex flex-col justify-center items-center p-4">
                <ShieldCheck className="w-16 h-16 text-muted-foreground/30 mb-6" />
                <h1 className="text-3xl font-headline font-bold uppercase tracking-tighter mb-4 text-center">Invalid Invitation</h1>
                <p className="text-muted-foreground mb-8 text-center max-w-sm">
                    We couldn't find a pending invitation for this link. It may have expired, or the account might already be set up.
                </p>
                <Link href="/login">
                    <Button className="lavender-gradient"><ArrowLeft className="w-4 h-4 mr-2" /> Go to Login</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md glass-card border-white/10 shadow-2xl">
                <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-2xl lavender-gradient flex items-center justify-center text-white shadow-xl rotate-3">
                            <UserPlus className="w-10 h-10" />
                        </div>
                    </div>
                    <CardTitle className="font-headline text-3xl uppercase tracking-tighter">
                        Join <span className="text-primary">Team</span>
                    </CardTitle>
                    <CardDescription>You've been invited! Set your secure password to access the portal.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSetup} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Email Address</label>
                            <Input
                                type="email"
                                value={email || ''}
                                readOnly
                                className="glass-card border-white/10 h-12 text-muted-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Set Password</label>
                            <Input
                                id="set-password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                autoComplete="new-password"
                                className="glass-card border-white/10 h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Confirm Password</label>
                            <Input
                                id="confirm-password"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                autoComplete="new-password"
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
                            id="set-password-submit"
                            disabled={loading || !captchaToken}
                            className="w-full h-14 text-lg font-bold lavender-gradient shadow-xl"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Create Account'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
