/// <reference types="node" />
import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import nodemailer from 'nodemailer';

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

// ── Email transporter ─────────────────────────────────────────────────────────
function createTransporter() {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
}

// ── Beautiful HTML email template ─────────────────────────────────────────────
function buildEmailHtml(post: {
    title: string;
    content: string;
    featuredImageUrl?: string;
    slug?: string;
    author?: string;
    categoryId?: string;
    readTime?: string;
}) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002';
    const postUrl = `${siteUrl}/blog/${post.slug || ''}`;
    const excerpt = post.content?.substring(0, 200).trim() + '…';
    const category = post.categoryId || 'Blog';
    const author = post.author || 'Jeevan';
    const imgHtml = post.featuredImageUrl
        ? `<img src="${post.featuredImageUrl}" alt="${post.title}" style="width:100%;max-height:320px;object-fit:cover;border-radius:12px;margin-bottom:24px;" />`
        : '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${post.title}</title>
</head>
<body style="margin:0;padding:0;background:#0F0C29;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0C29;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0F0C29,#302B63,#7C3AED);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.5);">JeevanEditz Newsletter</p>
            <h1 style="margin:0;font-size:28px;font-weight:900;color:#fff;letter-spacing:-1px;text-transform:uppercase;">New Article Live</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#1a1730;padding:40px;border-radius:0 0 16px 16px;">

            <!-- Category pill -->
            <p style="margin:0 0 20px;">
              <span style="display:inline-block;background:rgba(127,45,255,0.2);border:1px solid rgba(127,45,255,0.4);color:#a78bfa;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding:4px 14px;border-radius:999px;">
                ${category}${post.readTime ? ` &nbsp;·&nbsp; ${post.readTime} min read` : ''}
              </span>
            </p>

            ${imgHtml}

            <!-- Title -->
            <h2 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#fff;line-height:1.25;letter-spacing:-0.5px;">
              ${post.title}
            </h2>

            <!-- By-line -->
            <p style="margin:0 0 20px;font-size:12px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:2px;">By ${author}</p>

            <!-- Excerpt -->
            <p style="margin:0 0 32px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.8;">
              ${excerpt}
            </p>

            <!-- CTA button -->
            <div style="text-align:center;margin-bottom:40px;">
              <a href="${postUrl}"
                style="display:inline-block;background:linear-gradient(135deg,#7C3AED,#302B63);color:#fff;font-weight:700;font-size:14px;letter-spacing:2px;text-transform:uppercase;padding:14px 36px;border-radius:999px;text-decoration:none;">
                Read Full Article →
              </a>
            </div>

            <!-- Divider -->
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:0 0 24px;" />

            <!-- Footer -->
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);text-align:center;line-height:1.8;">
              You're receiving this because you subscribed to <strong style="color:rgba(255,255,255,0.5);">JeevanEditz</strong> newsletter.<br/>
              <a href="${siteUrl}/unsubscribe" style="color:#7C3AED;text-decoration:none;">Unsubscribe</a>
              &nbsp;·&nbsp;
              <a href="${siteUrl}/blog" style="color:#7C3AED;text-decoration:none;">View all posts</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
    try {
        // Validate internal secret to prevent unauthorized calls
        const authHeader = req.headers.get('x-internal-secret');
        if (authHeader !== process.env.INTERNAL_API_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const post = await req.json();

        if (!post?.title || !post?.content) {
            return NextResponse.json({ error: 'Post title and content are required.' }, { status: 400 });
        }

        // ── 1. Fetch all active subscribers ──────────────────────────────────────
        const db = getAdminDb();
        const snapshot = await db.collection('subscribers').where('active', '==', true).get();

        if (snapshot.empty) {
            return NextResponse.json({ success: true, sent: 0, message: 'No active subscribers.' });
        }

        const subscribers = snapshot.docs.map(d => d.data().email as string).filter(Boolean);

        // ── 2. Send emails in batches of 50 (avoid SMTP rate limits) ─────────────
        const BATCH = 50;
        const transporter = createTransporter();
        const html = buildEmailHtml(post);
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002';

        let sent = 0;
        let failed = 0;

        for (let i = 0; i < subscribers.length; i += BATCH) {
            const batch = subscribers.slice(i, i + BATCH);
            const results = await Promise.allSettled(
                batch.map(email =>
                    transporter.sendMail({
                        from: `"JeevanEditz Newsletter" <${process.env.EMAIL_USER}>`,
                        to: email,
                        subject: `📽️ New Post: ${post.title}`,
                        html,
                        text: `New article from JeevanEditz: "${post.title}"\n\n${post.content?.substring(0, 300)}...\n\nRead it at: ${siteUrl}/blog/${post.slug || ''}`,
                    })
                )
            );

            results.forEach(r => r.status === 'fulfilled' ? sent++ : failed++);
        }

        // ── 3. Log the dispatch in Firestore ──────────────────────────────────────
        await db.collection('newsletterDispatches').add({
            postTitle: post.title,
            postSlug: post.slug || '',
            sentAt: new Date().toISOString(),
            totalSubscribers: subscribers.length,
            sent,
            failed,
        });

        return NextResponse.json({ success: true, sent, failed, total: subscribers.length });
    } catch (error) {
        console.error('Newsletter dispatch error:', error);
        return NextResponse.json({ success: false, error: 'Failed to send newsletter.' }, { status: 500 });
    }
}
