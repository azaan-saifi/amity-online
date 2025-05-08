import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Re-export server-side utilities for API routes
export {
  uploadToCloudinary,
  generateTranscript,
  formatTranscript,
} from "./server-utils";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function getAuthStatus(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("adminAuth") === "authenticated";
}

export function setAuthStatus(value: boolean): void {
  if (typeof window === "undefined") return;
  if (value) {
    localStorage.setItem("adminAuth", "authenticated");
  } else {
    localStorage.removeItem("adminAuth");
  }
}

export function secondsToTimeFormat(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function timeFormatToSeconds(timeFormat: string): number {
  // Handle formats like "10:30" (mm:ss) or "01:05:20" (hh:mm:ss)
  const parts = timeFormat.split(":").map((part) => parseInt(part, 10));

  if (parts.length === 3) {
    // hh:mm:ss format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // mm:ss format
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1 && !isNaN(parts[0])) {
    // Just seconds
    return parts[0];
  }

  return 0; // Default if format is invalid
}
