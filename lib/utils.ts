import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDatum(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTijd(seconden: number): string {
  const m = Math.floor(seconden / 60);
  const s = seconden % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export const AVATAR_KLEUREN = [
  '#15532E', // forest green
  '#1D4ED8', // blue
  '#7C3AED', // violet
  '#C2410C', // orange
  '#0F766E', // teal
  '#BE185D', // pink
  '#92400E', // amber
  '#1E40AF', // indigo
];

export interface XPLevel {
  niveau: number;
  titel: string;
  emoji: string;
  minXP: number;
  volgendeXP: number | null; // null = max level
}

const XP_LEVELS: XPLevel[] = [
  { niveau: 1, titel: 'Beginner',    emoji: '🌱', minXP: 0,    volgendeXP: 50   },
  { niveau: 2, titel: 'Leerling',    emoji: '📚', minXP: 50,   volgendeXP: 150  },
  { niveau: 3, titel: 'Denker',      emoji: '🧠', minXP: 150,  volgendeXP: 300  },
  { niveau: 4, titel: 'Ster',        emoji: '⭐', minXP: 300,  volgendeXP: 500  },
  { niveau: 5, titel: 'Superkind',   emoji: '🚀', minXP: 500,  volgendeXP: 1000 },
  { niveau: 6, titel: 'Breinmeester',emoji: '🏆', minXP: 1000, volgendeXP: null },
];

export function getXPLevel(xp: number): XPLevel {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i].minXP) return XP_LEVELS[i];
  }
  return XP_LEVELS[0];
}

export function groepLabel(groep: number): string {
  return `Groep ${groep}`;
}

export function percentageKleur(pct: number): string {
  if (pct >= 80) return '#15532E';
  if (pct >= 60) return '#C2690A';
  return '#DC2626';
}
