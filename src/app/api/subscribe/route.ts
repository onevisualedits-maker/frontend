/// <reference types="node" />
import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ── Init Firebase Admin (singleton) ──────────────────────────────────────────
function getAdminDb() {
    if (!getApps().length) {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    }
    return getFirestore();
}

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
        }

        const db = getAdminDb();
        const col = db.collection('subscribers');

        // Idempotent — don't add duplicates
        const existing = await col.where('email', '==', email.toLowerCase()).limit(1).get();
        if (!existing.empty) {
            return NextResponse.json({ success: true, alreadySubscribed: true });
        }

        await col.add({
            email: email.toLowerCase(),
            subscribedAt: new Date().toISOString(),
            active: true,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Subscribe error:', error);
        return NextResponse.json({ success: false, error: 'Failed to subscribe.' }, { status: 500 });
    }
}
