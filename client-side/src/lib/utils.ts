import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatToken(token: string): string {
  // Add your token formatting logic here
  // Example: truncate long tokens or format them for display
  if (!token) return '';
  
  // If token is longer than 20 characters, show first 10 + "..." + last 6
  if (token.length > 20) {
    return `${token.slice(0, 10)}...${token.slice(-6)}`;
  }
  
  return token;
}
