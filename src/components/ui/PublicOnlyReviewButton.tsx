'use client';

import { usePathname } from 'next/navigation';
import { GiveReviewButton } from '@/components/ui/GiveReviewButton';

export function PublicOnlyReviewButton() {
    const pathname = usePathname();
    if (pathname?.startsWith('/admin')) return null;
    return <GiveReviewButton />;
}
