import demo from '../../assets/content/demo/questions.json';
import demoManifest from '../../assets/content/demo/manifest.json';
import { getDb, setMeta } from './db';
import { importQuestions } from './repositories/contentRepo';

export async function seedDemoIfEmpty(): Promise<boolean> {
  const db = getDb();
  const row = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM questions');
  if ((row?.c ?? 0) > 0) return false;
  const questions: any[] = (demo as any[]).map((q) => ({
    ...q,
    extraImages: q.extraImages ?? null,
    imagePath: q.imagePath ?? null,
    explanation: q.explanation ?? null,
    topicIds: q.topicIds ?? [],
    source: q.source ?? { name: 'DEMO', url: null },
    version: q.version ?? 1,
    answers: q.answers.map((a: any, i: number) => ({ id: a.id, text: a.text, sortOrder: i })),
  }));
  await importQuestions(questions);
  await setMeta('content_version', String(demoManifest.version));
  await setMeta('content_source', demoManifest.source.name);
  return true;
}
