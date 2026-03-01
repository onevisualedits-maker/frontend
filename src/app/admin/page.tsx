'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Inbox, Video, FileText, Briefcase, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const firestore = useFirestore();

  const newSubmissionsQuery = useMemoFirebase(() => collection(firestore, 'contactSubmissions'), [firestore]);
  const { data: submissions } = useCollection(newSubmissionsQuery);

  const projectsQuery = useMemoFirebase(() => collection(firestore, 'projects'), [firestore]);
  const { data: projects } = useCollection(projectsQuery);

  const blogQuery = useMemoFirebase(() => collection(firestore, 'blogPosts'), [firestore]);
  const { data: blogs } = useCollection(blogQuery);

  const stats = [
    { label: 'Total Projects', value: projects?.length || 0, icon: Video, color: 'text-blue-500' },
    { label: 'Active Services', value: 3, icon: Briefcase, color: 'text-purple-500' },
    { label: 'Blog Posts', value: blogs?.length || 0, icon: FileText, color: 'text-green-500' },
    { label: 'New Inquiries', value: submissions?.filter(s => s.status === 'New').length || 0, icon: Inbox, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-headline text-4xl font-bold uppercase tracking-tighter mb-2">
          Admin <span className="text-primary">Dashboard</span>
        </h1>
        <p className="text-muted-foreground">Welcome back, Jeevan. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="glass-card border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" /> +4% from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="font-headline uppercase text-xl">Recent Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submissions?.slice(0, 5).map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <p className="font-bold">{sub.name}</p>
                    <p className="text-xs text-muted-foreground">{sub.email}</p>
                  </div>
                  <Link href="/admin/inbox" className="text-xs font-bold text-primary uppercase tracking-tighter hover:underline">
                    View
                  </Link>
                </div>
              ))}
              {(!submissions || submissions.length === 0) && (
                <p className="text-center py-10 text-muted-foreground italic">No inquiries yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="font-headline uppercase text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link href="/admin/projects" className="p-6 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col items-center gap-3 hover:bg-primary/20 transition-all">
              <Video className="text-primary w-8 h-8" />
              <span className="font-bold text-sm">New Project</span>
            </Link>
            <Link href="/admin/blog" className="p-6 rounded-2xl bg-secondary/10 border border-secondary/20 flex flex-col items-center gap-3 hover:bg-secondary/20 transition-all">
              <FileText className="text-secondary w-8 h-8" />
              <span className="font-bold text-sm">Write Blog</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
