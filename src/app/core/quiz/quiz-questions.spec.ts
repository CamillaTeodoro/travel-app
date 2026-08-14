import { QUIZ_QUESTIONS } from './quiz-questions';

describe('QUIZ_QUESTIONS', () => {
  it('possui exatamente as 6 perguntas do perfil de viajante', () => {
    expect(QUIZ_QUESTIONS.length).toBe(6);
    expect(QUIZ_QUESTIONS.map((q) => q.key)).toEqual([
      'environment',
      'budget',
      'company',
      'travelStyle',
      'duration',
      'season',
    ]);
  });

  it('a primeira pergunta segue o print layout/quiz.png', () => {
    const first = QUIZ_QUESTIONS[0];
    expect(first.title).toBe('Qual tipo de paisagem te faz mais feliz?');
    const labels = first.options.map((option) => option.label);
    expect(labels).toContain('Praia');
    expect(labels).toContain('Montanha');
    expect(labels).toContain('Cidade');
    expect(labels).toContain('Campo');
  });

  it('toda pergunta tem pelo menos 2 opções com valores únicos', () => {
    for (const question of QUIZ_QUESTIONS) {
      expect(question.options.length)
        .withContext(`pergunta ${question.key}`)
        .toBeGreaterThanOrEqual(2);
      const values = question.options.map((option) => option.value);
      expect(new Set(values).size).withContext(`pergunta ${question.key}`).toBe(values.length);
    }
  });

  it('toda opção tem emoji, label e descrição preenchidos', () => {
    for (const question of QUIZ_QUESTIONS) {
      for (const option of question.options) {
        expect(option.emoji).withContext(`${question.key}/${option.value}`).toBeTruthy();
        expect(option.label).withContext(`${question.key}/${option.value}`).toBeTruthy();
        expect(option.description).withContext(`${question.key}/${option.value}`).toBeTruthy();
      }
    }
  });
});
