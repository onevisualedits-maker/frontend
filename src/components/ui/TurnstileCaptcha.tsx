'use client';

import { Turnstile } from '@marsidev/react-turnstile';
import { useRef } from 'react';

interface TurnstileCaptchaProps {
    onVerify: (token: string) => void;
    onExpire?: () => void;
    onError?: () => void;
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

export function TurnstileCaptcha({ onVerify, onExpire, onError }: TurnstileCaptchaProps) {
    return (
        <div className="flex justify-center mt-2">
            <Turnstile
                siteKey={SITE_KEY}
                onSuccess={onVerify}
                onExpire={onExpire}
                onError={onError}
                options={{
                    theme: 'dark',
                    size: 'normal',
                }}
            />
        </div>
    );
}
