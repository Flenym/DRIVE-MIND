// Author: Flenym — glass progress ring
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { T } from '@/theme';

export function ProgressRing({ mastered, total, size = 132 }: { mastered: number; total: number; size?: number }) {
  const pct = total ? Math.round((mastered / total) * 100) : 0;
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <BlurView intensity={26} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[styles.inner, { borderColor: pct === 100 ? T.green : 'rgba(255,255,255,0.12)' }]}>
        <Text style={styles.pct}>{pct}%</Text>
        <Text style={styles.sub}>{mastered}/{total}</Text>
        <Text style={styles.label}>освоено</Text>
      </View>
      <View style={[styles.dot, { backgroundColor: T.green, shadowColor: T.green }]} />
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { backgroundColor: 'rgba(18,18,22,0.9)', borderWidth: 1, borderColor: T.border, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  inner: { width: '84%', height: '84%', borderRadius: 999, borderWidth: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.28)' },
  pct: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: 0.5 },
  sub: { color: '#fff', fontWeight: '700', marginTop: 2 },
  label: { color: T.muted, fontSize: 11, marginTop: 1, letterSpacing: 0.6 },
  dot: { position: 'absolute', top: 10, right: 18, width: 10, height: 10, borderRadius: 5, shadowOpacity: 0.8, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
});
