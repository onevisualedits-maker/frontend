
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Play, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const categories = ["All", "Music Video", "Commercial", "Wedding", "Travel", "Vlog"];

const projects = [
  { id: "project-1", title: "Alpine Peaks", category: "Travel", year: "2024", duration: "2:45" },
  { id: "project-2", title: "Neon Pulse", category: "Music Video", year: "2023", duration: "3:12" },
  { id: "project-3", title: "Tech Sphere X", category: "Commercial", year: "2024", duration: "0:30" },
  { id: "project-4", title: "Eternal Vows", category: "Wedding", year: "2023", duration: "12:00" },
  { id: "project-1", title: "City Lights", category: "Vlog", year: "2024", duration: "8:20" },
  { id: "project-2", title: "Urban Beat", category: "Music Video", year: "2023", duration: "4:00" },
];

export default function WorkPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProjects = activeCategory === "All"
    ? projects
    : projects.filter(p => p.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
      <div className="mb-16">
        <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-6">
          Portfolio <span className="text-primary">Gallery</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-12">
          An exploration of style, motion, and narrative. Here is a curated selection of my professional work.
        </p>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "lavender-gradient text-white shadow-lg"
                  : "glass-card hover:border-primary/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project, idx) => {
          const img = PlaceHolderImages.find(p => p.id === project.id);
          return (
            <Dialog key={`${project.id}-${idx}`}>
              <DialogTrigger asChild>
                <div className="group cursor-pointer">
                  <div className="relative aspect-video overflow-hidden rounded-2xl glass-card mb-4">
                    <Image
                      src={img?.imageUrl || 'https://picsum.photos/seed/placeholder/800/600'}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      data-ai-hint={img?.imageHint || "video thumbnail"}
                    />
                    <div className="absolute inset-0 bg-background/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center text-white shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                        <Play className="fill-current ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur text-[10px] uppercase font-bold tracking-widest">
                        {project.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-start px-1">
                    <div>
                      <h3 className="font-headline font-bold text-xl mb-1 group-hover:text-primary transition-colors">{project.title}</h3>
                      <p className="text-sm text-muted-foreground">{project.year} • {project.duration}</p>
                    </div>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-5xl bg-background/95 border-border shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="font-headline text-3xl font-bold uppercase">{project.title}</DialogTitle>
                </DialogHeader>
                <div className="aspect-video w-full bg-black rounded-lg overflow-hidden flex items-center justify-center group relative">
                  <Image
                    src={img?.imageUrl || 'https://picsum.photos/seed/placeholder/800/600'}
                    alt={project.title}
                    fill
                    className="object-cover opacity-50 blur-sm"
                  />
                  <div className="z-10 text-center p-8">
                    <Play className="w-20 h-20 text-primary mx-auto mb-6 opacity-80" />
                    <p className="text-xl font-medium mb-6">Video Player Integration Placeholder</p>
                    <Button variant="secondary" className="lavender-gradient text-white">
                      Watch on Vimeo <ExternalLink className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <p className="text-muted-foreground leading-relaxed">
                    This project was a deep dive into cinematic storytelling for {project.category}. Focusing on fast-paced cuts and rhythmic transitions to create an immersive atmosphere.
                  </p>
                  <div className="flex gap-4 mt-2">
                    <div className="text-xs">
                      <span className="text-muted-foreground font-bold uppercase tracking-widest mr-1">Client:</span> Global Creatives
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground font-bold uppercase tracking-widest mr-1">Role:</span> Lead Editor & Colorist
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    </div>
  );
}
