// Runda design tokens — ported from the native app (src/lib/theme.ts)

export const C = {
  bg: '#F5F5F7',
  surface: '#FFFFFF',
  border: 'rgba(0,0,0,0.08)',
  borderLight: 'rgba(0,0,0,0.06)',
  text: '#1A1A1A',
  textSec: 'rgba(0,0,0,0.45)',
  textTert: 'rgba(0,0,0,0.28)',
  accent: '#1E8A44',
  accentLight: '#1E6A38',
  accentBg: 'rgba(30,138,68,0.10)',
  accentBorder: 'rgba(30,138,68,0.22)',
  danger: '#FF3B30',
  dangerBg: 'rgba(255,59,48,0.07)',
  dangerBorder: 'rgba(255,59,48,0.20)',
  soon: '#D97706',
  soonBg: 'rgba(217,119,6,0.10)',
  planned: '#2563EB',
  plannedBg: 'rgba(37,99,235,0.10)',
};

export type PlaceType =
  | 'bar' | 'cafe' | 'park' | 'playground'
  | 'campus' | 'gym' | 'museum' | 'restaurant' | 'other';

export type ActivityType =
  | 'kawa' | 'spacer' | 'siłownia' | 'plac_zabaw' | 'galeria'
  | 'coworking' | 'rower' | 'zakupy' | 'wydarzenie' | 'inne';

export type ActivityTiming = 'now' | 'soon' | 'planned';

const AVATAR_PALETTE = [
  '#5A8FC4', '#8B6EC4', '#4A9E6A', '#C46E8B',
  '#C4944A', '#4AABAB', '#7A9E4A', '#9A78C4',
  '#C47A5A', '#6A9EC4', '#A06EC4', '#4A7EC4',
];

export function avatarColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0][0] ?? '?').toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  kawa: 'Kawa',
  spacer: 'Spacer',
  siłownia: 'Siłownia',
  plac_zabaw: 'Plac zabaw',
  galeria: 'Galeria',
  coworking: 'Coworking',
  rower: 'Rower',
  zakupy: 'Zakupy',
  wydarzenie: 'Wydarzenie',
  inne: 'Inne',
};

export const ACTIVITY_TYPE_ICONS: Record<ActivityType, string> = {
  kawa: '◑',
  spacer: '○',
  siłownia: '◆',
  plac_zabaw: '◉',
  galeria: '▣',
  coworking: '▤',
  rower: '◐',
  zakupy: '◇',
  wydarzenie: '★',
  inne: '·',
};

export const ACTIVITY_TYPE_COLORS: Record<ActivityType, string> = {
  kawa: '#C4944A',
  spacer: '#4A9E6A',
  siłownia: '#C44A4A',
  plac_zabaw: '#5A8FC4',
  galeria: '#8B6EC4',
  coworking: '#6A82A0',
  rower: '#4A8A6A',
  zakupy: '#C46E5A',
  wydarzenie: '#C4A84A',
  inne: '#9A9A9A',
};

export const PLACE_TYPE_LABELS: Record<string, string> = {
  bar: 'Bar', cafe: 'Kawiarnia', park: 'Park',
  playground: 'Plac zabaw', campus: 'Kampus',
  gym: 'Siłownia', museum: 'Muzeum',
  restaurant: 'Restauracja', other: 'Inne',
};

export const PLACE_TYPE_COLORS: Record<string, string> = {
  bar: '#C46E5A', cafe: '#C4944A', park: '#4A9E6A',
  playground: '#5A8FC4', campus: '#8B6EC4',
  gym: '#C46E8B', museum: '#4AABAB',
  restaurant: '#C4944A', other: '#9A9A9A',
};
