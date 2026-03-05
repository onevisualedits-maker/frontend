'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export interface SiteSettings {
    siteName: string;
    contactEmail: string;
    phone: string;
    whatsapp: string;
    address: string;
    city: string;
    country: string;
    youtubeUrl: string;
    instagramUrl: string;
    twitterUrl: string;
    maintenanceMode: boolean;
}

const DEFAULTS: SiteSettings = {
    siteName: 'JeevanEditz',
    contactEmail: 'contact@jeevaneditz.com',
    phone: '',
    whatsapp: '',
    address: '',
    city: '',
    country: '',
    youtubeUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    maintenanceMode: false,
};

export function useSiteSettings() {
    const firestore = useFirestore();
    const settingsRef = useMemoFirebase(
        () => (firestore ? doc(firestore, 'siteSettings', 'singleton') : null),
        [firestore]
    );
    const { data, isLoading } = useDoc(settingsRef);

    const settings: SiteSettings = {
        ...DEFAULTS,
        ...(data ?? {}),
    };

    return { settings, isLoading };
}
