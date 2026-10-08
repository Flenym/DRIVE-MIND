// validate incoming/questions.json — Author: Flenym
import fs from 'node:fs';
const path = process.argv[2] ?? 'assets/content/demo/questions.json';
const raw = fs.readFileSync(path, 'utf8');
const questions = JSON.parse(raw);
let errors = [];
let ids = new Set();
for (const q of questions) {
  if (!q.id || ids.has(q.id)) errors.push(`duplicate id ${q.id}`);
  ids.add(q.id);
  if (!q.text?.trim()) errors.push(`${q.id}: empty text`);
  if (!q.answers || q.answers.length < 2) errors.push(`${q.id}: need >=2 answers`);
  const aIds = new Set(q.answers.map(a=>a.id));
  for (const c of q.correctAnswerIds ?? []) if (!aIds.has(c)) errors.push(`${q.id}: correct ${c} not in answers`);
}
console.log(JSON.stringify({ total: questions.length, uniqueIds: ids.size, errors }, null, 2));
if (errors.length) process.exitCode = 1;
