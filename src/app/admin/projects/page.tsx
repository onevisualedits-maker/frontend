'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Video, ExternalLink, X, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function AdminProjectsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const projectsQuery = useMemoFirebase(() => collection(firestore, 'projects'), [firestore]);
  const { data: projects, isLoading } = useCollection(projectsQuery);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    category: 'Travel',
    year: new Date().getFullYear().toString(),
    duration: ''
  });

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      videoUrl: '',
      thumbnailUrl: '',
      category: 'Travel',
      year: new Date().getFullYear().toString(),
      duration: ''
    });
    setEditingProject(null);
  }

  function handleAddOrUpdate() {
    if (!formData.title || !formData.videoUrl) return;

    if (editingProject) {
      const docRef = doc(firestore, 'projects', editingProject.id);
      updateDocumentNonBlocking(docRef, formData);
      toast({ title: "Project Updated", description: `${formData.title} has been updated.` });
    } else {
      const colRef = collection(firestore, 'projects');
      addDocumentNonBlocking(colRef, {
        ...formData,
        creationDate: new Date().toISOString(),
        displayOrder: (projects?.length || 0) + 1
      });
      toast({ title: "Project Added", description: `${formData.title} has been added to gallery.` });
    }

    setIsDialogOpen(false);
    resetForm();
  }

  function handleDelete(id: string) {
    if (confirm('Delete this project?')) {
      const docRef = doc(firestore, 'projects', id);
      deleteDocumentNonBlocking(docRef);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-headline text-4xl font-bold uppercase tracking-tighter mb-2">
            Manage <span className="text-primary">Projects</span>
          </h1>
          <p className="text-muted-foreground">Add and edit your portfolio showcases.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="lavender-gradient h-12 px-6 font-bold shadow-lg">
              <Plus className="w-5 h-5 mr-2" /> Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl glass-card border-white/10">
            <DialogHeader>
              <DialogTitle className="font-headline uppercase text-2xl">
                {editingProject ? 'Edit Project' : 'New Video Project'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Title</label>
                  <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="glass-card border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full h-10 px-3 rounded-md border border-white/10 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {["Music Video", "Commercial", "Wedding", "Travel", "Vlog"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="glass-card border-white/10" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Video URL (Vimeo/YT)</label>
                  <Input value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} className="glass-card border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Thumbnail URL</label>
                  <Input value={formData.thumbnailUrl} onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} className="glass-card border-white/10" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Year</label>
                  <Input value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="glass-card border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Duration (e.g. 3:45)</label>
                  <Input value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="glass-card border-white/10" />
                </div>
              </div>

              <Button onClick={handleAddOrUpdate} className="lavender-gradient h-12 font-bold shadow-xl mt-4">
                {editingProject ? <Save className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                {editingProject ? 'Save Changes' : 'Create Project'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">Loading projects...</div>
        ) : projects?.map((project) => (
          <Card key={project.id} className="glass-card border-white/10 overflow-hidden group">
            <div className="relative aspect-video">
              <Image 
                src={project.thumbnailUrl || 'https://picsum.photos/seed/placeholder/800/450'} 
                alt={project.title} 
                fill 
                className="object-cover opacity-60 group-hover:opacity-80 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-2">
                  <Button variant="secondary" size="icon" onClick={() => { setEditingProject(project); setFormData(project); setIsDialogOpen(true); }}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(project.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <CardHeader className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-headline font-bold text-xl">{project.title}</h3>
                  <p className="text-sm text-muted-foreground">{project.category} • {project.year}</p>
                </div>
                <a href={project.videoUrl} target="_blank" className="text-primary hover:scale-110 transition-transform">
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
