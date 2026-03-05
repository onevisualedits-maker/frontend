
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Video,
  Briefcase,
  FileText,
  UserCircle,
  Inbox,
  LogOut,
  ChevronRight,
  Settings,
  Clapperboard,
  Star,
} from 'lucide-react';
import { useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where } from 'firebase/firestore';

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Hero', href: '/admin/hero', icon: Clapperboard },
  { name: 'Projects', href: '/admin/projects', icon: Video },
  { name: 'Services', href: '/admin/services', icon: Briefcase },
  { name: 'Blog', href: '/admin/blog', icon: FileText },
  { name: 'Testimonials', href: '/admin/testimonials', icon: Star },
  { name: 'About Page', href: '/admin/about', icon: UserCircle },
  { name: 'Inbox', href: '/admin/inbox', icon: Inbox },
  { name: 'Users', href: '/admin/users', icon: UserCircle },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const auth = useAuth();
  const firestore = useFirestore();

  const pendingQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'testimonials'), where('approved', '==', false));
  }, [firestore]);
  const { data: pendingTestimonials } = useCollection(pendingQuery);
  const pendingCount = pendingTestimonials?.length ?? 0;

  return (
    <div className="w-64 glass-card border-r-0 border-y-0 rounded-none h-screen sticky top-0 flex flex-col p-6">
      <div className="mb-10 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg lavender-gradient flex items-center justify-center text-white">
          <LayoutDashboard className="w-5 h-5" />
        </div>
        <span className="font-headline font-bold text-xl uppercase tracking-tighter">
          Admin<span className="text-primary">Panel</span>
        </span>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl transition-all group",
                isActive
                  ? "lavender-gradient text-white shadow-lg"
                  : "hover:bg-white/5 text-muted-foreground hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-primary")} />
                <span className="font-medium">{item.name}</span>
                {item.href === '/admin/testimonials' && pendingCount > 0 && (
                  <span className="ml-auto text-[10px] font-black bg-yellow-500 text-black rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                    {pendingCount}
                  </span>
                )}
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-white/10">
        <button
          onClick={() => signOut(auth)}
          className="flex items-center gap-3 p-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
