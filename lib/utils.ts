import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRankDisplay(rankInt: number) {
  const label = rankInt >= 0 ? "d" : "k";
  const num = rankInt >= 0 ? rankInt + 1 : -rankInt;
  return `${num}${label}`;
}
