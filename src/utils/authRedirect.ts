/**
 * Utility functions for managing cross-domain and cross-subdomain authentication URLs and redirects.
 * Centralized on https://tolzy.me/auth
 */

export function isSubdomain(hostname?: string): boolean {
    if (typeof window === 'undefined' && !hostname) return false;
    const host = (hostname || (typeof window !== 'undefined' ? window.location.hostname : '')).toLowerCase();
    
    return (
        host.includes('.') &&
        !host.startsWith('www.') &&
        host !== 'tolzy.me' &&
        host !== 'localhost'
    );
}

export function getCentralAuthUrl(returnPathOrUrl?: string): string {
    if (typeof window === 'undefined') {
        return returnPathOrUrl ? `/auth?redirect=${encodeURIComponent(returnPathOrUrl)}` : '/auth';
    }

    const hostname = window.location.hostname.toLowerCase();
    const isSub = isSubdomain(hostname);
    
    // Determine the return URL
    let targetReturn = returnPathOrUrl;
    if (!targetReturn) {
        targetReturn = window.location.href;
    } else if (targetReturn.startsWith('/')) {
        targetReturn = `${window.location.protocol}//${window.location.host}${targetReturn}`;
    }

    const encodedReturn = encodeURIComponent(targetReturn);

    if (isSub) {
        if (hostname.includes('tolzy.me')) {
            return `https://tolzy.me/auth?redirect=${encodedReturn}`;
        }
        // Localhost subdomains (e.g. tools.localhost:3000)
        return `http://localhost:3000/auth?redirect=${encodedReturn}`;
    }

    return returnPathOrUrl ? `/auth?redirect=${encodedReturn}` : '/auth';
}

export function redirectToAuth(returnPathOrUrl?: string): void {
    if (typeof window === 'undefined') return;
    const url = getCentralAuthUrl(returnPathOrUrl);
    window.location.href = url;
}
