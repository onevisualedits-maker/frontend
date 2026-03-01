/**
 * Direct client-side upload to Cloudinary.
 *
 * Sends the file straight from the browser to Cloudinary (no Next.js server
 * in the middle) which eliminates proxy timeouts for large video files.
 *
 * Requirements:
 *  - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME  (already in env)
 *  - NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET  (unsigned preset, see README below)
 *
 * How to create an unsigned preset (one-time setup):
 *  1. Go to Cloudinary Dashboard → Settings → Upload → Upload presets
 *  2. Click "Add upload preset"
 *  3. Set Signing Mode to "Unsigned"
 *  4. Set Folder to "jeevan_uploads"
 *  5. Save and copy the preset name → set as NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
 */

export interface UploadProgressEvent {
    loaded: number;
    total: number;
    percent: number;
}

export interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
    resource_type: string;
    format: string;
    duration?: number;
    width?: number;
    height?: number;
}

/**
 * Upload a file directly from the browser to Cloudinary.
 *
 * @param file       The File object to upload.
 * @param onProgress Optional progress callback with { loaded, total, percent }.
 * @param folder     Cloudinary folder (default: 'jeevan_uploads').
 * @returns          The Cloudinary upload result with `secure_url`.
 */
export async function uploadToCloudinary(
    file: File,
    onProgress?: (e: UploadProgressEvent) => void,
    folder = 'jeevan_uploads',
): Promise<CloudinaryUploadResult> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName) throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set.');
    if (!uploadPreset) throw new Error('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is not set. See src/lib/cloudinary-direct-upload.ts for setup instructions.');

    // Detect resource type from MIME so Cloudinary knows it's a video
    const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', uploadPreset);
    fd.append('folder', folder);

    return new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);

        // Track upload progress
        if (onProgress) {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    onProgress({
                        loaded: e.loaded,
                        total: e.total,
                        percent: Math.round((e.loaded / e.total) * 100),
                    });
                }
            });
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const result = JSON.parse(xhr.responseText) as CloudinaryUploadResult;
                    resolve(result);
                } catch {
                    reject(new Error('Invalid response from Cloudinary.'));
                }
            } else {
                try {
                    const err = JSON.parse(xhr.responseText);
                    reject(new Error(err?.error?.message || `Cloudinary error ${xhr.status}`));
                } catch {
                    reject(new Error(`Cloudinary upload failed with status ${xhr.status}`));
                }
            }
        };

        xhr.onerror = () => reject(new Error('Network error during upload. Check your internet connection.'));
        xhr.ontimeout = () => reject(new Error('Upload timed out. Try a smaller file or faster connection.'));

        // 10 minutes timeout for large video files
        xhr.timeout = 10 * 60 * 1000;

        xhr.send(fd);
    });
}
