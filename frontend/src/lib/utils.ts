import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AVATAR_GRADIENTS = [
  "from-violet-500/90 to-purple-600/90",
  "from-sky-500/90 to-blue-600/90",
  "from-emerald-500/90 to-teal-600/90",
  "from-amber-500/90 to-orange-600/90",
  "from-pink-500/90 to-rose-600/90",
  "from-indigo-500/90 to-violet-600/90",
  "from-fuchsia-500/90 to-pink-600/90",
  "from-teal-500/90 to-cyan-600/90",
  "from-red-500/90 to-orange-600/90",
  "from-lime-500/90 to-emerald-600/90",
  "from-cyan-500/90 to-blue-600/90",
  "from-rose-500/90 to-pink-600/90",
];

export function getAvatarGradient(emoji: string): string {
  let hash = 0;
  for (let i = 0; i < emoji.length; i++) {
    hash = ((hash << 5) - hash + emoji.charCodeAt(i)) | 0;
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}
