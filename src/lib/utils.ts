import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Supabase storage URLs sometimes have a trailing "?" which breaks
 * Next.js Image optimisation. This strips it off.
 */
export function cleanImageUrl(url: string): string {
  return url.replace(/\?+$/, "");
}
