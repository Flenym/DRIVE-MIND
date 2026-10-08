// Author: Flenym
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { T } from '@/theme';

export function ScreenBg({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      <LinearGradient colors={['#050507', '#0B0B12', '#0A1220']} start={{ x: 0.2, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={[styles.orb, { backgroundColor: 'rgba(139,92,246,0.22)', top: -80, left: -60 }]} />
      <View style={[styles.orb, { backgroundColor: 'rgba(6,182,214,0.18)', top: 120, right: -40 }]} />
      <View style={[styles.orb, { backgroundColor: 'rgba(34,197,94,0.12)', bottom: 40, left: 40 }]} />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  orb: { position: 'absolute', width: 280, height: 280, borderRadius: 140, opacity: 1 },
});
