import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRankDisplay(rankInt: number) {
  const label = rankInt >= 0 ? "d" : "k";
  const num = rankInt >= 0 ? rankInt + 1 : -rankInt;
  return `${num}${label}`;
}

export function getRankInt(rankDisplay: string) {
  // Matches digits followed by an optional space and a 'k' or 'd' (case-insensitive)
  const match = rankDisplay.trim().match(/^(\d+)\s*([kd])$/i);

  if (!match) {
    return null; // Return null for invalid formats
  }

  const num = parseInt(match[1], 10);
  const label = match[2].toLowerCase();

  // Reverse the logic:
  // If "d" (dan): num = rankInt + 1  =>  rankInt = num - 1
  // If "k" (kyu): num = -rankInt     =>  rankInt = -num
  return label === "d" ? num - 1 : -num;
}

export function getFetchUrl(endpoint: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_APP_URL is not defined");
  return new URL("/api/" + endpoint, baseUrl);
}
