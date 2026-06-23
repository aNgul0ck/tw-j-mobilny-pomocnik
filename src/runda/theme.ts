// Runda design tokens — ported from the native app (src/lib/theme.ts)

export const C = {
  bg: '#000000',
  surface: 'rgba(22,22,22,0.78)',
  surfaceSolid: 'rgba(14,14,14,0.94)',
  border: 'rgba(255,255,255,0.14)',
  borderLight: 'rgba(255,255,255,0.07)',
  text: '#FFFFFF',
  textSec: 'rgba(255,255,255,0.60)',
  textTert: 'rgba(255,255,255,0.38)',
  // BeReal-style monochrome accent: white instead of color.
  accent: '#FFFFFF',
  accentLight: '#FFFFFF',
  accentBg: 'rgba(255,255,255,0.12)',
  accentBorder: 'rgba(255,255,255,0.24)',
  // online status — the single permitted micro-color.
  online: '#30D158',
  danger: '#FF453A',
  dangerBg: 'rgba(255,69,58,0.14)',
  dangerBorder: 'rgba(255,69,58,0.28)',
  soon: 'rgba(255,255,255,0.78)',
  soonBg: 'rgba(255,255,255,0.10)',
  planned: 'rgba(255,255,255,0.78)',
  plannedBg: 'rgba(255,255,255,0.10)',
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
