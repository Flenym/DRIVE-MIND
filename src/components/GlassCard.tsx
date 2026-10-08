// Author: Flenym — Liquid Glass
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { T } from '@/theme';

export function GlassCard({ children, style, intensity = 28, tint = 'dark', glow }: { children: React.ReactNode; style?: ViewStyle; intensity?: number; tint?: 'dark' | 'light'; glow?: string }) {
  return (
    <View style={[styles.wrap, style]}>
      <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['rgba(255,255,255,0.09)', 'rgba(255,255,255,0.02)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      {glow ? <View style={[styles.glow, { backgroundColor: glow }]} pointerEvents="none" /> : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { borderRadius: T.radius, borderWidth: 1, borderColor: T.border, overflow: 'hidden', backgroundColor: T.surface },
  glow: { position: 'absolute', width: 180, height: 180, borderRadius: 90, opacity: 0.22, top: -40, right: -40 },
  content: { padding: 16 },
});
