const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

/**
 * Resolves a product/upload image URL to an absolute URL.
 * URLs from the DB are stored as relative paths like `/uploads/products/filename.jpg`.
 * These must be prefixed with the API base URL so the browser fetches from the backend.
 * External URLs (http/https) and undefined are returned as-is.
 */
export function resolveImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) return `${API_URL}${url}`;
  return url;
}
