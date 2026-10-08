import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllQuestions } from '@/database/repositories/contentRepo';
import { getStatsMap } from '@/database/repositories/progressRepo';
import { Button } from '@/components/Button';
export function MistakesScreen({ navigation }: any) {
  const [items, setItems] = useState<any[]>([]);
  const load = useCallback(async () => {
    const qs = await getAllQuestions();
    const map = await getStatsMap();
    const bad = qs.filter((q) => { const s = map.get(q.id); return s && (s.lastAnswerCorrect === false || s.incorrect > 0); });
    setItems(bad);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  return (
    <View style={styles.root}>
      <Text style={styles.h1}>Ошибки — {items.length}</Text>
      {items.length > 0 && <Button title="Повторить все ошибки" onPress={() => navigation.navigate('QuestionRunner', { mode: 'mistakes' })} />}
      <FlatList data={items} keyExtractor={(x) => x.id} renderItem={({ item }) => <View style={styles.card}><Text style={{ color: '#fff' }}>{item.text.slice(0, 90)}</Text><Text style={{ color: '#9AA0A6', fontSize: 12 }}>{item.ticketId} · #{item.questionNumber}</Text></View>} contentContainerStyle={{ gap: 8, paddingVertical: 12 }} />
    </View>
  );
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#000', padding: 16 }, h1: { color: '#fff', fontSize: 18, fontWeight: '700' }, card: { backgroundColor: '#151516', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#232326' } });
