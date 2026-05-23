'use client';

/**
 * Modern minimalist loading spinner component
 * Simply a beautiful, clean blue spinning circle centered in the viewport.
 */
export default function LoadingSpinner() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );
}

/**
 * Compact loading spinner for inline use
 */
export function LoadingSpinnerSmall({ className = '' }: { className?: string }) {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );
}

/**
 * Loading skeleton for content
 */
export function LoadingSkeleton({ className = '' }: { className?: string }) {
    return (
        <div className={`animate-pulse ${className}`}>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
    );
}
