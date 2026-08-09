/**
 * Domain & Subdomain utilities for Tolzy Platform
 * Manages dynamic URL generation between production subdomains (tools.tolzy.me, learn.tolzy.me)
 * and local/fallback routing (/tools, /learn).
 */

export const MAIN_DOMAIN = 'tolzy.me';
export const TOOLS_SUBDOMAIN = 'tools.tolzy.me';
export const LEARN_SUBDOMAIN = 'learn.tolzy.me';

export type SubdomainType = 'tools' | 'learn' | 'main';

/**
 * Returns the appropriate base URL or path for a given service.
 * In production (on tolzy.me), returns absolute subdomain URLs (e.g., https://tools.tolzy.me).
 * In development / preview, returns local relative paths (e.g., /tools).
 */
export function getSubdomainUrl(type: SubdomainType, path: string = ''): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    // Server-side environment check or browser hostname check
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const isProduction = hostname.endsWith('tolzy.me');

        if (isProduction) {
            switch (type) {
                case 'tools':
                    return `https://${TOOLS_SUBDOMAIN}${cleanPath === '/tools' ? '' : cleanPath}`;
                case 'learn':
                    return `https://${LEARN_SUBDOMAIN}${cleanPath === '/learn' ? '' : cleanPath}`;
                case 'main':
                default:
                    return `https://${MAIN_DOMAIN}${cleanPath}`;
            }
        }
    }

    // Default / Localhost fallback
    switch (type) {
        case 'tools':
            return cleanPath === '' || cleanPath === '/' ? '/tools' : (cleanPath.startsWith('/tools') ? cleanPath : `/tools${cleanPath}`);
        case 'learn':
            return cleanPath === '' || cleanPath === '/' ? '/learn' : (cleanPath.startsWith('/learn') ? cleanPath : `/learn${cleanPath}`);
        case 'main':
        default:
            return cleanPath || '/';
    }
}

/**
 * Identifies the subdomain from a Host header string.
 */
export function parseSubdomain(host: string | null): SubdomainType {
    if (!host) return 'main';

    const normalizedHost = host.split(':')[0].toLowerCase();

    if (normalizedHost.startsWith('tools.') || normalizedHost === 'tools.tolzy.me' || normalizedHost === 'tools.localhost') {
        return 'tools';
    }
    if (normalizedHost.startsWith('learn.') || normalizedHost.startsWith('courses.') || normalizedHost === 'learn.tolzy.me' || normalizedHost === 'learn.localhost') {
        return 'learn';
    }

    return 'main';
}
