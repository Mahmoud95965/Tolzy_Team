"use client";

import { useEffect } from 'react';

export default function AuthInitializer() {
    useEffect(() => {
        // Background initialization after 3 seconds
        // This warms up the Firebase chunk so usage is instant when needed
        const timer = setTimeout(() => {
            import('@/src/config/firebase').catch(console.error);
        }, 7000);

        return () => clearTimeout(timer);
    }, []);

    return null; // Renders nothing
}
