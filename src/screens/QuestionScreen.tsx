// Author: Flenym — Liquid Glass Question
import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { ScreenBg } from '@/components/ScreenBg';
import type { Question } from '@/types';
import { T } from '@/theme';

export function QuestionScreen({ route, navigation }: any) {
  const { question, index, total, onAnswer } = route.params as { question: Question; index: number; total: number; onAnswer: (ids: string[]) => void; mode: string };
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [zoom, setZoom] = useState(false);
  const multi = question.correctAnswerIds.length > 1;

  const toggle = (id: string) => {
    if (revealed) return;
    Haptics.selectionAsync().catch(() => {});
    if (multi) setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    else setSelected([id]);
  };
  const correct = useMemo(() => {
    const a = new Set(question.correctAnswerIds), b = new Set(selected);
    if (a.size !== b.size) return false;
    for (const x of a) if (!b.has(x)) return false;
    return true;
  }, [selected, question.correctAnswerIds]);
  const submit = () => {
    if (selected.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setRevealed(true);
  };

  return (
    <ScreenBg>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}>
        <View style={styles.headRow}><Text style={styles.head}>{question.ticketId} · вопрос {question.questionNumber}</Text><Text style={styles.headCount}>{index+1} / {total}</Text></View>
        <View style={styles.progress}><LinearGradient colors={['#22C55E','#06B6D4']} style={[styles.bar, { width: `${Math.round(((index+1)/total)*100)}%` }]} start={{x:0,y:0}} end={{x:1,y:0}} /></View>

        <GlassCard intensity={26} style={{ padding: 0 } as any}>
          <View style={{ padding: 16, gap: 10 }}>
            {question.imagePath ? (
              <Pressable onPress={() => setZoom(true)} style={styles.imgWrap}>
                <Image source={{ uri: question.imagePath }} style={styles.img} resizeMode="contain" />
                <View style={styles.zoomBadge}><Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>⤢ увеличить</Text></View>
              </Pressable>
            ) : null}
            <Text style={styles.qtext}>{question.text}</Text>
            <Text style={styles.hint}>{multi ? 'Можно несколько ответов' : 'Выбери один'} · нажми чтобы отметить</Text>
          </View>
        </GlassCard>

        {question.answers.map((a) => {
          const sel = selected.includes(a.id);
          const isCorrect = revealed && question.correctAnswerIds.includes(a.id);
          const isWrongSel = revealed && sel && !question.correctAnswerIds.includes(a.id);
          return (
            <Pressable key={a.id} onPress={() => toggle(a.id)} style={[styles.ans, sel && styles.ansSel, isCorrect && styles.ansCorrect, isWrongSel && styles.ansWrong]}>
              <BlurView intensity={sel ? 18 : 14} tint="dark" style={StyleSheet.absoluteFill} />
              <Text style={styles.ansText}>{a.text}</Text>
              {sel && !revealed && <View style={styles.check}><Text style={{ color: '#fff', fontWeight: '900' }}>✓</Text></View>}
              {revealed && isCorrect && <Text style={styles.badgeOk}>✓ верно</Text>}
              {revealed && isWrongSel && <Text style={styles.badgeErr}>✕ ошибка</Text>}
            </Pressable>
          );
        })}

        {!revealed ? (
          <Button title="Ответить" onPress={submit} disabled={selected.length===0} />
        ) : (
          <GlassCard intensity={24} glow={correct ? 'rgba(34,197,94,0.22)' : 'rgba(239,68,68,0.18)'}>
            <Text style={[styles.result, correct ? styles.ok : styles.err]}>{correct ? 'Верно — красава!' : 'Неверно — запомним'}</Text>
            {question.explanation ? <Text style={styles.expl}>{question.explanation}</Text> : null}
            <Button title={index+1>=total ? 'Завершить' : 'Далее →'} onPress={() => { navigation.goBack(); onAnswer(selected); }} style={{ marginTop: 12 }} />
          </GlassCard>
        )}

        <Modal visible={zoom} transparent animationType="fade" onRequestClose={() => setZoom(false)}>
          <Pressable style={styles.modal} onPress={() => setZoom(false)}>
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
            {question.imagePath ? <Image source={{ uri: question.imagePath }} style={{ width: '94%', height: '72%' }} resizeMode="contain" /> : null}
            <Text style={{ color: '#fff', marginTop: 12, fontWeight: '700' }}>Нажми чтобы закрыть</Text>
          </Pressable>
        </Modal>
      </ScrollView>
    </ScreenBg>
  );
}
const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  head: { color: T.muted, fontSize: 12, fontWeight: '700', letterSpacing: 0.6 },
  headCount: { color: '#fff', fontWeight: '800', fontSize: 12 },
  progress: { height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' },
  bar: { height: 8, borderRadius: 999 },
  imgWrap: { borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: T.border },
  img: { width: '100%', height: 210 },
  zoomBadge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  qtext: { color: '#fff', fontSize: 19, lineHeight: 27, fontWeight: '800' },
  hint: { color: T.muted, fontSize: 12, fontWeight: '600' },
  ans: { borderRadius: 18, padding: 16, borderWidth: 1, borderColor: T.border, backgroundColor: T.surface, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: 10 },
  ansSel: { borderColor: 'rgba(255,255,255,0.16)', backgroundColor: 'rgba(255,255,255,0.06)' },
  ansCorrect: { borderColor: 'rgba(34,197,94,0.55)', backgroundColor: 'rgba(34,197,94,0.14)' },
  ansWrong: { borderColor: 'rgba(239,68,68,0.5)', backgroundColor: 'rgba(239,68,68,0.12)' },
  ansText: { color: '#fff', fontSize: 15, fontWeight: '600', flex: 1 },
  check: { width: 26, height: 26, borderRadius: 13, backgroundColor: T.green, alignItems: 'center', justifyContent: 'center' },
  badgeOk: { color: T.green, fontWeight: '800' },
  badgeErr: { color: T.red, fontWeight: '800' },
  result: { fontSize: 18, fontWeight: '900', textAlign: 'center' },
  ok: { color: T.green },
  err: { color: T.red },
  expl: { color: '#E5E7EB', backgroundColor: 'rgba(255,255,255,0.06)', padding: 12, borderRadius: 14, marginTop: 10, borderWidth: 1, borderColor: T.border },
  modal: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
