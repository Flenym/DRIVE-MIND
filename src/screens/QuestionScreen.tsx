import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Modal } from 'react-native';
import { Button } from '@/components/Button';
import type { Question } from '@/types';

export function QuestionScreen({ route, navigation }: any) {
  const { question, index, total, onAnswer, mode } = route.params as { question: Question; index: number; total: number; onAnswer: (ids: string[]) => void; mode: string };
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [locked, setLocked] = useState(false);
  const [zoom, setZoom] = useState(false);
  const multi = question.correctAnswerIds.length > 1;

  const toggle = (id: string) => {
    if (revealed) return;
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
    if (locked || selected.length === 0) return;
    setLocked(true);
    setRevealed(true);
    // dedup guard: parent handles attempt insert
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={styles.head}>{question.ticketId} · вопрос {question.questionNumber} · {index + 1}/{total}</Text>
      <View style={styles.progress}><View style={[styles.bar, { width: `${Math.round(((index + 1) / total) * 100)}%` }]} /></View>
      {question.imagePath ? (
        <Pressable onPress={() => setZoom(true)}>
          <Image source={{ uri: question.imagePath }} style={styles.img} resizeMode="contain" />
        </Pressable>
      ) : null}
      <Text style={styles.qtext}>{question.text}</Text>
      <Text style={styles.hint}>{multi ? 'Можно выбрать несколько вариантов' : 'Выберите один ответ'}</Text>
      {question.answers.map((a) => {
        const sel = selected.includes(a.id);
        const isCorrect = revealed && question.correctAnswerIds.includes(a.id);
        const isWrongSel = revealed && sel && !question.correctAnswerIds.includes(a.id);
        return (
          <Pressable key={a.id} onPress={() => toggle(a.id)} style={[styles.ans, sel && styles.ansSel, isCorrect && styles.ansCorrect, isWrongSel && styles.ansWrong]}>
            <Text style={styles.ansText}>{a.text}</Text>
            {revealed && isCorrect && <Text style={styles.badge}>✓ правильно</Text>}
            {revealed && isWrongSel && <Text style={styles.badgeWrong}>✕ ошибка</Text>}
          </Pressable>
        );
      })}
      {!revealed ? (
        <Button title="Ответить" onPress={submit} disabled={selected.length === 0} />
      ) : (
        <>
          <Text style={[styles.result, correct ? styles.ok : styles.err]}>{correct ? 'Верно!' : 'Неверно'}</Text>
          {question.explanation ? <Text style={styles.expl}>{question.explanation}</Text> : null}
          <Button title={index + 1 >= total ? 'Завершить' : 'Далее'} onPress={() => { navigation.goBack(); onAnswer(selected); }} />
        </>
      )}
      <Modal visible={zoom} transparent onRequestClose={() => setZoom(false)}>
        <Pressable style={styles.modal} onPress={() => setZoom(false)}>
          {question.imagePath ? <Image source={{ uri: question.imagePath }} style={{ width: '92%', height: '72%' }} resizeMode="contain" /> : null}
          <Text style={{ color: '#fff', marginTop: 12 }}>Нажмите чтобы закрыть</Text>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  head: { color: '#9AA0A6', fontSize: 12 },
  progress: { height: 4, backgroundColor: '#1A1A1C', borderRadius: 2, overflow: 'hidden' },
  bar: { height: 4, backgroundColor: '#22C55E' },
  img: { width: '100%', height: 200, backgroundColor: '#111', borderRadius: 12 },
  qtext: { color: '#fff', fontSize: 18, lineHeight: 26, fontWeight: '600' },
  hint: { color: '#9AA0A6', fontSize: 12 },
  ans: { backgroundColor: '#151516', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#232326' },
  ansSel: { borderColor: '#3A3A3E' },
  ansCorrect: { borderColor: '#22C55E', backgroundColor: '#122118' },
  ansWrong: { borderColor: '#EF4444', backgroundColor: '#211113' },
  ansText: { color: '#fff', fontSize: 15 },
  badge: { color: '#22C55E', marginTop: 6, fontWeight: '700' },
  badgeWrong: { color: '#EF4444', marginTop: 6, fontWeight: '700' },
  result: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  ok: { color: '#22C55E' },
  err: { color: '#EF4444' },
  expl: { color: '#C9CDD1', backgroundColor: '#151516', padding: 12, borderRadius: 12 },
  modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' },
});
