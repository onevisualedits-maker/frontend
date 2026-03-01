/**
 * Verifies a Cloudflare Turnstile token on the server side.
 * Call this from API routes or Server Actions.
 *
 * @param token  The token received from the client-side widget.
 * @param ip     Optional: the user's IP address (enhances security).
 * @returns      `true` if the token is valid, `false` otherwise.
 */
export async function verifyTurnstileToken(
    token: string,
    ip?: string,
): Promise<boolean> {
    const secret =
        process.env.TURNSTILE_SECRET_KEY ||
        '1x0000000000000000000000000000000AA'; // fallback = always passes (dev)

    const formData = new URLSearchParams();
    formData.append('secret', secret);
    formData.append('response', token);
    if (ip) formData.append('remoteip', ip);

    try {
        const res = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            { method: 'POST', body: formData },
        );

        if (!res.ok) return false;

        const data = (await res.json()) as { success: boolean };
        return data.success === true;
    } catch {
        return false;
    }
}
