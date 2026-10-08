// Author: Flenym — Liquid Glass buttons
import { Pressable, Text, StyleSheet, ViewStyle, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { T } from '@/theme';

export function Button({ title, onPress, variant = 'primary', style, disabled, icon }: { title: string; onPress: () => void; variant?: 'primary' | 'glass' | 'ghost'; style?: ViewStyle; disabled?: boolean; icon?: string }) {
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); onPress(); }}
      disabled={disabled}
      style={({ pressed }) => [styles.base, primary ? styles.primaryWrap : styles.glassWrap, pressed && { opacity: 0.92, transform: [{ scale: 0.985 }] }, disabled && { opacity: 0.45 }, style]}
    >
      {primary ? (
        <LinearGradient colors={['#22C55E', '#16A34A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.grad} />
      ) : (
        <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFill} />
      )}
      <View style={styles.row}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <Text style={[styles.text, variant === 'ghost' && styles.ghostText, primary ? { color: '#fff' } : { color: '#fff' }]}>{title}</Text>
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  base: { borderRadius: 18, minHeight: 54, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1 },
  primaryWrap: { borderColor: 'rgba(34,197,94,0.35)', backgroundColor: '#16A34A' },
  glassWrap: { backgroundColor: T.surface, borderColor: T.border },
  grad: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 } as any,
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { fontSize: 16 },
  text: { fontWeight: '800', fontSize: 16, letterSpacing: 0.2 },
  ghostText: { color: T.muted },
});
