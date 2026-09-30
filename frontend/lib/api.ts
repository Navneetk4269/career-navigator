export const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    '/api';

export function getAccessToken() {
    if (typeof window === 'undefined') {
        return null;
    }

    return localStorage.getItem('accessToken');
}

export function clearAuthSession() {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('career-navigator-auth-change'));
}

type ApiFetchOptions = RequestInit & {
    auth?: boolean;
};

export async function apiFetch(
    path: string,
    { auth = true, ...options }: ApiFetchOptions = {},
) {
    const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
    const normalizedPath = withLeadingSlash.startsWith('/api/')
        ? withLeadingSlash.slice(4)
        : withLeadingSlash;
    const baseUrl = API_URL.replace(/\/+$/, '');
    const url = /^https?:\/\//i.test(normalizedPath)
        ? normalizedPath
        : `${baseUrl}${normalizedPath}`;
    const headers = new Headers(options.headers);
    const token = auth ? getAccessToken() : null;

    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401 && typeof window !== 'undefined') {
        clearAuthSession();
        if (!['/login', '/signup', '/auth/callback'].includes(window.location.pathname)) {
            window.location.replace('/login');
        }
    }

    return response;
}