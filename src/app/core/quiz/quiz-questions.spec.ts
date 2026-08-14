import { estimateBudgetRange, formatBudgetRange } from './budget-estimates';
import { QUIZ_FLOW, resolveQuestion } from './quiz-questions';

describe('QUIZ_FLOW (perguntas adaptativas)', () => {
  it('possui as 6 dimensões do perfil na ordem do fluxo (prazo antes do orçamento)', () => {
    expect(QUIZ_FLOW.map((q) => q.key)).toEqual([
      'environment',
      'travelStyle',
      'company',
      'duration',
      'budget',
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
        const options =
          typeof variant.options === 'function' ? variant.options({}) : variant.options;
        expect(options.length).withContext(context).toBeGreaterThanOrEqual(2);
        const values = options.map((option) => option.value);
        expect(new Set(values).size).withContext(context).toBe(values.length);
        for (const option of options) {
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

  it('o título do orçamento se adapta à companhia', () => {
    expect(resolveQuestion(QUIZ_FLOW[4], { company: 'casal' }).title).toContain('vocês dois');
    expect(resolveQuestion(QUIZ_FLOW[4], { company: 'familia' }).title).toContain('família');
    expect(resolveQuestion(QUIZ_FLOW[4], { company: 'amigos' }).title).toContain('turma');
  });

  it('as opções de orçamento mostram valores médios em R$ por pessoa', () => {
    const budget = resolveQuestion(QUIZ_FLOW[4], {
      environment: 'praia',
      duration: 'fim-de-semana',
    });
    expect(budget.options.length).toBe(4);
    for (const option of budget.options) {
      expect(option.description).withContext(option.value).toContain('R$');
      expect(option.description).withContext(option.value).toContain('por pessoa');
    }
  });

  it('os valores do orçamento crescem com o prazo e com o custo do destino', () => {
    const praiaFds = estimateBudgetRange('economico', 'praia', 'fim-de-semana');
    const praia15 = estimateBudgetRange('economico', 'praia', 'ate-15-dias');
    const neve15 = estimateBudgetRange('economico', 'neve', 'ate-15-dias');

    expect(praia15.min).toBeGreaterThan(praiaFds.min);
    expect(neve15.min).toBeGreaterThan(praia15.min);
    // econômico de 15 dias na neve custa mais que um fim de semana econômico inteiro na praia
    expect(neve15.min).toBeGreaterThan(praiaFds.max);
  });

  it('formata a faixa em BRL legível', () => {
    const texto = formatBudgetRange({ min: 450, max: 900 });
    expect(texto).toContain('450');
    expect(texto).toContain('900');
    expect(texto).toContain('por pessoa');
    expect(texto).toContain('R$');
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
