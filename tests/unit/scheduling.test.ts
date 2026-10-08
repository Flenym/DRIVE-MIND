import { pickQuestions } from '@/learning/scheduling';

function q(id: string, ticketId='ticket-01'): any { return { id, ticketId, questionNumber: 1, category:'B', text:'t', answers:[{id:'a1',text:'x',sortOrder:0},{id:'a2',text:'y',sortOrder:1}], correctAnswerIds:['a1'] }; }

describe('pickQuestions', () => {
  it('prioritizes mistakes over new', () => {
    const qs = [q('q1'), q('q2'), q('q3')];
    const m = new Map<string, any>([
      ['q1', { questionId:'q1', attempts:2, correct:0, incorrect:2, streak:0, lastAnswerCorrect:false, lastAnsweredAt:new Date().toISOString(), masteryLevel:'learning', dueAt: new Date(Date.now()-1000).toISOString(), difficulty: 8 }],
      ['q2', { questionId:'q2', attempts:0, correct:0, incorrect:0, streak:0, lastAnswerCorrect:null, lastAnsweredAt:null, masteryLevel:'new', dueAt:null }],
    ]);
    const picked = pickQuestions(qs, m as any, { limit: 2 });
    expect(picked[0].id).toBe('q1');
  });
  it('does not loop single question', () => {
    const qs = [q('q1')];
    const picked = pickQuestions(qs, new Map(), { limit: 5 });
    expect(picked.length).toBe(1);
    expect(new Set(picked.map(p=>p.id)).size).toBe(1);
  });
  it('empty history works', () => {
    const qs = [q('q1'), q('q2')];
    const picked = pickQuestions(qs, new Map(), { limit: 2 });
    expect(picked.length).toBe(2);
  });
});
