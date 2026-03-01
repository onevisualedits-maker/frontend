
'use client';

import { useState, useEffect } from 'react';
import { useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Save, Globe, Share2, Mail, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(firestore, 'siteSettings', 'singleton'), [firestore]);
  const { data: settingsData, isLoading } = useDoc(settingsRef);
  
  const [formData, setFormData] = useState({
    siteName: 'FrameCraft Portfolio',
    contactEmail: 'contact@jeevaneditz.com',
    youtubeUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    maintenanceMode: false
  });

  useEffect(() => {
    if (settingsData) {
      setFormData({
        siteName: settingsData.siteName || 'FrameCraft Portfolio',
        contactEmail: settingsData.contactEmail || 'contact@jeevaneditz.com',
        youtubeUrl: settingsData.youtubeUrl || '',
        instagramUrl: settingsData.instagramUrl || '',
        twitterUrl: settingsData.twitterUrl || '',
        maintenanceMode: !!settingsData.maintenanceMode
      });
    }
  }, [settingsData]);

  function handleSave() {
    setDocumentNonBlocking(settingsRef, formData, { merge: true });
    toast({
      title: "Settings Saved",
      description: "Global configuration has been updated.",
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
      <div>
        <h1 className="font-headline text-4xl font-bold uppercase tracking-tighter mb-2">
          Site <span className="text-primary">Settings</span>
        </h1>
        <p className="text-muted-foreground">Configure global portfolio variables and social connections.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline uppercase text-xl">
              <Globe className="text-primary w-5 h-5" /> General
            </CardTitle>
            <CardDescription>Basic site identity and communication.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">Site Title</label>
              <Input value={formData.siteName} onChange={e => setFormData({...formData, siteName: e.target.value})} className="glass-card" />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">Admin Contact Email</label>
              <Input value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} className="glass-card" />
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline uppercase text-xl">
              <Share2 className="text-primary w-5 h-5" /> Social Links
            </CardTitle>
            <CardDescription>URLs used in footer and contact sections.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">YouTube Channel</label>
              <Input value={formData.youtubeUrl} onChange={e => setFormData({...formData, youtubeUrl: e.target.value})} className="glass-card" placeholder="https://youtube.com/@..." />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">Instagram Profile</label>
              <Input value={formData.instagramUrl} onChange={e => setFormData({...formData, instagramUrl: e.target.value})} className="glass-card" placeholder="https://instagram.com/..." />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">Twitter / X</label>
              <Input value={formData.twitterUrl} onChange={e => setFormData({...formData, twitterUrl: e.target.value})} className="glass-card" placeholder="https://x.com/..." />
            </div>
          </CardContent>
        </Card>

        {/* Advanced / System */}
        <Card className="glass-card border-white/10 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline uppercase text-xl">
              <ShieldAlert className="text-destructive w-5 h-5" /> System Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between p-8 bg-destructive/5 rounded-2xl border border-destructive/10">
            <div>
              <p className="font-bold uppercase tracking-tighter text-lg">Maintenance Mode</p>
              <p className="text-sm text-muted-foreground">Temporarily disable public access to your portfolio while updating.</p>
            </div>
            <Switch checked={formData.maintenanceMode} onCheckedChange={(val) => setFormData({...formData, maintenanceMode: val})} />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="lavender-gradient h-14 px-12 font-bold text-lg shadow-2xl">
          <Save className="w-5 h-5 mr-2" /> Save Settings
        </Button>
      </div>
    </div>
  );
}
