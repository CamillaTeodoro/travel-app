import { QUIZ_FLOW, resolveQuestion } from './quiz-questions';

describe('QUIZ_FLOW (perguntas adaptativas)', () => {
  it('possui as 6 dimensões do perfil na ordem do fluxo', () => {
    expect(QUIZ_FLOW.map((q) => q.key)).toEqual([
      'environment',
      'travelStyle',
      'company',
      'budget',
      'duration',
      'season',
    ]);
  });

  it('toda pergunta tem uma variante fallback (sem when) na última posição', () => {
    for (const question of QUIZ_FLOW) {
      const fallback = question.variants[question.variants.length - 1];
      expect(fallback.when).withContext(`pergunta ${question.key}`).toBeUndefined();
    }
  });

  it('toda variante tem pelo menos 2 opções, com valores únicos e campos preenchidos', () => {
    for (const question of QUIZ_FLOW) {
      for (const [index, variant] of question.variants.entries()) {
        const context = `${question.key} variante ${index}`;
        expect(variant.options.length).withContext(context).toBeGreaterThanOrEqual(2);
        const values = variant.options.map((option) => option.value);
        expect(new Set(values).size).withContext(context).toBe(values.length);
        for (const option of variant.options) {
          expect(option.emoji).withContext(`${context}/${option.value}`).toBeTruthy();
          expect(option.label).withContext(`${context}/${option.value}`).toBeTruthy();
          expect(option.description).withContext(`${context}/${option.value}`).toBeTruthy();
        }
      }
    }
  });

  it('sem respostas, resolve para o fallback — primeira pergunta igual ao print', () => {
    const first = resolveQuestion(QUIZ_FLOW[0], {});
    expect(first.title).toBe('Qual tipo de paisagem te faz mais feliz?');
    const labels = first.options.map((option) => option.label);
    expect(labels).toEqual(
      jasmine.arrayContaining(['Praia', 'Montanha', 'Cidade', 'Campo']),
    );
  });

  it('o estilo de viagem se adapta à paisagem escolhida', () => {
    const praia = resolveQuestion(QUIZ_FLOW[1], { environment: 'praia' });
    expect(praia.title).toContain('praia');
    expect(praia.options.map((o) => o.description).join(' ')).toContain('Surf');

    const montanha = resolveQuestion(QUIZ_FLOW[1], { environment: 'montanha' });
    expect(montanha.title).toContain('montanhas');

    const cidade = resolveQuestion(QUIZ_FLOW[1], { environment: 'cidade-historica' });
    expect(cidade.title).toContain('cidade');
  });

  it('o orçamento se adapta à companhia', () => {
    expect(resolveQuestion(QUIZ_FLOW[3], { company: 'casal' }).title).toContain('vocês dois');
    expect(resolveQuestion(QUIZ_FLOW[3], { company: 'familia' }).title).toContain('família');
    expect(resolveQuestion(QUIZ_FLOW[3], { company: 'amigos' }).title).toContain('turma');
    expect(resolveQuestion(QUIZ_FLOW[3], { company: 'sozinho' }).title).toContain('solo');
  });

  it('quem escolheu neve não vê a opção verão na época do ano', () => {
    const season = resolveQuestion(QUIZ_FLOW[5], { environment: 'neve' });
    expect(season.options.map((o) => o.value)).not.toContain('verao');
    expect(season.options.map((o) => o.value)).toContain('inverno');
  });

  it('quem escolheu praia vê o verão como alta estação', () => {
    const season = resolveQuestion(QUIZ_FLOW[5], { environment: 'praia' });
    const verao = season.options.find((o) => o.value === 'verao');
    expect(verao?.description).toContain('Alta estação');
  });
});
