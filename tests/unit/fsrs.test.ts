import { nextState, isAnswerCorrect } from '@/learning/repetition/fsrs';

describe('isAnswerCorrect', () => {
  it('single correct', () => expect(isAnswerCorrect(['a'], ['a'])).toBe(true));
  it('wrong', () => expect(isAnswerCorrect(['a'], ['b'])).toBe(false));
  it('multi exact', () => expect(isAnswerCorrect(['a','b'], ['b','a'])).toBe(true));
  it('multi missing one', () => expect(isAnswerCorrect(['a','b'], ['a'])).toBe(false));
  it('extra answer', () => expect(isAnswerCorrect(['a'], ['a','b'])).toBe(false));
});

describe('nextState', () => {
  it('new question correct -> due in future', () => {
    const s: any = { questionId: 'q', attempts: 0, correct: 0, incorrect: 0, streak: 0, lastAnswerCorrect: null, lastAnsweredAt: null, masteryLevel: 'new', dueAt: null, stability: null, difficulty: null, intervalDays: 0 };
    const n = nextState(s, 'good', new Date('2025-01-01T00:00:00Z'));
    expect(n.attempts).toBe(1);
    expect(n.correct).toBe(1);
    expect(new Date(n.dueAt!).getTime()).toBeGreaterThan(new Date('2025-01-01T00:00:00Z').getTime());
  });
  it('again resets streak and due 10m', () => {
    const s: any = { questionId: 'q', attempts: 2, correct: 2, incorrect: 0, streak: 2, lastAnswerCorrect: true, lastAnsweredAt: new Date().toISOString(), masteryLevel: 'review', dueAt: new Date(Date.now()+86400000).toISOString(), stability: 3, difficulty: 5, intervalDays: 3 };
    const n = nextState(s, 'again', new Date('2025-01-01T00:00:00Z'));
    expect(n.streak).toBe(0);
    expect(n.masteryLevel).toBe('learning');
    expect(n.incorrect).toBe(1);
  });
  it('mastery progresses with streak', () => {
    let s: any = { questionId: 'q', attempts: 0, correct: 0, incorrect: 0, streak: 0, lastAnswerCorrect: null, lastAnsweredAt: null, masteryLevel: 'new', dueAt: null, stability: null, difficulty: null, intervalDays: 0 };
    for (let i=0;i<3;i++) { const n = nextState(s,'good'); s = { questionId:'q', ...n }; }
    expect(s.masteryLevel).toBe('review');
  });
});
