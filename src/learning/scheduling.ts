import type { Question, QuestionStats } from '@/types';

export type PickOpts = { limit: number; now?: Date; recentIds?: string[] };

export function pickQuestions(questions: Question[], statsMap: Map<string, QuestionStats>, opts: PickOpts): Question[] {
  const now = opts.now ?? new Date();
  const recent = new Set(opts.recentIds ?? []);
  const scored = questions.map((q) => {
    const s = statsMap.get(q.id);
    let priority = 0;
    let bucket: string = 'new';
    if (!s || s.attempts === 0) { bucket = 'new'; priority = 30 + Math.random() * 5; }
    else if (s.lastAnswerCorrect === false) { bucket = 'mistake'; priority = 100 + s.incorrect * 10 - (s.streak * 2); }
    else if (s.dueAt && new Date(s.dueAt) <= now) { const overdueDays = (now.getTime() - new Date(s.dueAt).getTime()) / 86400000; bucket = 'due'; priority = 80 + overdueDays * 2 + (s.difficulty ?? 5); }
    else if (s.masteryLevel === 'learning') { bucket = 'learning'; priority = 60 + (s.incorrect * 3); }
    else if (s.masteryLevel === 'review') { bucket = 'review'; priority = 20 + Math.random() * 10; }
    else { bucket = 'mastered'; priority = 5 + Math.random() * 5; }
    if (recent.has(q.id)) priority -= 50;
    return { q, priority, bucket, dueAt: s?.dueAt ?? null };
  });
  // Sort by priority desc, dueAt asc for ties
  scored.sort((a, b) => b.priority - a.priority || (a.dueAt ?? '').localeCompare(b.dueAt ?? ''));
  // Adaptive mix: don't just take top N — interleave to avoid clumping
  const result: Question[] = [];
  const buckets: Record<string, typeof scored> = { mistake: [], due: [], learning: [], new: [], review: [], mastered: [] };
  for (const s of scored) buckets[s.bucket]?.push(s);
  // Round-robin by priority bucket
  const order: (keyof typeof buckets)[] = ['mistake', 'due', 'learning', 'new', 'review', 'mastered'];
  let idx = 0;
  const seen = new Set<string>();
  while (result.length < opts.limit) {
    let added = false;
    for (const b of order) {
      const arr = buckets[b];
      // find next not seen
      while (arr.length && seen.has(arr[0].q.id)) arr.shift();
      if (arr.length) {
        const item = arr.shift()!;
        if (!seen.has(item.q.id)) { result.push(item.q); seen.add(item.q.id); added = true; }
        if (result.length >= opts.limit) break;
      }
    }
    if (!added) break;
    if (++idx > opts.limit * 2) break;
  }
  // If still short, fill by global priority
  if (result.length < opts.limit) {
    for (const s of scored) if (!seen.has(s.q.id)) { result.push(s.q); seen.add(s.q.id); if (result.length >= opts.limit) break; }
  }
  // Anti-loop: limit repeats of same question handled by caller (recent window)
  return result.slice(0, opts.limit);
}

export function masteryCounts(statsMap: Map<string, QuestionStats>, total: number) {
  let mastered = 0, review = 0, learning = 0, newCount = 0;
  const now = new Date();
  let due = 0;
  for (const [_, s] of statsMap) {
    if (s.masteryLevel === 'mastered') mastered++;
    else if (s.masteryLevel === 'review') review++;
    else if (s.masteryLevel === 'learning') learning++;
    else newCount++;
    if (s.dueAt && new Date(s.dueAt) <= now) due++;
  }
  // questions without stats are new
  const withStats = statsMap.size;
  newCount += Math.max(0, total - withStats);
  return { mastered, review, learning, newCount, due };
}
