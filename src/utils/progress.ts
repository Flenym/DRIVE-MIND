import type { ProgressSummary, QuestionStats } from '@/types';

export function summarizeProgress(stats: QuestionStats[], total: number): ProgressSummary {
  let mastered = 0, review = 0, learning = 0;
  let correct = 0, attempts = 0;
  for (const s of stats) {
    if (s.masteryLevel === 'mastered') mastered++;
    else if (s.masteryLevel === 'review') review++;
    else if (s.masteryLevel === 'learning') learning++;
    correct += s.correct;
    attempts += s.attempts;
  }
  const newCount = Math.max(0, total - stats.length);
  const accuracy = attempts ? correct / attempts : null;
  return { total, newCount, learning, review, mastered, accuracy };
}
