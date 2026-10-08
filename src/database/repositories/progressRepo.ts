import { getDb } from '../db';
import type { QuestionStats, Attempt, Session } from '@/types';

export async function getAllStats(): Promise<QuestionStats[]> {
  const rows = await getDb().getAllAsync<any>('SELECT * FROM question_stats');
  return rows.map(mapStats);
}

export async function getStats(questionId: string): Promise<QuestionStats | null> {
  const row = await getDb().getFirstAsync<any>('SELECT * FROM question_stats WHERE questionId=?', [questionId]);
  return row ? mapStats(row) : null;
}

export async function getStatsMap(): Promise<Map<string, QuestionStats>> {
  const all = await getAllStats();
  const m = new Map<string, QuestionStats>();
  for (const s of all) m.set(s.questionId, s);
  return m;
}

export async function upsertStats(s: QuestionStats): Promise<void> {
  await getDb().runAsync(
    `INSERT OR REPLACE INTO question_stats(questionId,attempts,correct,incorrect,streak,lastAnswerCorrect,lastAnsweredAt,masteryLevel,dueAt,stability,difficulty,intervalDays) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
    [s.questionId, s.attempts, s.correct, s.incorrect, s.streak, s.lastAnswerCorrect == null ? null : s.lastAnswerCorrect ? 1 : 0, s.lastAnsweredAt, s.masteryLevel, s.dueAt, s.stability, s.difficulty, s.intervalDays]
  );
}

export async function insertAttempt(a: Attempt): Promise<void> {
  await getDb().runAsync('INSERT OR REPLACE INTO attempts(id,questionId,ticketId,selectedAnswerIds,isCorrect,mode,createdAt) VALUES(?,?,?,?,?,?,?)', [a.id, a.questionId, a.ticketId, JSON.stringify(a.selectedAnswerIds), a.isCorrect ? 1 : 0, a.mode, a.createdAt]);
}

export async function getAttempts(limit = 200): Promise<Attempt[]> {
  const rows = await getDb().getAllAsync<any>('SELECT * FROM attempts ORDER BY createdAt DESC LIMIT ?', [limit]);
  return rows.map((r: any) => ({ id: r.id, questionId: r.questionId, ticketId: r.ticketId, selectedAnswerIds: JSON.parse(r.selectedAnswerIds), isCorrect: !!r.isCorrect, mode: r.mode, createdAt: r.createdAt }));
}

export async function getMistakes(): Promise<string[]> {
  const rows = await getDb().getAllAsync<any>("SELECT questionId FROM question_stats WHERE lastAnswerCorrect=0 OR incorrect>0 ORDER BY incorrect DESC, lastAnsweredAt DESC");
  return rows.map((r: any) => r.questionId);
}

// sessions
export async function saveSession(s: Session): Promise<void> {
  await getDb().runAsync('INSERT OR REPLACE INTO sessions(id,mode,ticketId,questionIds,currentIndex,answers,startedAt,updatedAt,completedAt) VALUES(?,?,?,?,?,?,?,?,?)', [s.id, s.mode, s.ticketId, JSON.stringify(s.questionIds), s.currentIndex, JSON.stringify(s.answers), s.startedAt, s.updatedAt, s.completedAt]);
}
export async function getSession(id: string): Promise<Session | null> {
  const r = await getDb().getFirstAsync<any>('SELECT * FROM sessions WHERE id=?', [id]);
  if (!r) return null;
  return { id: r.id, mode: r.mode, ticketId: r.ticketId, questionIds: JSON.parse(r.questionIds), currentIndex: r.currentIndex, answers: JSON.parse(r.answers), startedAt: r.startedAt, updatedAt: r.updatedAt, completedAt: r.completedAt };
}
export async function getActiveSessions(): Promise<Session[]> {
  const rows = await getDb().getAllAsync<any>('SELECT * FROM sessions WHERE completedAt IS NULL ORDER BY updatedAt DESC');
  return rows.map((r: any) => ({ id: r.id, mode: r.mode, ticketId: r.ticketId, questionIds: JSON.parse(r.questionIds), currentIndex: r.currentIndex, answers: JSON.parse(r.answers), startedAt: r.startedAt, updatedAt: r.updatedAt, completedAt: r.completedAt }));
}

function mapStats(r: any): QuestionStats {
  return {
    questionId: r.questionId,
    attempts: r.attempts,
    correct: r.correct,
    incorrect: r.incorrect,
    streak: r.streak,
    lastAnswerCorrect: r.lastAnswerCorrect == null ? null : !!r.lastAnswerCorrect,
    lastAnsweredAt: r.lastAnsweredAt,
    masteryLevel: r.masteryLevel,
    dueAt: r.dueAt,
    stability: r.stability,
    difficulty: r.difficulty,
    intervalDays: r.intervalDays ?? 0,
  };
}
