/**
 * Domain & Subdomain utilities for Tolzy Platform
 * Manages dynamic URL generation between production subdomains:
 * - tools.tolzy.me (/tools)
 * - learn.tolzy.me (/learn)
 * - omnilearn.tolzy.me (/learn/omnilearn)
 * - build.tolzy.me (/build)
 * - flow.tolzy.me (/axiom)
 * - community.tolzy.me (/community)
 * and local/fallback routing.
 */

export const MAIN_DOMAIN = 'tolzy.me';
export const TOOLS_SUBDOMAIN = 'tools.tolzy.me';
export const LEARN_SUBDOMAIN = 'learn.tolzy.me';
export const OMNILEARN_SUBDOMAIN = 'omnilearn.tolzy.me';
export const BUILD_SUBDOMAIN = 'build.tolzy.me';
export const FLOW_SUBDOMAIN = 'flow.tolzy.me';
export const COMMUNITY_SUBDOMAIN = 'community.tolzy.me';

export type SubdomainType = 'tools' | 'learn' | 'omnilearn' | 'build' | 'flow' | 'community' | 'main';

/**
 * Returns the appropriate base URL or path for a given service.
 * In production (on tolzy.me), returns absolute subdomain URLs (e.g., https://tools.tolzy.me).
 * In development / preview, returns local relative paths (e.g., /tools, /learn, /build, /axiom).
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
                case 'omnilearn':
                    return `https://${OMNILEARN_SUBDOMAIN}${cleanPath === '/learn/omnilearn' ? '' : cleanPath}`;
                case 'build':
                    return `https://${BUILD_SUBDOMAIN}${cleanPath === '/build' ? '' : cleanPath}`;
                case 'flow':
                    return `https://${FLOW_SUBDOMAIN}${cleanPath === '/axiom' ? '' : cleanPath}`;
                case 'community':
                    return `https://${COMMUNITY_SUBDOMAIN}${cleanPath === '/community' ? '' : cleanPath}`;
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
        case 'omnilearn':
            return cleanPath === '' || cleanPath === '/' ? '/learn/omnilearn' : (cleanPath.startsWith('/learn/omnilearn') ? cleanPath : `/learn/omnilearn${cleanPath}`);
        case 'build':
            return cleanPath === '' || cleanPath === '/' ? '/build' : (cleanPath.startsWith('/build') ? cleanPath : `/build${cleanPath}`);
        case 'flow':
            return cleanPath === '' || cleanPath === '/' ? '/axiom' : (cleanPath.startsWith('/axiom') ? cleanPath : `/axiom${cleanPath}`);
        case 'community':
            return cleanPath === '' || cleanPath === '/' ? '/community' : (cleanPath.startsWith('/community') ? cleanPath : `/community${cleanPath}`);
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
    if (normalizedHost.startsWith('omnilearn.') || normalizedHost === 'omnilearn.tolzy.me' || normalizedHost === 'omnilearn.localhost') {
        return 'omnilearn';
    }
    if (normalizedHost.startsWith('learn.') || normalizedHost.startsWith('courses.') || normalizedHost === 'learn.tolzy.me' || normalizedHost === 'learn.localhost') {
        return 'learn';
    }
    if (normalizedHost.startsWith('build.') || normalizedHost === 'build.tolzy.me' || normalizedHost === 'build.localhost') {
        return 'build';
    }
    if (normalizedHost.startsWith('flow.') || normalizedHost.startsWith('axiom.') || normalizedHost === 'flow.tolzy.me' || normalizedHost === 'flow.localhost') {
        return 'flow';
    }
    if (normalizedHost.startsWith('community.') || normalizedHost === 'community.tolzy.me' || normalizedHost === 'community.localhost') {
        return 'community';
    }

    return 'main';
}
