import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getAllQuestions } from '@/database/repositories/contentRepo';
import { getAllStats } from '@/database/repositories/progressRepo';
import { getActiveSessions } from '@/database/repositories/progressRepo';
import { summarizeProgress } from '@/utils/progress';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ProgressRing } from '@/components/ProgressRing';

export function HomeScreen() {
  const nav: any = useNavigation();
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<any>(null);
  const [hasSession, setHasSession] = useState(false);

  const load = useCallback(async () => {
    try {
      const qs = await getAllQuestions();
      const stats = await getAllStats();
      setTotal(qs.length);
      setSummary(summarizeProgress(stats, qs.length));
      const sessions = await getActiveSessions();
      setHasSession(sessions.length > 0);
    } catch {}
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const mastered = summary?.mastered ?? 0;
  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 16, gap: 12 }} refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}>
      <Text style={styles.h1}>DRIVE MIND</Text>
      <Text style={styles.sub}>Персональный тренажёр ПДД — категория B</Text>
      <View style={{ alignItems: 'center', marginVertical: 8 }}><ProgressRing mastered={mastered} total={total || 1} /></View>
      {summary && (
        <Card>
          <Text style={styles.cardTitle}>Прогресс</Text>
          <Text style={styles.muted}>Всего вопросов: {summary.total}</Text>
          <Text style={[styles.line, { color: '#22C55E' }]}>● Освоено: {summary.mastered}</Text>
          <Text style={[styles.line, { color: '#F59E0B' }]}>● На повторении: {summary.review + summary.learning}</Text>
          <Text style={[styles.line, { color: '#6B7280' }]}>● Новые: {summary.newCount}</Text>
          {summary.accuracy != null && <Text style={styles.muted}>Точность: {Math.round(summary.accuracy * 100)}%</Text>}
        </Card>
      )}
      {hasSession && <Button title="Продолжить" onPress={() => nav.navigate('QuestionRunner', { mode: 'continue' })} />}
      <Button title="Умная тренировка" variant="secondary" onPress={() => nav.navigate('SmartTraining')} />
      <Button title="Билеты" variant="secondary" onPress={() => nav.navigate('Tickets')} />
      <Button title={`Марафон ${total || ''}`.trim()} variant="secondary" onPress={() => nav.navigate('QuestionRunner', { mode: 'marathon' })} />
      <Button title="Экзамен" variant="secondary" onPress={() => nav.navigate('QuestionRunner', { mode: 'exam' })} />
      <Button title="Работа над ошибками" variant="secondary" onPress={() => nav.navigate('Mistakes')} />
      <Button title="Теория ПДД" variant="secondary" onPress={() => nav.navigate('Theory')} />
      <Button title="Статистика" variant="ghost" onPress={() => nav.navigate('Statistics')} />
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  h1: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: 1 },
  sub: { color: '#9AA0A6', marginTop: 4 },
  cardTitle: { color: '#fff', fontWeight: '700', marginBottom: 8 },
  line: { color: '#fff', marginTop: 4 },
  muted: { color: '#9AA0A6', marginTop: 4 },
});
