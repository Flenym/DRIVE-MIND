import { QuestionImportSchema, validateQuestionIds } from '@/content/validation';
describe('validation', () => {
  it('rejects empty text', () => {
    const r = QuestionImportSchema.safeParse({ id:'q', ticketId:'t', questionNumber:1, category:'B', text:'', answers:[{id:'a1',text:'x'},{id:'a2',text:'y'}], correctAnswerIds:['a1'], topicIds:[] });
    expect(r.success).toBe(false);
  });
  it('detects bad correct id', () => {
    const q: any = { id:'q', answers:[{id:'a1',text:'x'},{id:'a2',text:'y'}], correctAnswerIds:['a3'] };
    expect(validateQuestionIds(q).length).toBeGreaterThan(0);
  });
});
