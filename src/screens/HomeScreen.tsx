// Author: Flenym — Liquid Glass Home
import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAllQuestions } from '@/database/repositories/contentRepo';
import { getAllStats, getActiveSessions } from '@/database/repositories/progressRepo';
import { summarizeProgress } from '@/utils/progress';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { ProgressRing } from '@/components/ProgressRing';
import { ScreenBg } from '@/components/ScreenBg';
import { T } from '@/theme';

const ACCENT = ['🪞','⚡','🎯','🏁','🧠','📚'] as const;

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
    <ScreenBg>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 28 }} refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor="#fff" />}>
        <View style={styles.hero}>
          <Text style={styles.brand}>DRIVE MIND</Text>
          <Text style={styles.tagline}>Тренажёр ПДД · категория B · офлайн</Text>
          <Text style={styles.owner}>by Flenym</Text>
        </View>

        <GlassCard intensity={30} glow="rgba(34,197,94,0.18)">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <ProgressRing mastered={mastered} total={total || 1} />
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.cardTitle}>Прогресс</Text>
              {summary ? (
                <>
                  <Row dot={T.green} label={`Освоено ${summary.mastered}`} value={`${total ? Math.round((summary.mastered/total)*100) : 0}%`} />
                  <Row dot={T.amber} label={`На повторении ${summary.review + summary.learning}`} />
                  <Row dot={T.muted2} label={`Новые ${summary.newCount}`} />
                  {summary.accuracy != null && <Text style={styles.muted}>Точность · {Math.round(summary.accuracy*100)}%</Text>}
                </>
              ) : <Text style={styles.muted}>Загрузка…</Text>}
            </View>
          </View>
          <View style={styles.meter}><View style={[styles.meterFill, { width: `${total ? Math.round((mastered/total)*100) : 0}%` }]} /></View>
        </GlassCard>

        {hasSession && <Button title="Продолжить" icon="▶︎" onPress={() => nav.navigate('QuestionRunner', { mode: 'continue' })} />}

        <View style={styles.grid}>
          <Tile icon="⚡" title="Умная тренировка" sub="Подбор по FSRS" onPress={() => nav.navigate('SmartTraining')} colors={['#8B5CF6','#06B6D4']} />
          <Tile icon="🎯" title="Билеты" sub={`${total} вопросов`} onPress={() => nav.navigate('Tickets')} colors={['#06B6D4','#22C55E']} />
          <Tile icon="🏁" title={`Марафон ${total || ''}`.trim()} sub="Весь пул" onPress={() => nav.navigate('QuestionRunner', { mode: 'marathon' })} colors={['#22C55E','#84CC16']} wide />
          <Tile icon="🧪" title="Экзамен" sub="20 вопросов" onPress={() => nav.navigate('QuestionRunner', { mode: 'exam' })} colors={['#F59E0B','#EF4444']} />
          <Tile icon="🔁" title="Ошибки" sub="Работа над ошибками" onPress={() => nav.navigate('Mistakes')} colors={['#EF4444','#8B5CF6']} />
          <Tile icon="📚" title="Теория" sub="ПДД по темам" onPress={() => nav.navigate('Theory')} colors={['#0EA5E9','#6366F1']} />
        </View>

        <Pressable onPress={() => nav.navigate('Statistics')} style={styles.statLink}>
          <Text style={styles.statLinkText}>Статистика →</Text>
        </Pressable>
      </ScrollView>
    </ScreenBg>
  );
}

function Row({ dot, label, value }: { dot: string; label: string; value?: string }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} /><Text style={{ color: '#fff', fontWeight: '600', flex: 1 }}>{label}</Text>{value ? <Text style={{ color: T.muted, fontWeight: '700' }}>{value}</Text> : null}</View>;
}
function Tile({ icon, title, sub, onPress, colors, wide }: { icon: string; title: string; sub: string; onPress: () => void; colors: string[]; wide?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.tile, wide && { flexBasis: '100%' }]}>
      <LinearGradient colors={colors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={styles.tileGlass}>
        <Text style={styles.tileIcon}>{icon}</Text>
        <Text style={styles.tileTitle}>{title}</Text>
        <Text style={styles.tileSub}>{sub}</Text>
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  hero: { paddingTop: 8, paddingBottom: 4 },
  brand: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: 1.2 },
  tagline: { color: T.muted, marginTop: 4, fontWeight: '600' },
  owner: { color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2, letterSpacing: 0.8 },
  cardTitle: { color: '#fff', fontWeight: '800', fontSize: 15, marginBottom: 2 },
  muted: { color: T.muted, fontSize: 12, marginTop: 2 },
  meter: { height: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginTop: 14 },
  meterFill: { height: 8, borderRadius: 999, backgroundColor: T.green },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { flexBasis: '48%', minHeight: 110, borderRadius: T.radius, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  tileGlass: { flex: 1, padding: 14, backgroundColor: 'rgba(0,0,0,0.14)', justifyContent: 'center' },
  tileIcon: { fontSize: 22 },
  tileTitle: { color: '#fff', fontWeight: '800', marginTop: 6, fontSize: 15 },
  tileSub: { color: 'rgba(255,255,255,0.82)', fontSize: 12, marginTop: 2, fontWeight: '600' },
  statLink: { alignItems: 'center', paddingVertical: 6 },
  statLinkText: { color: T.muted, fontWeight: '700' },
});
