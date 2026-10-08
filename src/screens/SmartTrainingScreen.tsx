import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/Button';
export function SmartTrainingScreen({ navigation }: any) {
  return (
    <View style={styles.root}>
      <Text style={styles.h1}>Умная тренировка</Text>
      <Text style={styles.muted}>Выберите длительность</Text>
      {[5, 10, 15, 20].map((m) => (
        <Button key={m} title={`${m} минут`} variant="secondary" onPress={() => navigation.navigate('QuestionRunner', { mode: 'smart', duration: m })} style={{ marginTop: 10 }} />
      ))}
      <Button title="Без ограничения" variant="secondary" onPress={() => navigation.navigate('QuestionRunner', { mode: 'smart' })} style={{ marginTop: 10 }} />
    </View>
  );
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#000', padding: 16, gap: 8 }, h1: { color: '#fff', fontSize: 22, fontWeight: '800' }, muted: { color: '#9AA0A6' } });
