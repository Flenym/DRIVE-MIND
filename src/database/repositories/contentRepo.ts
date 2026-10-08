import { getDb } from '../db';
import type { Question } from '@/types';

export async function importQuestions(rows: Question[]): Promise<void> {
  const db = getDb();
  await db.withTransactionAsync(async () => {
    for (const q of rows) {
      await db.runAsync(
        `INSERT OR REPLACE INTO questions(id,ticketId,questionNumber,category,text,imagePath,extraImages,explanation,sourceName,sourceUrl,version,topicIds) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
        [q.id, q.ticketId, q.questionNumber, q.category, q.text, q.imagePath, JSON.stringify(q.extraImages ?? null), q.explanation, q.source.name, q.source.url, q.version, JSON.stringify(q.topicIds)]
      );
      await db.runAsync('DELETE FROM answers WHERE questionId=?', [q.id]);
      await db.runAsync('DELETE FROM correct_answers WHERE questionId=?', [q.id]);
      for (let i = 0; i < q.answers.length; i++) {
        const a = q.answers[i];
        await db.runAsync('INSERT OR REPLACE INTO answers(id,questionId,text,sortOrder) VALUES(?,?,?,?)', [a.id, q.id, a.text, a.sortOrder ?? i]);
      }
      for (const cid of q.correctAnswerIds) {
        await db.runAsync('INSERT OR REPLACE INTO correct_answers(questionId,answerId) VALUES(?,?)', [q.id, cid]);
      }
      // ensure stats row exists (don't overwrite)
      await db.runAsync('INSERT OR IGNORE INTO question_stats(questionId) VALUES(?)', [q.id]);
    }
  });
}

export async function getAllQuestions(): Promise<Question[]> {
  const db = getDb();
  const qs = await db.getAllAsync<any>('SELECT * FROM questions ORDER BY ticketId, questionNumber');
  const out: Question[] = [];
  for (const row of qs) {
    const answers = await db.getAllAsync<any>('SELECT * FROM answers WHERE questionId=? ORDER BY sortOrder', [row.id]);
    const correct = await db.getAllAsync<any>('SELECT answerId FROM correct_answers WHERE questionId=?', [row.id]);
    out.push({
      id: row.id,
      ticketId: row.ticketId,
      questionNumber: row.questionNumber,
      category: row.category,
      text: row.text,
      imagePath: row.imagePath,
      extraImages: row.extraImages ? JSON.parse(row.extraImages) : null,
      explanation: row.explanation,
      topicIds: JSON.parse(row.topicIds || '[]'),
      source: { name: row.sourceName ?? '', url: row.sourceUrl },
      version: row.version,
      answers: answers.map((a: any) => ({ id: a.id, text: a.text, sortOrder: a.sortOrder })),
      correctAnswerIds: correct.map((c: any) => c.answerId),
    });
  }
  return out;
}

export async function getQuestionById(id: string): Promise<Question | null> {
  const all = await getAllQuestions();
  return all.find((q) => q.id === id) ?? null;
}

export async function getTickets(): Promise<{ ticketId: string; count: number }[]> {
  const rows = await getDb().getAllAsync<any>('SELECT ticketId, COUNT(*) as count FROM questions GROUP BY ticketId ORDER BY ticketId');
  return rows;
}

export async function getQuestionsByTicket(ticketId: string): Promise<Question[]> {
  const db = getDb();
  const rows = await db.getAllAsync<any>('SELECT * FROM questions WHERE ticketId=? ORDER BY questionNumber', [ticketId]);
  const out: Question[] = [];
  for (const row of rows) {
    const answers = await db.getAllAsync<any>('SELECT * FROM answers WHERE questionId=? ORDER BY sortOrder', [row.id]);
    const correct = await db.getAllAsync<any>('SELECT answerId FROM correct_answers WHERE questionId=?', [row.id]);
    out.push({
      id: row.id,
      ticketId: row.ticketId,
      questionNumber: row.questionNumber,
      category: row.category,
      text: row.text,
      imagePath: row.imagePath,
      extraImages: row.extraImages ? JSON.parse(row.extraImages) : null,
      explanation: row.explanation,
      topicIds: JSON.parse(row.topicIds || '[]'),
      source: { name: row.sourceName ?? '', url: row.sourceUrl },
      version: row.version,
      answers: answers.map((a: any) => ({ id: a.id, text: a.text, sortOrder: a.sortOrder })),
      correctAnswerIds: correct.map((c: any) => c.answerId),
    });
  }
  return out;
}
