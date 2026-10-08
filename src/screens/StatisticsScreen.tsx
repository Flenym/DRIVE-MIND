import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllQuestions } from '@/database/repositories/contentRepo';
import { getAllStats, getAttempts } from '@/database/repositories/progressRepo';
import { summarizeProgress } from '@/utils/progress';

export function StatisticsScreen() {
  const [summary, setSummary] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const load = useCallback(async () => {
    const qs = await getAllQuestions();
    const stats = await getAllStats();
    setSummary(summarizeProgress(stats, qs.length));
    setAttempts(await getAttempts(20));
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  if (!summary) return <View style={styles.root}><Text style={{ color: '#fff' }}>Загрузка…</Text></View>;
  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 16, gap: 10 }}>
      <Text style={styles.h1}>Статистика</Text>
      <Text style={styles.line}>Всего: {summary.total}</Text>
      <Text style={styles.line}>Освоено: {summary.mastered}</Text>
      <Text style={styles.line}>В работе: {summary.learning + summary.review}</Text>
      <Text style={styles.line}>Новые: {summary.newCount}</Text>
      <Text style={styles.muted}>Точность: {summary.accuracy == null ? '—' : Math.round(summary.accuracy * 100) + '%'}</Text>
      <Text style={styles.h2}>Последние попытки</Text>
      {attempts.map((a) => <Text key={a.id} style={{ color: a.isCorrect ? '#22C55E' : '#EF4444' }}>{a.questionId} — {a.isCorrect ? 'верно' : 'неверно'} · {a.mode}</Text>)}
    </ScrollView>
  );
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#000' }, h1: { color: '#fff', fontSize: 20, fontWeight: '800' }, h2: { color: '#fff', fontWeight: '700', marginTop: 8 }, line: { color: '#fff' }, muted: { color: '#9AA0A6' } });
