"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Play, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

const categories = ["All", "Music Video", "Commercial", "Wedding", "Travel", "Vlog"];

export default function WorkPage() {
  const firestore = useFirestore();
  const projectsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'projects'), orderBy('creationDate', 'desc'));
  }, [firestore]);

  const { data: firebaseProjects, isLoading } = useCollection(projectsQuery);
  const projects = firebaseProjects || [];

  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProjects = activeCategory === "All"
    ? projects
    : projects.filter(p => p.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-4 animate-fade-up">
          Portfolio <span className="text-primary">Gallery</span>
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mb-8 animate-fade-up stagger-2">
          An exploration of style, motion, and narrative. Here is a curated selection of my professional work.
        </p>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-12 animate-fade-up stagger-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${activeCategory === cat
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
        {isLoading && <div className="col-span-full py-20 text-center text-muted-foreground shimmer rounded-2xl">Loading portfolio...</div>}
        {filteredProjects.map((project, idx) => {
          return (
            <Dialog key={`${project.id}-${idx}`}>
              <DialogTrigger asChild>
                <div className={`group cursor-pointer animate-fade-up stagger-${Math.min(idx + 1, 6)}`}>
                  <div className="relative aspect-video overflow-hidden rounded-2xl glass-card mb-4">
                    <Image
                      src={project.thumbnailUrl || 'https://picsum.photos/seed/placeholder/800/600'}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-background/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full lavender-gradient flex items-center justify-center text-white shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                        <Play className="fill-white w-6 h-6 ml-1" />
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
              <DialogContent className="max-w-4xl bg-background/98 border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl font-bold uppercase tracking-tighter">{project.title}</DialogTitle>
                </DialogHeader>

                {/* ── Video Player ── */}
                <div className="rounded-2xl overflow-hidden glass-card border-0 bg-black aspect-video">
                  <VideoPlayer
                    url={project.videoUrl || ''}
                    thumbnail={project.thumbnailUrl}
                    title={project.title}
                  />
                </div>

                {/* ── Project metadata ── */}
                <div className="mt-2 space-y-4">
                  {project.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {project.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
                    {project.category && (
                      <div className="text-xs">
                        <span className="text-muted-foreground font-bold uppercase tracking-widest mr-2">Category:</span>
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold">{project.category}</Badge>
                      </div>
                    )}
                    {project.client && (
                      <div className="text-xs">
                        <span className="text-muted-foreground font-bold uppercase tracking-widest mr-2">Client:</span>
                        <span className="text-foreground">{project.client}</span>
                      </div>
                    )}
                    {project.year && (
                      <div className="text-xs">
                        <span className="text-muted-foreground font-bold uppercase tracking-widest mr-2">Year:</span>
                        <span className="text-foreground">{project.year}</span>
                      </div>
                    )}
                    {project.duration && (
                      <div className="text-xs">
                        <span className="text-muted-foreground font-bold uppercase tracking-widest mr-2">Duration:</span>
                        <span className="text-foreground">{project.duration}</span>
                      </div>
                    )}
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
