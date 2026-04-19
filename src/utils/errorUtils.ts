/**
 * Safely extracts the error message from an unknown error object.
 * Useful for try/catch blocks where the error is of type 'unknown'.
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error) {
        return String((error as any).message);
    }
    return String(error);
}

/**
 * Standardized error logger that handles unknown error types safely.
 * Logs the message and, if the error isn't an Error instance, the full object.
 */
export function logError(error: unknown, context: string) {
    const message = getErrorMessage(error);
    console.error(`[${context}] Error:`, message);

    // If it's not a standard Error object, log the full details for debugging
    if (!(error instanceof Error)) {
        console.error(`[${context}] Full error details:`, error);
    }
}
