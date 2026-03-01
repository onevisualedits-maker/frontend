'use client';

import { useState } from 'react';
import {
  useCollection, useFirestore, useMemoFirebase,
  addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus, Trash2, Edit2, Briefcase, Save, X,
  DollarSign, Star, Hash, AlignLeft, Search, Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EMPTY_FORM = {
  title: '',
  shortDescription: '',
  longDescription: '',
  priceInfo: '',
  displayOrder: 1,
  popular: false,
};

type FormData = typeof EMPTY_FORM;

const ICON_MAP: Record<number, string> = { 1: '✂️', 2: '🎬', 3: '⚡', 4: '🏆', 5: '🎵', 6: '📱' };

export default function AdminServicesPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const servicesQuery = useMemoFirebase(() => collection(firestore, 'services'), [firestore]);
  const { data: services, isLoading } = useCollection(servicesQuery);

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({ ...EMPTY_FORM });
  const [search, setSearch] = useState('');

  function set(field: keyof FormData, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function openAdd() {
    setEditingService(null);
    setFormData({ ...EMPTY_FORM, displayOrder: (services?.length || 0) + 1 });
    setPanelOpen(true);
  }

  function openEdit(service: any) {
    setEditingService(service);
    setFormData({ ...EMPTY_FORM, ...service });
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setEditingService(null);
  }

  function handleSave() {
    if (!formData.title.trim() || !formData.shortDescription.trim()) {
      toast({ variant: 'destructive', title: 'Title and summary are required' });
      return;
    }
    if (editingService) {
      updateDocumentNonBlocking(doc(firestore, 'services', editingService.id), formData);
      toast({ title: 'Service updated', description: formData.title });
    } else {
      addDocumentNonBlocking(collection(firestore, 'services'), formData);
      toast({ title: 'Service created', description: formData.title });
    }
    closePanel();
  }

  function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteDocumentNonBlocking(doc(firestore, 'services', id));
    toast({ title: 'Service deleted' });
  }

  function togglePopular(service: any) {
    updateDocumentNonBlocking(doc(firestore, 'services', service.id), { popular: !service.popular });
    toast({ title: service.popular ? 'Unmarked as popular' : 'Marked as popular' });
  }

  const sorted = [...(services || [])]
    .filter(s => !search || s.title?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <div className="space-y-8 relative">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="font-headline text-4xl font-bold uppercase tracking-tighter mb-1">
            Service <span className="text-primary">Management</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {services?.length || 0} packages · {services?.filter(s => s.popular).length || 0} marked as popular
          </p>
        </div>
        <Button onClick={openAdd} className="lavender-gradient h-11 px-6 font-bold shadow-lg shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Add Service
        </Button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Packages', value: services?.length || 0, icon: Package, color: 'text-blue-400' },
          { label: 'Popular Pick', value: services?.find(s => s.popular)?.title || '—', icon: Star, color: 'text-yellow-400' },
          { label: 'Avg Price Listed', value: services?.filter(s => s.priceInfo).length || 0, icon: DollarSign, color: 'text-green-400' },
          { label: 'With Details', value: services?.filter(s => s.longDescription).length || 0, icon: AlignLeft, color: 'text-purple-400' },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-xl p-4 flex items-center gap-3">
            <s.icon className={`w-7 h-7 ${s.color} shrink-0`} />
            <div className="min-w-0">
              <p className="text-xl font-bold font-headline truncate">{s.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services…" className="glass-card border-white/10 pl-9 h-10" />
        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"><X className="w-4 h-4" /></button>}
      </div>

      {/* ── Service Cards ── */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 glass-card rounded-2xl shimmer" />)}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-white/10 rounded-3xl">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground font-medium">No services found</p>
          <Button onClick={openAdd} className="lavender-gradient mt-6 h-10 px-6 font-bold">
            <Plus className="w-4 h-4 mr-2" /> Create First Package
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((service, idx) => (
            <div key={service.id} className="glass-card border-white/10 rounded-2xl p-5 group animate-fade-up flex items-center gap-5">
              {/* Order badge + emoji */}
              <div className="w-12 h-12 rounded-xl lavender-gradient flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-lg">
                {ICON_MAP[service.displayOrder] || `#${service.displayOrder}`}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-headline font-bold text-lg truncate">{service.title}</h3>
                  {service.popular && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full lavender-gradient text-white font-bold uppercase tracking-widest shrink-0">Popular</span>
                  )}
                </div>
                <p className="text-primary font-bold text-sm mb-1">{service.priceInfo}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{service.shortDescription}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => togglePopular(service)}
                  className={`h-8 px-3 text-xs ${service.popular ? 'text-yellow-400 hover:text-yellow-300' : 'text-muted-foreground hover:text-yellow-400'}`}
                >
                  <Star className={`w-3.5 h-3.5 mr-1 ${service.popular ? 'fill-current' : ''}`} />
                  {service.popular ? 'Unstar' : 'Star'}
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10" onClick={() => openEdit(service)}>
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(service.id, service.title)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Slide-in Panel ── */}
      {panelOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={closePanel} />
          <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-card/95 backdrop-blur-xl border-l border-white/10 z-50 overflow-y-auto shadow-2xl animate-scale-in">
            <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-white/10 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="font-headline text-xl font-bold uppercase tracking-tight">
                  {editingService ? 'Edit Service' : 'New Package'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {editingService ? 'Update service details' : 'Create a new service offering'}
                </p>
              </div>
              <button onClick={closePanel} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Service Title *</label>
                <Input value={formData.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Cinematic Color Grading" className="glass-card border-white/10 h-11" />
              </div>

              {/* Short summary */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Short Summary *</label>
                <Input value={formData.shortDescription} onChange={e => set('shortDescription', e.target.value)} placeholder="Brief catchphrase for the card" className="glass-card border-white/10 h-11" />
              </div>

              {/* Price + Order */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Price Info</label>
                  <Input value={formData.priceInfo} onChange={e => set('priceInfo', e.target.value)} placeholder="e.g. $499 / Starting at..." className="glass-card border-white/10 h-11" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Display Order</label>
                  <Input type="number" value={formData.displayOrder} onChange={e => set('displayOrder', parseInt(e.target.value) || 1)} className="glass-card border-white/10 h-11" />
                </div>
              </div>

              {/* Popular toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="font-medium text-sm">Mark as Popular</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Shows a "Most Popular" badge on the public services page</p>
                </div>
                <button
                  onClick={() => set('popular', !formData.popular)}
                  className={`w-12 h-6 rounded-full transition-all relative ${formData.popular ? 'lavender-gradient' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${formData.popular ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Long description */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Detailed Description</label>
                <Textarea
                  value={formData.longDescription}
                  onChange={e => set('longDescription', e.target.value)}
                  placeholder="List features, deliverables, and workflow details. Each new line becomes a bullet."
                  className="glass-card border-white/10 min-h-[140px] text-sm"
                />
                <p className="text-xs text-muted-foreground">Each new line is displayed as a separate feature bullet.</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-white/10">
                <Button onClick={handleSave} className="lavender-gradient flex-1 h-11 font-bold shadow-xl">
                  <Save className="w-4 h-4 mr-2" />
                  {editingService ? 'Save Changes' : 'Create Service'}
                </Button>
                <Button variant="ghost" onClick={closePanel} className="h-11 px-4 glass-card border-white/10">Cancel</Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
