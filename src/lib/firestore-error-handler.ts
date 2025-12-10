/**
 * Firestore Error Handler
 * Provides better error handling for common Firestore connection issues
 */

export interface FirestoreError {
    code: string;
    message: string;
    userFriendlyMessage: string;
}

export function handleFirestoreError(error: any): FirestoreError {
    const errorCode = error?.code || 'unknown';

    const errorMap: Record<string, FirestoreError> = {
        'permission-denied': {
            code: 'permission-denied',
            message: 'Permission denied',
            userFriendlyMessage: 'You don\'t have permission to perform this action.'
        },
        'unavailable': {
            code: 'unavailable',
            message: 'Service unavailable',
            userFriendlyMessage: 'Service is temporarily unavailable. Please check your internet connection or try again later.'
        },
        'unauthenticated': {
            code: 'unauthenticated',
            message: 'Not authenticated',
            userFriendlyMessage: 'Please log in to continue.'
        },
        'not-found': {
            code: 'not-found',
            message: 'Document not found',
            userFriendlyMessage: 'The requested item was not found.'
        },
        'already-exists': {
            code: 'already-exists',
            message: 'Document already exists',
            userFriendlyMessage: 'This item already exists.'
        },
        'failed-precondition': {
            code: 'failed-precondition',
            message: 'Operation failed precondition',
            userFriendlyMessage: 'Unable to complete this operation. Please try again.'
        }
    };

    // Check if error is caused by ad blocker
    if (error?.message?.includes('ERR_BLOCKED_BY_CLIENT') ||
        error?.message?.includes('net::ERR_BLOCKED_BY_CLIENT')) {
        return {
            code: 'blocked-by-client',
            message: 'Request blocked by browser extension',
            userFriendlyMessage: 'A browser extension (likely an ad blocker) is blocking the connection. Please disable it for this site or try a different browser.'
        };
    }

    // Check for network errors
    if (error?.message?.includes('network') || error?.code === 'unavailable') {
        return {
            code: 'network-error',
            message: 'Network error',
            userFriendlyMessage: 'Unable to connect. Please check your internet connection.'
        };
    }

    return errorMap[errorCode] || {
        code: 'unknown',
        message: error?.message || 'An unknown error occurred',
        userFriendlyMessage: 'Something went wrong. Please try again.'
    };
}

/**
 * Retry a Firestore operation with exponential backoff
 */
export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
): Promise<T> {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;

            // Don't retry on certain errors
            if (error?.code === 'permission-denied' ||
                error?.code === 'unauthenticated' ||
                error?.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
                throw error;
            }

            // Wait before retrying (exponential backoff)
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)));
            }
        }
    }

    throw lastError;
}
