import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
export function Button({ title, onPress, variant = 'primary', style, disabled }: { title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'ghost'; style?: ViewStyle; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.base, variant === 'primary' ? styles.primary : variant === 'secondary' ? styles.secondary : styles.ghost, pressed && { opacity: 0.85 }, disabled && { opacity: 0.5 }, style]}>
      <Text style={[styles.text, variant === 'ghost' ? styles.ghostText : null]}>{title}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  base: { borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: '#22C55E' },
  secondary: { backgroundColor: '#1A1A1C', borderWidth: 1, borderColor: '#2A2A2E' },
  ghost: { backgroundColor: 'transparent' },
  text: { color: '#fff', fontWeight: '700', fontSize: 16 },
  ghostText: { color: '#9AA0A6' },
});
