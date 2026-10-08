// Author: Flenym
import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllQuestions } from '@/database/repositories/contentRepo';
import { getAllStats, getAttempts } from '@/database/repositories/progressRepo';
import { summarizeProgress } from '@/utils/progress';
import { GlassCard } from '@/components/GlassCard';
import { ScreenBg } from '@/components/ScreenBg';
import { T } from '@/theme';

export function StatisticsScreen() {
  const [summary, setSummary] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const load = useCallback(async () => { const qs = await getAllQuestions(); const stats = await getAllStats(); setSummary(summarizeProgress(stats, qs.length)); setAttempts(await getAttempts(20)); }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  if (!summary) return <View style={{ flex: 1, backgroundColor: T.bg }}><Text style={{ color: '#fff', padding: 16 }}>Загрузка…</Text></View>;
  return (
    <ScreenBg><ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={styles.h1}>Статистика</Text>
      <GlassCard glow="rgba(6,182,214,0.16)"><Text style={styles.line}>Всего · {summary.total}</Text><Text style={[styles.line, { color: T.green }]}>Освоено · {summary.mastered}</Text><Text style={styles.line}>В работе · {summary.learning + summary.review}</Text><Text style={styles.muted}>Новые · {summary.newCount}</Text><Text style={styles.muted}>Точность · {summary.accuracy==null ? '—' : Math.round(summary.accuracy*100)+'%'}</Text></GlassCard>
      <Text style={styles.h2}>Последние попытки</Text>
      {attempts.map((a) => <Text key={a.id} style={{ color: a.isCorrect ? T.green : T.red, fontWeight: '600' }}>{a.questionId} — {a.isCorrect ? 'верно' : 'неверно'} · {a.mode}</Text>)}
    </ScrollView></ScreenBg>
  );
}
const styles = StyleSheet.create({ h1: { color: '#fff', fontSize: 24, fontWeight: '900' }, h2: { color: '#fff', fontWeight: '800' }, line: { color: '#fff', fontWeight: '700' }, muted: { color: T.muted, fontWeight: '600', marginTop: 4 } });
