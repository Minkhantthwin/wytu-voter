import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Builds the full URL for an uploaded image
 * @param {string} path - The relative path stored in the database (e.g., '/uploads/candidates/photo.png')
 * @returns {string} The full URL to access the image
 */
export function getImageUrl(path) {
  if (!path) return '';
  
  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // In production, use relative paths (same origin)
  // In development, we also use relative paths since Vite proxies /uploads
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return normalizedPath;
}
