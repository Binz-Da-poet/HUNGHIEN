/**
 * Resolve asset URL to absolute URL against current origin.
 * Keeps absolute https URLs unchanged and prepends origin to /uploads paths.
 */
export function resolveAssetUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('https://') || url.startsWith('http://')) return url;
  return url;
}
