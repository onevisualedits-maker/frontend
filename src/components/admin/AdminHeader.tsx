
'use client';

import { usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import {
    LayoutDashboard,
    Video,
    Briefcase,
    FileText,
    UserCircle,
    Inbox,
    Settings,
    Clapperboard,
    Star,
    Bell,
} from 'lucide-react';

const PAGE_MAP: Record<string, { title: string; subtitle: string; Icon: React.ElementType }> = {
    '/admin': { title: 'Dashboard', subtitle: 'Welcome back — here\'s what\'s happening.', Icon: LayoutDashboard },
    '/admin/hero': { title: 'Hero Section', subtitle: 'Edit the homepage hero content and media.', Icon: Clapperboard },
    '/admin/projects': { title: 'Projects', subtitle: 'Manage your portfolio projects.', Icon: Video },
    '/admin/services': { title: 'Services', subtitle: 'Add, edit and reorder your services.', Icon: Briefcase },
    '/admin/blog': { title: 'Blog', subtitle: 'Write and manage blog posts.', Icon: FileText },
    '/admin/testimonials': { title: 'Testimonials', subtitle: 'Review and approve client testimonials.', Icon: Star },
    '/admin/about': { title: 'About Page', subtitle: 'Update your bio and personal details.', Icon: UserCircle },
    '/admin/inbox': { title: 'Inbox', subtitle: 'View contact form submissions.', Icon: Inbox },
    '/admin/users': { title: 'Users', subtitle: 'Manage admin accounts.', Icon: UserCircle },
    '/admin/settings': { title: 'Settings', subtitle: 'Configure global site options.', Icon: Settings },
};

export function AdminHeader() {
    const pathname = usePathname() ?? '/admin';
    const { user } = useUser();

    const page = PAGE_MAP[pathname] ?? { title: 'Admin Panel', subtitle: '', Icon: LayoutDashboard };
    const { title, subtitle, Icon } = page;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <header className="flex items-center justify-between px-10 py-4 border-b border-white/5 bg-background/80 backdrop-blur-xl shrink-0">
            {/* Left — page identity */}
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl lavender-gradient flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="font-headline font-bold text-lg uppercase tracking-tighter leading-none">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground mt-0.5 leading-none">{subtitle}</p>
                    )}
                </div>
            </div>

            {/* Right — date / user */}
            <div className="hidden md:flex items-center gap-6">
                <div className="text-right">
                    <p className="text-xs font-bold text-foreground">{timeStr}</p>
                    <p className="text-[11px] text-muted-foreground">{dateStr}</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full lavender-gradient flex items-center justify-center text-white font-black text-xs shadow-lg">
                        {user?.email?.slice(0, 2).toUpperCase() ?? 'AD'}
                    </div>
                    <div className="hidden lg:block">
                        <p className="text-xs font-bold truncate max-w-[140px]">{user?.email ?? 'Admin'}</p>
                        <p className="text-[11px] text-primary font-semibold">Administrator</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
