// DRIVE MIND — Liquid Glass design system | Author: Flenym
import { StyleSheet } from 'react-native';

export const T = {
  bg: '#050507',
  bg2: '#0A0A0E',
  surface: 'rgba(22,22,26,0.82)',
  surface2: 'rgba(28,28,34,0.72)',
  border: 'rgba(255,255,255,0.08)',
  border2: 'rgba(255,255,255,0.12)',
  text: '#FFFFFF',
  muted: '#9AA0A8',
  muted2: '#6B7280',
  green: '#22C55E',
  greenSoft: 'rgba(34,197,94,0.18)',
  red: '#EF4444',
  amber: '#F59E0B',
  cyan: '#06B6D4',
  violet: '#8B5CF6',
  radius: 20,
  radiusSm: 14,
  shadow: { shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 12 } as any,
};

export const glassCard = StyleSheet.create({
  base: {
    backgroundColor: T.surface,
    borderRadius: T.radius,
    borderWidth: 1,
    borderColor: T.border,
    overflow: 'hidden',
  },
});

export function accentForMastery(level: string) {
  if (level === 'mastered') return T.green;
  if (level === 'review') return T.cyan;
  if (level === 'learning') return T.amber;
  return T.muted2;
}
