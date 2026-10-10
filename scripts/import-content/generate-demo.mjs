// Генератор ДЕМО-базы: 40 билетов x 20 вопросов = 800. Автор: Flenym.
// ВНИМАНИЕ: тексты-заглушки, это НЕ экзаменационные вопросы ГИБДД. Реальные билеты
// подключаются через manifest.json (см. PROJECT_PLAN.md §4).
import fs from 'node:fs';
const src = JSON.parse(fs.readFileSync('assets/content/demo/questions.json', 'utf8'));
const out = [];
const TICKETS = 40, PER = 20;
const topics = ['signs', 'marking', 'lights', 'intersection', 'speed'];
for (let t = 1; t <= TICKETS; t++) {
  const tid = `ticket-${String(t).padStart(2, '0')}`;
  for (let n = 1; n <= PER; n++) {
    const base = src[(t * PER + n) % src.length];
    const id = `demo-${tid}-${String(n).padStart(2, '0')}`;
    const answers = [
      { id: `${id}-a1`, text: `Вариант A (демо ${t}.${n})` },
      { id: `${id}-a2`, text: `Вариант B (демо ${t}.${n})` },
      { id: `${id}-a3`, text: `Вариант C (демо ${t}.${n})` },
    ];
    out.push({
      id, ticketId: tid, questionNumber: n, category: 'B',
      text: `[ДЕМО ${t}.${n}] ${base.text.replace(/^\[ДЕМО\]\s*/, '')}`,
      imagePath: null, extraImages: null,
      answers, correctAnswerIds: [answers[(t + n) % 3].id],
      explanation: 'Демо-пояснение: замените базой с официальными вопросами.',
      topicIds: [topics[(t + n) % topics.length]],
      source: { name: 'DEMO — не экзаменационные', url: null },
      version: 1,
    });
  }
}
fs.writeFileSync('assets/content/demo/questions800.json', JSON.stringify(out, null, 1));
console.log('generated', out.length, 'questions in', TICKETS, 'tickets');
