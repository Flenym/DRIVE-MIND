/**
 * FSRS-lite: честная реализация интервального повторения без притязаний на полный FSRS-4.5.
 * Если нужна полная совместимость — замените на ts-fsrs и адаптируйте вызовы.
 * Параметры w по умолчанию калиброваны на короткие интервалы экзамена (дни, не месяцы).
 */
import type { QuestionStats } from '@/types';

const W = [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61];

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export function gradeFromCorrect(isCorrect: boolean, timeMs?: number): Grade {
  if (!isCorrect) return 'again';
  if (timeMs != null && timeMs < 4000) return 'easy';
  if (timeMs != null && timeMs > 20000) return 'hard';
  return 'good';
}

function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)); }

export function nextState(prev: QuestionStats | null, grade: Grade, now = new Date()): Omit<QuestionStats, 'questionId'> {
  const attempts = (prev?.attempts ?? 0) + 1;
  const isAgain = grade === 'again';
  const correct = (prev?.correct ?? 0) + (isAgain ? 0 : 1);
  const incorrect = (prev?.incorrect ?? 0) + (isAgain ? 1 : 0);
  const streak = isAgain ? 0 : (prev?.streak ?? 0) + 1;
  let stability = prev?.stability ?? W[0];
  let difficulty = prev?.difficulty ?? 5.0;
  let intervalDays: number;
  let dueAt: string;

  if (!prev || prev.attempts === 0) {
    if (isAgain) { intervalDays = 0; dueAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString(); difficulty = clamp(difficulty + 0.5, 1, 10); }
    else if (grade === 'hard') { intervalDays = 1; stability = W[1]; difficulty = clamp(difficulty - 0.1, 1, 10); dueAt = addDays(now, 1).toISOString(); }
    else if (grade === 'good') { intervalDays = 3; stability = W[2]; dueAt = addDays(now, 3).toISOString(); }
    else { intervalDays = 7; stability = W[3]; difficulty = clamp(difficulty - 0.3, 1, 10); dueAt = addDays(now, 7).toISOString(); }
  } else {
    const dFactor = difficulty / 5;
    if (isAgain) {
      stability = Math.max(0.1, stability * 0.3);
      intervalDays = 0;
      dueAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
      difficulty = clamp(difficulty + 0.4, 1, 10);
    } else {
      const mult = grade === 'easy' ? 1.6 : grade === 'hard' ? 1.1 : 1.35;
      stability = stability * mult * (1 + (10 - difficulty) * 0.02);
      intervalDays = Math.max(1, Math.round(stability * (0.9 + dFactor * 0.1)));
      if (grade === 'easy') difficulty = clamp(difficulty - 0.2, 1, 10);
      if (grade === 'hard') difficulty = clamp(difficulty + 0.15, 1, 10);
      dueAt = addDays(now, intervalDays).toISOString();
    }
  }

  const masteryLevel = masteryFrom(streak, intervalDays, isAgain, prev?.masteryLevel ?? 'new');
  return {
    attempts, correct, incorrect, streak,
    lastAnswerCorrect: !isAgain,
    lastAnsweredAt: now.toISOString(),
    masteryLevel, dueAt, stability, difficulty, intervalDays,
  };
}

function masteryFrom(streak: number, intervalDays: number, isAgain: boolean, prev: string): any {
  if (isAgain) return 'learning';
  if (streak >= 5 && intervalDays >= 21) return 'mastered';
  if (streak >= 3) return 'review';
  if (streak >= 1) return 'learning';
  return prev === 'new' ? 'learning' : prev;
}

function addDays(d: Date, n: number) { return new Date(d.getTime() + n * 86400000); }

/** Проверка ответа: множественный выбор — точное совпадение множества. */
export function isAnswerCorrect(correctIds: string[], selectedIds: string[]): boolean {
  if (correctIds.length !== selectedIds.length) return false;
  const a = new Set(correctIds), b = new Set(selectedIds);
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}
