/**
 * Single source of truth for Terasdracin API base URL.
 * Playbook rule: keep one public base URL and derive all paths from it.
 */

const DEFAULT_PUBLIC_API_BASE_URL = 'https://api.terasdracin.my.id';

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

// Public API base (DIRECT / HYBRID)
export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL || DEFAULT_PUBLIC_API_BASE_URL,
);

// Internal backend API base (BACKEND)
export const BACKEND_API_BASE_URL = `${API_BASE_URL}/api`;

// Derived category bases (no separate fallback URL)
export const ANIME_API_URL = `${API_BASE_URL}/anime/samehadaku`;
export const COMIC_API_URL = `${API_BASE_URL}/comic`;

// API Keys (jika diperlukan)
export const API_KEY = import.meta.env.VITE_API_KEY || '';
export const API_SECRET = import.meta.env.VITE_API_SECRET || '';

// Helper function untuk log environment (debug purposes)
export function logEnvironment() {
  if (import.meta.env.DEV) {
    console.log('🔧 Environment Configuration:');
    console.log('PUBLIC_API_BASE_URL:', API_BASE_URL);
    console.log('BACKEND_API_BASE_URL:', BACKEND_API_BASE_URL);
    console.log('ANIME_API_URL:', ANIME_API_URL);
    console.log('COMIC_API_URL:', COMIC_API_URL);
  }
}
