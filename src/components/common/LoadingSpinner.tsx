'use client';


/**
 * Modern loading spinner component with Tolzy branding
 * Matches the official Tolzy loading design with circular arrow
 */
export default function LoadingSpinner() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
            {/* Background gradient decoration */}
            <div className="absolute inset-0 overflow-hidden opacity-20">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative flex flex-col items-center gap-8">
                {/* Main Spinner - Circular Arrow Design */}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                    {/* Rotating circular arrow */}
                    <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
                        <svg
                            viewBox="0 0 200 200"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-full h-full"
                        >
                            {/* Circular arc with arrow */}
                            <path
                                d="M 100 20 A 80 80 0 1 1 20 100"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                className="text-gray-800 dark:text-gray-200"
                            />
                            {/* Arrow head */}
                            <path
                                d="M 15 95 L 20 100 L 25 95"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                                className="text-gray-800 dark:text-gray-200"
                            />
                        </svg>
                    </div>

                    {/* Center - TOLZY Logo */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-xl opacity-30 animate-pulse" />
                            {/* Logo image */}
                            <span className="text-xl font-black tracking-[0.25em] text-slate-900 dark:text-white relative z-10">
                                TOLZY
                            </span>
                        </div>
                    </div>
                </div>

                {/* Loading text */}
                <div className="flex flex-col items-center gap-3">
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 text-center animate-pulse">
                        جاري التحميل...
                    </p>

                    {/* Animated dots */}
                    <div className="flex gap-2">
                        <div className="w-2 h-2 bg-gray-800 dark:bg-gray-200 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-gray-800 dark:bg-gray-200 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-800 dark:bg-gray-200 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Compact loading spinner for inline use
 */
export function LoadingSpinnerSmall({ className = '' }: { className?: string }) {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className="relative w-10 h-10">
                {/* Rotating circular arrow - small version */}
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '1.5s' }}>
                    <svg
                        viewBox="0 0 200 200"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-full"
                    >
                        <path
                            d="M 100 20 A 80 80 0 1 1 20 100"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeLinecap="round"
                            className="text-blue-600 dark:text-blue-400"
                        />
                        <path
                            d="M 15 95 L 20 100 L 25 95"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            className="text-blue-600 dark:text-blue-400"
                        />
                    </svg>
                </div>
            </div>
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
