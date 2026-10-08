import { View, StyleSheet, ViewStyle } from 'react-native';
export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: '#151516', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#232326' },
});
