import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Enable React strict mode for better error catching
    reactStrictMode: true,

    // Image optimization
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'www.tolzy.me',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'tolzy.me',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'i.ibb.co',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'zdhjnbsjkglumsakpmoj.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
            {
                protocol: 'https',
                hostname: 'fpikysywaihykgdhoeim.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
            {
                protocol: 'https',
                hostname: 's3.amazonaws.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'd3njjcbhbojbot.cloudfront.net',
            },
            // Note: lh3.googleusercontent.com is already present, but ensuring it matches user request
        ],
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },

    // Optimize production builds
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },

    // Headers for SEO and security
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
            // Long-term cache for static assets
            {
                source: '/image/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/:path*.svg',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            // Service Worker headers
            {
                source: '/firebase-messaging-sw.js',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=0, must-revalidate',
                    },
                    {
                        key: 'Service-Worker-Allowed',
                        value: '/',
                    },
                ],
            },
        ];
    },

    // Redirects
    async redirects() {
        return [
            {
                source: '/home',
                destination: '/',
                permanent: true,
            },
        ];
    },

    async rewrites() {
        return {
            beforeFiles: [
                // These routes are handled by Next.js API routes, not the Express server
            ],
            afterFiles: [],
            fallback: [
                // Courses API still goes to Express server (if running)
                {
                    source: '/api/courses/:path*',
                    destination: 'http://127.0.0.1:5000/api/courses/:path*',
                },
            ],
        };
    },

    // Output configuration for Vercel
    output: 'standalone',

    // Server Components External Packages (Stable in Next.js 16)
    serverExternalPackages: ['sharp'],
};

export default nextConfig;
