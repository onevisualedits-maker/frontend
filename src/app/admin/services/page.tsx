
'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Briefcase, Save, Scissors, Film, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function AdminServicesPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const servicesQuery = useMemoFirebase(() => collection(firestore, 'services'), [firestore]);
  const { data: services, isLoading } = useCollection(servicesQuery);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    longDescription: '',
    priceInfo: '',
    iconUrl: '',
    displayOrder: 1
  });

  function resetForm() {
    setFormData({
      title: '',
      shortDescription: '',
      longDescription: '',
      priceInfo: '',
      iconUrl: '',
      displayOrder: (services?.length || 0) + 1
    });
    setEditingService(null);
  }

  function handleSave() {
    if (!formData.title || !formData.shortDescription) return;

    if (editingService) {
      const docRef = doc(firestore, 'services', editingService.id);
      updateDocumentNonBlocking(docRef, formData);
      toast({ title: "Service Updated", description: `${formData.title} has been updated.` });
    } else {
      const colRef = collection(firestore, 'services');
      addDocumentNonBlocking(colRef, formData);
      toast({ title: "Service Added", description: `${formData.title} is now active.` });
    }

    setIsDialogOpen(false);
    resetForm();
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to remove this service?')) {
      const docRef = doc(firestore, 'services', id);
      deleteDocumentNonBlocking(docRef);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-headline text-4xl font-bold uppercase tracking-tighter mb-2">
            Service <span className="text-primary">Management</span>
          </h1>
          <p className="text-muted-foreground">Manage the editing packages and services you offer.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="lavender-gradient h-12 px-6 font-bold shadow-lg">
              <Plus className="w-5 h-5 mr-2" /> Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl glass-card border-white/10">
            <DialogHeader>
              <DialogTitle className="font-headline uppercase text-2xl">
                {editingService ? 'Edit Service' : 'New Service Package'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Service Title</label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="glass-card border-white/10" placeholder="e.g. Cinematic Color Grading" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Short Summary</label>
                <Input value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})} className="glass-card border-white/10" placeholder="Brief catchphrase for the service card" />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Detailed Description</label>
                <Textarea value={formData.longDescription} onChange={e => setFormData({...formData, longDescription: e.target.value})} className="glass-card border-white/10 min-h-[120px]" placeholder="List features, workflow, etc." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pricing Info</label>
                  <Input value={formData.priceInfo} onChange={e => setFormData({...formData, priceInfo: e.target.value})} className="glass-card border-white/10" placeholder="e.g. $499 or Starting at..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Display Order</label>
                  <Input type="number" value={formData.displayOrder} onChange={e => setFormData({...formData, displayOrder: parseInt(e.target.value)})} className="glass-card border-white/10" />
                </div>
              </div>

              <Button onClick={handleSave} className="lavender-gradient h-12 font-bold shadow-xl mt-4">
                <Save className="w-5 h-5 mr-2" /> {editingService ? 'Update Service' : 'Create Service'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground">Loading services...</div>
        ) : services?.sort((a,b) => a.displayOrder - b.displayOrder).map((service) => (
          <Card key={service.id} className="glass-card border-white/10 group overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Briefcase className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-headline uppercase">{service.title}</h3>
                  <p className="text-primary font-bold text-lg">{service.priceInfo}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => { setEditingService(service); setFormData(service); setIsDialogOpen(true); }}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(service.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <p className="text-muted-foreground leading-relaxed italic">"{service.shortDescription}"</p>
                <div className="mt-4 pt-4 border-t border-white/5 text-sm text-foreground/70">
                  {service.longDescription}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {services?.length === 0 && !isLoading && (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem]">
            <p className="text-muted-foreground italic">No services listed yet. Click "Add Service" to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
