import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { getAllQuestions, getQuestionsByTicket } from '@/database/repositories/contentRepo';
import { getStatsMap, upsertStats, insertAttempt, saveSession, getActiveSessions } from '@/database/repositories/progressRepo';
import { nextState, gradeFromCorrect, isAnswerCorrect } from '@/learning/repetition/fsrs';
import { pickQuestions } from '@/learning/scheduling';
import { QuestionScreen } from './QuestionScreen';
import type { Question } from '@/types';

function uuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export function QuestionRunner({ route, navigation }: any) {
  const { mode, ticketId, duration } = route.params ?? {};
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  const init = useCallback(async () => {
    if (mode === 'continue') {
      const sessions = await getActiveSessions();
      if (sessions.length) {
        const s = sessions[0];
        const all = await getAllQuestions();
        const map = new Map(all.map((q) => [q.id, q]));
        const qs = s.questionIds.map((id) => map.get(id)).filter(Boolean) as Question[];
        setQuestions(qs);
        setIdx(s.currentIndex);
        setSessionId(s.id);
        return;
      }
    }
    if (mode === 'ticket' && ticketId) {
      const qs = await getQuestionsByTicket(ticketId);
      setQuestions(qs);
      const id = uuid();
      setSessionId(id);
      await saveSession({ id, mode: 'ticket', ticketId, questionIds: qs.map((q) => q.id), currentIndex: 0, answers: {}, startedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), completedAt: null });
      return;
    }
    if (mode === 'marathon' || mode === 'mistakes') {
      const all = await getAllQuestions();
      let qs = all;
      if (mode === 'mistakes') {
        const m = await getStatsMap();
        const badIds = [...m.entries()].filter(([, s]) => s.lastAnswerCorrect === false || s.incorrect > 0).map(([k]) => k);
        qs = all.filter((q) => badIds.includes(q.id));
      }
      setQuestions(qs);
      const id = uuid();
      setSessionId(id);
      await saveSession({ id, mode, ticketId: null, questionIds: qs.map((q) => q.id), currentIndex: 0, answers: {}, startedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), completedAt: null });
      return;
    }
    if (mode === 'smart' || mode === 'exam') {
      const all = await getAllQuestions();
      const map = await getStatsMap();
      const limit = mode === 'exam' ? 20 : duration === 5 ? 10 : duration === 10 ? 20 : duration === 15 ? 30 : 40;
      const qs = mode === 'exam' ? all.slice(0, limit) : pickQuestions(all, map, { limit, recentIds: [] });
      setQuestions(qs);
      const id = uuid();
      setSessionId(id);
      await saveSession({ id, mode, ticketId: null, questionIds: qs.map((q) => q.id), currentIndex: 0, answers: {}, startedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), completedAt: null });
      return;
    }
    const all = await getAllQuestions();
    setQuestions(all.slice(0, 10));
  }, [mode, ticketId, duration]);

  useEffect(() => { init(); }, [init]);

  const current = questions[idx];

  const handleAnswer = async (selected: string[]) => {
    if (!current) return;
    const correct = isAnswerCorrect(current.correctAnswerIds, selected);
    const grade = gradeFromCorrect(correct);
    // FSRS update
    const { getStats } = await import('@/database/repositories/progressRepo');
    const prev = await getStats(current.id);
    const base: any = prev ?? { questionId: current.id, attempts: 0, correct: 0, incorrect: 0, streak: 0, lastAnswerCorrect: null, lastAnsweredAt: null, masteryLevel: 'new', dueAt: null, stability: null, difficulty: null, intervalDays: 0 };
    const next = nextState(base, grade);
    await upsertStats({ questionId: current.id, ...next });
    await insertAttempt({ id: uuid(), questionId: current.id, ticketId: current.ticketId, selectedAnswerIds: selected, isCorrect: correct, mode: mode ?? 'practice', createdAt: new Date().toISOString() });
    setStats((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    // session advance
    if (sessionId) {
      const { getSession } = await import('@/database/repositories/progressRepo');
      const sess = await getSession(sessionId);
      if (sess) {
        const nextIdx = idx + 1;
        const updated = { ...sess, currentIndex: nextIdx, answers: { ...sess.answers, [current.id]: selected }, updatedAt: new Date().toISOString(), completedAt: nextIdx >= questions.length ? new Date().toISOString() : null };
        await saveSession(updated);
      }
    }
    if (idx + 1 >= questions.length) { setDone(true); }
    else setIdx((i) => i + 1);
  };

  if (!questions.length) return <View style={styles.center}><Text style={{ color: '#fff' }}>Загрузка…</Text></View>;
  if (done) return <View style={styles.center}><Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>Готово!</Text><Text style={{ color: '#9AA0A6', marginTop: 8 }}>Правильно {stats.correct}/{stats.total}</Text><Pressable onPress={() => navigation.goBack()} style={styles.btn}><Text style={{ color: '#fff', fontWeight: '700' }}>На главную</Text></Pressable></View>;
  if (!current) return null;
  // delegate to QuestionScreen via inline
  return <QuestionScreen route={{ params: { question: current, index: idx, total: questions.length, onAnswer: handleAnswer, mode } }} navigation={{ goBack: () => handleAnswer([]) } as any} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 16 },
  btn: { marginTop: 16, backgroundColor: '#22C55E', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 16 },
});
