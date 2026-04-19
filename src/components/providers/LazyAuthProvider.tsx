"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the REAL AuthProvider
// We use the alias '@' which points to the root of the project (usually ./ or ./src)
// Based on typical Next.js setup, let's use the explicit path relative to src or the alias.
// User context shows 'src/context/AuthContext.tsx' exists.
const RealAuthProvider = dynamic(
    () => import('@/src/context/AuthContext').then((mod) => mod.AuthProvider),
    { ssr: false }
);

export default function LazyAuthProvider({ children }: { children: React.ReactNode }) {
    const [shouldLoadAuth, setShouldLoadAuth] = useState(false);

    useEffect(() => {
        // 1. Defer Firebase loading by 3 seconds to let LCP finish first
        const timer = setTimeout(() => {
            setShouldLoadAuth(true);
        }, 3000);

        // 2. Load immediately on any user interaction
        const handleInteraction = () => {
            setShouldLoadAuth(true);
        };

        window.addEventListener('scroll', handleInteraction, { once: true });
        window.addEventListener('click', handleInteraction, { once: true });
        window.addEventListener('mousemove', handleInteraction, { once: true });
        window.addEventListener('touchstart', handleInteraction, { once: true });
        window.addEventListener('keydown', handleInteraction, { once: true });

        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', handleInteraction);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('mousemove', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, []);

    if (!shouldLoadAuth) {
        // Render children immediately (Unauthenticated state by default)
        // This allows the Landing Page to paint quickly.
        return <>{children}</>;
    }

    return (
        <RealAuthProvider>
            {children}
        </RealAuthProvider>
    );
}
