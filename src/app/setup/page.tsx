'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth, useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, UserPlus, Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { TurnstileCaptcha } from '@/components/ui/TurnstileCaptcha';
import { getAuthErrorMessage } from '@/lib/auth-errors';

export default function SetupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState(false);

  const auth = useAuth();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user && isInitializing) {
      const adminRef = doc(firestore, 'roles_admin', user.uid);
      setDocumentNonBlocking(adminRef, {
        email: user.email,
        setupDate: new Date().toISOString(),
        role: 'super-admin',
      }, { merge: true });

      toast({
        title: 'Admin Initialized',
        description: 'Your administrative account has been created successfully.',
      });

      router.push('/admin');
    }
  }, [user, isInitializing, firestore, router, toast]);

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

    if (!captchaToken) {
      toast({
        variant: 'destructive',
        title: 'Security Check Required',
        description: 'Please complete the CAPTCHA verification.',
      });
      return;
    }

    setLoading(true);
    setIsInitializing(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      setLoading(false);
      setIsInitializing(false);
      toast({
        variant: 'destructive',
        title: 'Setup Failed',
        description: getAuthErrorMessage(error),
      });
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
              <ShieldCheck className="w-10 h-10" />
            </div>
          </div>
          <CardTitle className="font-headline text-3xl uppercase tracking-tighter">
            System <span className="text-primary">Setup</span>
          </CardTitle>
          <CardDescription>Create the primary administrator account for the portfolio.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetup} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Admin Email</label>
              <Input
                id="setup-email"
                type="email"
                placeholder="admin@jeevaneditz.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="glass-card border-white/10 h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Master Password</label>
              <Input
                id="setup-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
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
              id="setup-submit"
              disabled={loading || !captchaToken}
              className="w-full h-14 text-lg font-bold lavender-gradient shadow-xl"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <span className="flex items-center gap-2"><UserPlus className="w-5 h-5" /> Initialize Admin</span>
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 leading-relaxed">
              This initialization page is intended for the first-time deployment to establish root administrative access.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
