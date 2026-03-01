/// <reference types="node" />
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// ── Route segment config: allow up to 100 MB request bodies ──────────────────
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '100mb',
        },
    },
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB in bytes

// Ensure cloudinary is configured
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // ── Enforce 100 MB limit ─────────────────────────────────────────────
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `File too large. Maximum allowed size is 100 MB (received ${(file.size / 1024 / 1024).toFixed(1)} MB).` },
                { status: 413 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult: any = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'jeevan_uploads',
                    resource_type: 'auto',   // supports images AND videos
                    chunk_size: 6_000_000,   // 6 MB chunks for reliable large uploads
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary Upload Error:", error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            (uploadStream as any).end(buffer);
        });

        return NextResponse.json({ success: true, url: uploadResult.secure_url });
    } catch (error) {
        console.error("Failed to upload image:", error);
        return NextResponse.json({ success: false, error: "Failed to upload image" }, { status: 500 });
    }
}
