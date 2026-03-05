
'use client';

import { useState, useEffect } from 'react';
import { useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Save, Globe, Share2, ShieldAlert, Phone, MapPin, Send, Facebook, Linkedin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_FORM = {
  siteName: 'JeevanEditz',
  contactEmail: 'contact@jeevaneditz.com',
  phone: '',
  whatsapp: '',
  address: '',
  city: '',
  country: '',
  youtubeUrl: '',
  instagramUrl: '',
  twitterUrl: '',
  telegramUrl: '',
  facebookUrl: '',
  linkedinUrl: '',
  maintenanceMode: false,
};

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'siteSettings', 'singleton') : null),
    [firestore]
  );
  const { data: settingsData, isLoading } = useDoc(settingsRef);

  const [formData, setFormData] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (settingsData) {
      setFormData({
        siteName: settingsData.siteName ?? DEFAULT_FORM.siteName,
        contactEmail: settingsData.contactEmail ?? DEFAULT_FORM.contactEmail,
        phone: settingsData.phone ?? '',
        whatsapp: settingsData.whatsapp ?? '',
        address: settingsData.address ?? '',
        city: settingsData.city ?? '',
        country: settingsData.country ?? '',
        youtubeUrl: settingsData.youtubeUrl ?? '',
        instagramUrl: settingsData.instagramUrl ?? '',
        twitterUrl: settingsData.twitterUrl ?? '',
        telegramUrl: settingsData.telegramUrl ?? '',
        facebookUrl: settingsData.facebookUrl ?? '',
        linkedinUrl: settingsData.linkedinUrl ?? '',
        maintenanceMode: !!settingsData.maintenanceMode,
      });
    }
  }, [settingsData]);

  function set(key: keyof typeof formData, value: string | boolean) {
    setFormData(prev => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    if (!settingsRef) return;
    setDocumentNonBlocking(settingsRef, formData, { merge: true });
    toast({
      title: '✅ Settings Saved',
      description: 'All changes are now live on the site.',
    });
  }

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── General ─────────────────────────────────────────────────────── */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline uppercase text-xl">
              <Globe className="text-primary w-5 h-5" /> General
            </CardTitle>
            <CardDescription>Basic site identity and contact email.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">Site Title</label>
              <Input
                value={formData.siteName}
                onChange={e => set('siteName', e.target.value)}
                className="glass-card"
                placeholder="JeevanEditz"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">Contact Email</label>
              <Input
                value={formData.contactEmail}
                onChange={e => set('contactEmail', e.target.value)}
                className="glass-card"
                placeholder="contact@example.com"
                type="email"
              />
              <p className="text-[11px] text-muted-foreground">Shown on the Contact page and footer.</p>
            </div>
          </CardContent>
        </Card>

        {/* ── Phone & WhatsApp ─────────────────────────────────────────────── */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline uppercase text-xl">
              <Phone className="text-primary w-5 h-5" /> Phone &amp; WhatsApp
            </CardTitle>
            <CardDescription>Numbers displayed on the Contact page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">Phone Number</label>
              <Input
                value={formData.phone}
                onChange={e => set('phone', e.target.value)}
                className="glass-card"
                placeholder="+91 98765 43210"
              />
              <p className="text-[11px] text-muted-foreground">Include country code for tel: links.</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">WhatsApp Number</label>
              <Input
                value={formData.whatsapp}
                onChange={e => set('whatsapp', e.target.value)}
                className="glass-card"
                placeholder="+91 98765 43210"
              />
              <p className="text-[11px] text-muted-foreground">
                Leave blank to use the phone number above. Digits only for the wa.me link.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Address ─────────────────────────────────────────────────────── */}
        <Card className="glass-card border-white/10 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline uppercase text-xl">
              <MapPin className="text-primary w-5 h-5" /> Address &amp; Location
            </CardTitle>
            <CardDescription>Shown in the contact info block on the Contact page.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-3 space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">Street Address</label>
              <Input
                value={formData.address}
                onChange={e => set('address', e.target.value)}
                className="glass-card"
                placeholder="123 Edit Street, Studio 4"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">City</label>
              <Input
                value={formData.city}
                onChange={e => set('city', e.target.value)}
                className="glass-card"
                placeholder="London"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">Country</label>
              <Input
                value={formData.country}
                onChange={e => set('country', e.target.value)}
                className="glass-card"
                placeholder="United Kingdom"
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Social Links ─────────────────────────────────────────────────── */}
        <Card className="glass-card border-white/10 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline uppercase text-xl">
              <Share2 className="text-primary w-5 h-5" /> Social Links
            </CardTitle>
            <CardDescription>URLs used in the footer and contact sections.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Row 1 */}
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">YouTube Channel</label>
              <Input
                value={formData.youtubeUrl}
                onChange={e => set('youtubeUrl', e.target.value)}
                className="glass-card"
                placeholder="https://youtube.com/@..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">Instagram Profile</label>
              <Input
                value={formData.instagramUrl}
                onChange={e => set('instagramUrl', e.target.value)}
                className="glass-card"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">Twitter / X</label>
              <Input
                value={formData.twitterUrl}
                onChange={e => set('twitterUrl', e.target.value)}
                className="glass-card"
                placeholder="https://x.com/..."
              />
            </div>

            {/* Row 2 — new platforms */}
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-sky-400" /> Telegram
              </label>
              <Input
                value={formData.telegramUrl}
                onChange={e => set('telegramUrl', e.target.value)}
                className="glass-card"
                placeholder="https://t.me/..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                <Facebook className="w-3.5 h-3.5 text-blue-500" /> Facebook
              </label>
              <Input
                value={formData.facebookUrl}
                onChange={e => set('facebookUrl', e.target.value)}
                className="glass-card"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5 text-blue-400" /> LinkedIn
              </label>
              <Input
                value={formData.linkedinUrl}
                onChange={e => set('linkedinUrl', e.target.value)}
                className="glass-card"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </CardContent>
        </Card>

        {/* ── System Controls ───────────────────────────────────────────────── */}
        <Card className="glass-card border-white/10 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline uppercase text-xl">
              <ShieldAlert className="text-destructive w-5 h-5" /> System Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between p-8 bg-destructive/5 rounded-2xl border border-destructive/10">
            <div>
              <p className="font-bold uppercase tracking-tighter text-lg">Maintenance Mode</p>
              <p className="text-sm text-muted-foreground">
                Temporarily disable public access to your portfolio while updating.
              </p>
            </div>
            <Switch
              checked={formData.maintenanceMode}
              onCheckedChange={val => set('maintenanceMode', val)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="lavender-gradient h-14 px-12 font-bold text-lg shadow-2xl">
          <Save className="w-5 h-5 mr-2" /> Save All Settings
        </Button>
      </div>
    </div>
  );
}
