// Runda design tokens — ported from the native app (src/lib/theme.ts)

export const C = {
  bg: '#0E1512',
  surface: 'rgba(40,44,46,0.62)',
  surfaceSolid: 'rgba(24,27,28,0.85)',
  border: 'rgba(255,255,255,0.12)',
  borderLight: 'rgba(255,255,255,0.07)',
  text: '#FFFFFF',
  textSec: 'rgba(255,255,255,0.56)',
  textTert: 'rgba(255,255,255,0.36)',
  accent: '#30D158',
  accentLight: '#34C759',
  accentBg: 'rgba(48,209,88,0.16)',
  accentBorder: 'rgba(48,209,88,0.34)',
  danger: '#FF453A',
  dangerBg: 'rgba(255,69,58,0.15)',
  dangerBorder: 'rgba(255,69,58,0.30)',
  soon: '#FF9F0A',
  soonBg: 'rgba(255,159,10,0.16)',
  planned: '#0A84FF',
  plannedBg: 'rgba(10,132,255,0.16)',
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
