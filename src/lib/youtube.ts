/**
 * YouTube URL utilities - extract video IDs, generate embed URLs and thumbnails.
 * Works with: watch URLs, short URLs (youtu.be), embed URLs, Shorts.
 */

const YT_PATTERNS = [
  /youtu\.be\/([A-Za-z0-9_\-]{11})/,
  /youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_\-]{11})/,
  /youtube\.com\/embed\/([A-Za-z0-9_\-]{11})/,
  /youtube\.com\/shorts\/([A-Za-z0-9_\-]{11})/,
  /youtube\.com\/v\/([A-Za-z0-9_\-]{11})/,
];

/** Extract the 11-char video ID from any YouTube URL. Returns null if not a YouTube URL. */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  for (const pattern of YT_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  if (/^[A-Za-z0-9_\-]{11}$/.test(url.trim())) return url.trim();
  return null;
}

/** Generate a privacy-enhanced embed URL for iframe use. */
export function getYouTubeEmbedUrl(url: string, options?: { autoplay?: boolean }): string {
  const id = extractYouTubeId(url);
  if (!id) return url;
  const autoplayParam = options?.autoplay ? "&autoplay=1" : "";
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1${autoplayParam}`;
}

/** Get the auto-generated thumbnail from YouTube CDN. */
export function getYouTubeThumbnail(
  url: string,
  quality: 'default' | 'hqdefault' | 'mqdefault' | 'sddefault' | 'maxresdefault' = 'hqdefault'
): string {
  const id = extractYouTubeId(url);
  if (!id) return '';
  return `https://img.youtube.com/vi/${id}/${quality}.jpg`;
}

/** Check if a URL looks like a valid YouTube link. */
export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null;
}
