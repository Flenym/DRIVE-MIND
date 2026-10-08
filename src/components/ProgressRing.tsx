import { View, Text, StyleSheet } from 'react-native';
export function ProgressRing({ mastered, total, size = 120 }: { mastered: number; total: number; size?: number }) {
  const pct = total ? Math.round((mastered / total) * 100) : 0;
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={styles.pct}>{pct}%</Text>
      <Text style={styles.sub}>{mastered}/{total} освоено</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { backgroundColor: '#151516', borderWidth: 3, borderColor: '#22C55E', alignItems: 'center', justifyContent: 'center' },
  pct: { color: '#fff', fontSize: 28, fontWeight: '800' },
  sub: { color: '#9AA0A6', fontSize: 12, marginTop: 4 },
});
