import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Detects if a URL points to a Google Drive Folder or Google Photos shared album (multi-photo collection).
 */
export function isGoogleAlbumOrFolder(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return (
    trimmed.includes("drive.google.com/drive/folders/") ||
    trimmed.includes("drive.google.com/drive/u/") ||
    trimmed.includes("photos.app.goo.gl/") ||
    trimmed.includes("photos.google.com/share/") ||
    trimmed.includes("photos.google.com/album/")
  );
}

/**
 * Returns a human-friendly album label based on the URL type.
 */
export function getAlbumTypeLabel(url?: string | null): string {
  if (!url) return "Album";
  if (url.includes("photos.app.goo.gl") || url.includes("photos.google.com")) {
    return "Google Photos Album";
  }
  if (url.includes("drive.google.com")) {
    return "Google Drive Folder";
  }
  return "Photo Collection";
}

/**
 * Normalizes Google Drive, Google Photos, or web image URLs into direct embeddable image sources.
 * Supports:
 * - https://drive.google.com/file/d/{FILE_ID}/view?usp=sharing -> https://lh3.googleusercontent.com/d/{FILE_ID}
 * - https://drive.google.com/open?id={FILE_ID} -> https://lh3.googleusercontent.com/d/{FILE_ID}
 * - https://drive.google.com/uc?id={FILE_ID} -> https://lh3.googleusercontent.com/d/{FILE_ID}
 * - https://docs.google.com/file/d/{FILE_ID} -> https://lh3.googleusercontent.com/d/{FILE_ID}
 * - Standard web URLs and Base64 Data URLs
 */
export function normalizeGoogleImageUrl(inputUrl?: string | null): string {
  if (!inputUrl) return "/placeholder-gallery.jpg";
  const trimmed = inputUrl.trim();

  // If already data URL
  if (trimmed.startsWith("data:image")) return trimmed;

  // If it's a folder or album link, don't use it directly as an image src
  if (isGoogleAlbumOrFolder(trimmed)) {
    return "/placeholder-gallery.jpg";
  }

  // Google Drive file/d/ ID pattern
  const driveFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}`;
  }

  // Google Drive open?id= or uc?id= pattern
  const driveIdMatch = trimmed.match(/drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}`;
  }

  // Google Docs file/d/ pattern
  const docsFileMatch = trimmed.match(/docs\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (docsFileMatch && docsFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${docsFileMatch[1]}`;
  }

  return trimmed;
}
