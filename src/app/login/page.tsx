'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlayCircle, Lock, Mail, Loader2, Settings, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { TurnstileCaptcha } from '@/components/ui/TurnstileCaptcha';
import { getAuthErrorMessage } from '@/lib/auth-errors';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState(false);

  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      router.push('/admin');
    }
  }, [user, router]);

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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!captchaToken) {
      toast({
        variant: 'destructive',
        title: 'Security Check Required',
        description: 'Please complete the CAPTCHA verification before signing in.',
      });
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin');
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: getAuthErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-8">
      <Card className="w-full max-w-md glass-card border-white/10 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl lavender-gradient flex items-center justify-center text-white shadow-xl rotate-3">
              <PlayCircle className="w-10 h-10" />
            </div>
          </div>
          <CardTitle className="font-headline text-3xl uppercase tracking-tighter">
            Admin <span className="text-primary">Portal</span>
          </CardTitle>
          <CardDescription>Secure access for JeevanEditz team members only.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-2">
                <Mail className="w-3 h-3" /> Email Address
              </label>
              <Input
                id="login-email"
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
              <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-2">
                <Lock className="w-3 h-3" /> Password
              </label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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
              id="login-submit"
              disabled={loading || !captchaToken}
              className="w-full h-14 text-lg font-bold lavender-gradient shadow-xl"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Enter Dashboard'}
            </Button>

            <div className="text-center mt-4">
              <Link href="/forgot-password" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                Forgot your password?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <Link href="/setup" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest font-bold">
        <Settings className="w-4 h-4" /> System Setup
      </Link>
    </div>
  );
}
