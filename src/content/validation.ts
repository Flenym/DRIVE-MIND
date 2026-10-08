import { z } from 'zod';

export const AnswerSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
});

export const SourceSchema = z.object({
  name: z.string().min(1),
  url: z.string().nullable(),
});

export const QuestionImportSchema = z.object({
  id: z.string().min(1),
  ticketId: z.string().min(1),
  questionNumber: z.number().int().min(1),
  category: z.string().min(1),
  text: z.string().min(1),
  imagePath: z.string().nullable().optional(),
  extraImages: z.array(z.string()).nullable().optional(),
  answers: z.array(AnswerSchema).min(2),
  correctAnswerIds: z.array(z.string().min(1)).min(1),
  explanation: z.string().nullable().optional(),
  topicIds: z.array(z.string()).default([]),
  source: SourceSchema.optional(),
  version: z.number().int().min(1).optional(),
});

export const ManifestSchema = z.object({
  version: z.number().int().min(1),
  releasedAt: z.string(),
  categories: z.array(z.string()),
  files: z.array(z.object({ path: z.string(), sha256: z.string(), count: z.number() })),
  minAppVersion: z.string(),
  source: SourceSchema,
});

export type ValidatedQuestion = z.infer<typeof QuestionImportSchema>;

export function validateQuestionIds(q: ValidatedQuestion): string[] {
  const errors: string[] = [];
  const answerIds = new Set(q.answers.map((a) => a.id));
  if (new Set(q.answers.map((a) => a.id)).size !== q.answers.length) errors.push('duplicate answer ids');
  for (const cid of q.correctAnswerIds) if (!answerIds.has(cid)) errors.push(`correctAnswerId ${cid} not in answers`);
  if (new Set(q.correctAnswerIds).size !== q.correctAnswerIds.length) errors.push('duplicate correctAnswerIds');
  return errors;
}

export function contentReport(questions: ValidatedQuestion[]) {
  const issues: string[] = [];
  const ids = new Set<string>();
  let missingImage = 0;
  let emptyText = 0;
  for (const q of questions) {
    if (ids.has(q.id)) issues.push(`duplicate id ${q.id}`);
    ids.add(q.id);
    if (!q.text.trim()) emptyText++;
    if (q.imagePath === undefined || q.imagePath === '') { /* treat as no image expected */ }
    const v = validateQuestionIds(q);
    v.forEach((e) => issues.push(`${q.id}: ${e}`));
    if (!q.answers.length) issues.push(`${q.id}: no answers`);
    if (!q.correctAnswerIds.length) issues.push(`${q.id}: no correctAnswerIds`);
  }
  return { total: questions.length, uniqueIds: ids.size, emptyText, missingImage, issues };
}
