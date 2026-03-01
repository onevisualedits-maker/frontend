/**
 * Maps Firebase Auth error codes to user-friendly messages.
 * Avoids leaking internal error details in production.
 */

const FIREBASE_AUTH_ERRORS: Record<string, string> = {
    // Sign-in
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials.',
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment before trying again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    // Sign-up
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters long.',
    'auth/operation-not-allowed': 'This operation is not permitted. Please contact support.',
    // Password reset
    'auth/missing-email': 'Please enter your email address.',
    // Generic / network
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    'auth/internal-error': 'An internal error occurred. Please try again later.',
    'auth/requires-recent-login': 'Please log out and log back in to complete this action.',
};

/**
 * Returns a safe, user-friendly error message for Firebase Auth errors.
 * In development it also includes the raw code; in production only the
 * friendly message is shown.
 */
export function getAuthErrorMessage(error: unknown): string {
    if (!error || typeof error !== 'object') {
        return 'An unexpected error occurred. Please try again.';
    }

    const code = (error as { code?: string }).code ?? '';
    const friendly = FIREBASE_AUTH_ERRORS[code];

    if (friendly) return friendly;

    // In development still show the raw message for debugging
    if (process.env.NODE_ENV !== 'production') {
        const msg = (error as { message?: string }).message ?? '';
        return msg || 'An unexpected error occurred.';
    }

    // Production fallback – never expose raw Firebase internals
    return 'An unexpected error occurred. Please try again.';
}

/**
 * Returns a safe message for generic (non-auth) API / server errors.
 */
export function getGenericErrorMessage(error: unknown): string {
    if (process.env.NODE_ENV !== 'production') {
        if (error instanceof Error) return error.message;
        if (typeof error === 'string') return error;
    }
    return 'Something went wrong. Please try again later.';
}
