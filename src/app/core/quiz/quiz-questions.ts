import type { BudgetOption, QuizAnswers } from '../models';

import { estimateBudgetRange, formatBudgetRange } from './budget-estimates';

export interface QuizOption<K extends keyof QuizAnswers = keyof QuizAnswers> {
  value: QuizAnswers[K];
  emoji: string;
  label: string;
  description: string;
}

/** Pergunta já resolvida para o contexto atual (o que a UI renderiza). */
export interface ResolvedQuizQuestion<K extends keyof QuizAnswers = keyof QuizAnswers> {
  key: K;
  emoji: string;
  title: string;
  options: readonly QuizOption<K>[];
}

/**
 * Variante de uma pergunta. `when` decide se a variante se aplica ao contexto
 * (respostas anteriores); a última variante de cada nó não tem `when` e serve
 * de fallback. `options` pode ser uma função do contexto — usado quando o
 * conteúdo das opções é calculado (ex.: valores médios de orçamento).
 */
export interface QuizQuestionVariant<K extends keyof QuizAnswers = keyof QuizAnswers> {
  when?: (answers: Partial<QuizAnswers>) => boolean;
  emoji: string;
  title: string;
  options:
    | readonly QuizOption<K>[]
    | ((answers: Partial<QuizAnswers>) => readonly QuizOption<K>[]);
}

/** Nó do fluxo adaptativo: uma dimensão do perfil com suas variantes. */
export interface AdaptiveQuizQuestion<K extends keyof QuizAnswers = keyof QuizAnswers> {
  key: K;
  variants: readonly QuizQuestionVariant<K>[];
}

/** Resolve a variante da pergunta para o conjunto de respostas atual. */
export function resolveQuestion<K extends keyof QuizAnswers>(
  question: AdaptiveQuizQuestion<K>,
  answers: Partial<QuizAnswers>,
): ResolvedQuizQuestion<K> {
  const variant =
    question.variants.find((candidate) => candidate.when?.(answers)) ??
    question.variants[question.variants.length - 1];
  return {
    key: question.key,
    emoji: variant.emoji,
    title: variant.title,
    options: typeof variant.options === 'function' ? variant.options(answers) : variant.options,
  };
}

type Answers = Partial<QuizAnswers>;

const BUDGET_TIERS: ReadonlyArray<{ value: BudgetOption; emoji: string; label: string }> = [
  { value: 'economico', emoji: '🪙', label: 'Econômico' },
  { value: 'moderado', emoji: '💵', label: 'Moderado' },
  { value: 'confortavel', emoji: '💳', label: 'Confortável' },
  { value: 'luxo', emoji: '💎', label: 'Luxo' },
];

/**
 * Opções de orçamento com o custo total médio por pessoa, calculado a partir
 * da paisagem e do prazo escolhidos nos passos anteriores — um econômico de
 * fim de semana na praia é bem diferente de 15 dias na neve.
 */
function budgetOptions(answers: Answers): readonly QuizOption<'budget'>[] {
  return BUDGET_TIERS.map((tier) => ({
    ...tier,
    description: formatBudgetRange(
      estimateBudgetRange(tier.value, answers.environment, answers.duration),
    ),
  }));
}

/**
 * Fluxo adaptativo do quiz: a ordem das dimensões é fixa (o modelo de dados
 * do Firestore e o prompt da IA na Etapa 4 dependem das 6 respostas), mas o
 * conteúdo de cada pergunta — título, tom e opções — muda conforme as
 * respostas anteriores, formando uma árvore de decisão determinística.
 *
 * A primeira pergunta segue o print layout/quiz.png.
 */
export const QUIZ_FLOW: readonly AdaptiveQuizQuestion[] = [
  {
    key: 'environment',
    variants: [
      {
        emoji: '🌍',
        title: 'Qual tipo de paisagem te faz mais feliz?',
        options: [
          { value: 'praia', emoji: '🏖️', label: 'Praia', description: 'Areia branca e mar azul' },
          { value: 'montanha', emoji: '🏔️', label: 'Montanha', description: 'Trilhas e neve' },
          { value: 'cidade', emoji: '🌆', label: 'Cidade', description: 'Cultura e gastronomia' },
          { value: 'campo', emoji: '🌿', label: 'Campo', description: 'Natureza e paz' },
          { value: 'neve', emoji: '❄️', label: 'Neve', description: 'Frio e paisagens brancas' },
          {
            value: 'cidade-historica',
            emoji: '🏛️',
            label: 'Cidade Histórica',
            description: 'Ruas antigas e memória',
          },
        ],
      },
    ],
  },
  {
    key: 'travelStyle',
    variants: [
      {
        when: (a: Answers) => a.environment === 'praia',
        emoji: '🌊',
        title: 'O que não pode faltar na sua viagem pra praia?',
        options: [
          { value: 'relaxamento', emoji: '🏝️', label: 'Relaxar', description: 'Sol, areia e zero pressa' },
          { value: 'aventura', emoji: '🤿', label: 'Aventura', description: 'Surf, mergulho e trilhas costeiras' },
          { value: 'gastronomia', emoji: '🦐', label: 'Gastronomia', description: 'Frutos do mar à beira-mar' },
          { value: 'cultura', emoji: '⛵', label: 'Cultura', description: 'Vilas de pescadores e tradições' },
        ],
      },
      {
        when: (a: Answers) => a.environment === 'montanha' || a.environment === 'neve',
        emoji: '🏔️',
        title: 'Qual é a sua vibe entre as montanhas?',
        options: [
          { value: 'relaxamento', emoji: '🛖', label: 'Descanso', description: 'Chalé, lareira e vista' },
          { value: 'aventura', emoji: '🧗', label: 'Aventura', description: 'Trilhas, escalada e esqui' },
          { value: 'gastronomia', emoji: '🫕', label: 'Gastronomia', description: 'Fondue e sabores de altitude' },
          { value: 'cultura', emoji: '🏘️', label: 'Cultura', description: 'Vilarejos e tradições serranas' },
        ],
      },
      {
        when: (a: Answers) => a.environment === 'cidade' || a.environment === 'cidade-historica',
        emoji: '🏙️',
        title: 'O que você mais quer explorar na cidade?',
        options: [
          { value: 'cultura', emoji: '🖼️', label: 'Cultura', description: 'Museus, arquitetura e história' },
          { value: 'gastronomia', emoji: '🍷', label: 'Gastronomia', description: 'Restaurantes e mercados locais' },
          { value: 'relaxamento', emoji: '🏨', label: 'Relaxamento', description: 'Bons hotéis, parques e cafés' },
          { value: 'aventura', emoji: '🚲', label: 'Aventura urbana', description: 'Explorar cada canto a pé ou de bike' },
        ],
      },
      {
        emoji: '🧭',
        title: 'Qual estilo combina com a sua viagem?',
        options: [
          { value: 'relaxamento', emoji: '🧘', label: 'Relaxamento', description: 'Descansar de verdade' },
          { value: 'aventura', emoji: '🚵', label: 'Aventura', description: 'Adrenalina e natureza' },
          { value: 'gastronomia', emoji: '🍽️', label: 'Gastronomia', description: 'Comer bem é o roteiro' },
          { value: 'cultura', emoji: '🎭', label: 'Cultura', description: 'Museus, história e arte' },
        ],
      },
    ],
  },
  {
    key: 'company',
    variants: [
      {
        when: (a: Answers) => a.travelStyle === 'aventura',
        emoji: '🎒',
        title: 'Quem topa essa aventura com você?',
        options: [
          { value: 'sozinho', emoji: '🙋', label: 'Só eu', description: 'No meu ritmo, sem esperar ninguém' },
          { value: 'casal', emoji: '💑', label: 'Nós dois', description: 'Adrenalina a dois' },
          { value: 'familia', emoji: '👨‍👩‍👧‍👦', label: 'A família', description: 'Aventura para todas as idades' },
          { value: 'amigos', emoji: '🤝', label: 'A turma', description: 'História boa se conta em grupo' },
        ],
      },
      {
        when: (a: Answers) => a.travelStyle === 'relaxamento',
        emoji: '🌴',
        title: 'Com quem você quer desligar do mundo?',
        options: [
          { value: 'sozinho', emoji: '🙋', label: 'Sozinho(a)', description: 'Silêncio e liberdade total' },
          { value: 'casal', emoji: '💑', label: 'Em casal', description: 'Descanso a dois' },
          { value: 'familia', emoji: '👨‍👩‍👧‍👦', label: 'Com a família', description: 'Todo mundo merece essa pausa' },
          { value: 'amigos', emoji: '🎉', label: 'Com amigos', description: 'Relaxar em boa companhia' },
        ],
      },
      {
        when: (a: Answers) => a.travelStyle === 'gastronomia',
        emoji: '🍽️',
        title: 'Quem senta à mesa com você?',
        options: [
          { value: 'sozinho', emoji: '🙋', label: 'Só eu', description: 'Cada prato no meu tempo' },
          { value: 'casal', emoji: '🥂', label: 'Nós dois', description: 'Jantar a dois todo dia' },
          { value: 'familia', emoji: '👨‍👩‍👧‍👦', label: 'A família', description: 'Mesa cheia, memória boa' },
          { value: 'amigos', emoji: '🍻', label: 'A turma', description: 'Dividir tudo e pedir mais' },
        ],
      },
      {
        emoji: '🧳',
        title: 'Com quem você vai viajar?',
        options: [
          { value: 'sozinho', emoji: '🙋', label: 'Sozinho(a)', description: 'Liberdade total' },
          { value: 'casal', emoji: '💑', label: 'Em casal', description: 'Momentos a dois' },
          { value: 'familia', emoji: '👨‍👩‍👧‍👦', label: 'Família com filhos', description: 'Diversão para todos' },
          { value: 'amigos', emoji: '🎉', label: 'Com amigos', description: 'Boas histórias juntos' },
        ],
      },
    ],
  },
  {
    key: 'duration',
    variants: [
      {
        when: (a: Answers) => a.travelStyle === 'aventura',
        emoji: '⛺',
        title: 'Quanto tempo para essa expedição?',
        options: [
          { value: 'fim-de-semana', emoji: '⏱️', label: 'Fim de semana', description: 'Dose rápida de adrenalina' },
          { value: 'ate-7-dias', emoji: '🗓️', label: 'Até 7 dias', description: 'Dá para ir longe' },
          { value: 'ate-15-dias', emoji: '📆', label: 'Até 15 dias', description: 'Roteiro completo' },
          { value: 'mais-de-15-dias', emoji: '🌐', label: 'Mais de 15 dias', description: 'Modo explorador' },
        ],
      },
      {
        when: (a: Answers) => a.travelStyle === 'relaxamento',
        emoji: '🛌',
        title: 'Quanto tempo para desligar de verdade?',
        options: [
          { value: 'fim-de-semana', emoji: '⏱️', label: 'Fim de semana', description: 'Pausa expressa' },
          { value: 'ate-7-dias', emoji: '🗓️', label: 'Até 7 dias', description: 'Uma semana de paz' },
          { value: 'ate-15-dias', emoji: '📆', label: 'Até 15 dias', description: 'Recarregar por completo' },
          { value: 'mais-de-15-dias', emoji: '🌐', label: 'Mais de 15 dias', description: 'Férias de verdade' },
        ],
      },
      {
        emoji: '📅',
        title: 'Quanto tempo você tem para viajar?',
        options: [
          { value: 'fim-de-semana', emoji: '⏱️', label: 'Fim de semana', description: 'Escapada rápida' },
          { value: 'ate-7-dias', emoji: '🗓️', label: 'Até 7 dias', description: 'Uma semana boa' },
          { value: 'ate-15-dias', emoji: '📆', label: 'Até 15 dias', description: 'Sem pressa' },
          { value: 'mais-de-15-dias', emoji: '🌐', label: 'Mais de 15 dias', description: 'Imersão completa' },
        ],
      },
    ],
  },
  {
    key: 'budget',
    variants: [
      {
        when: (a: Answers) => a.company === 'casal',
        emoji: '💞',
        title: 'Qual é o orçamento de vocês dois?',
        options: budgetOptions,
      },
      {
        when: (a: Answers) => a.company === 'familia',
        emoji: '👨‍👩‍👧‍👦',
        title: 'Qual é o orçamento da família?',
        options: budgetOptions,
      },
      {
        when: (a: Answers) => a.company === 'amigos',
        emoji: '🤑',
        title: 'Qual é o orçamento da turma?',
        options: budgetOptions,
      },
      {
        emoji: '💰',
        title: 'Qual orçamento combina com essa viagem?',
        options: budgetOptions,
      },
    ],
  },
  {
    key: 'season',
    variants: [
      {
        when: (a: Answers) => a.environment === 'neve',
        emoji: '🌨️',
        title: 'Quando você quer encontrar a neve?',
        options: [
          { value: 'inverno', emoji: '⛷️', label: 'Inverno', description: 'Neve garantida, alta temporada' },
          { value: 'outono', emoji: '🍂', label: 'Outono', description: 'Início da temporada, menos filas' },
          { value: 'primavera', emoji: '🌼', label: 'Primavera', description: 'Fim de temporada, bons preços' },
          { value: 'flexivel', emoji: '🔀', label: 'Tanto faz', description: 'Vou quando tiver neve' },
        ],
      },
      {
        when: (a: Answers) => a.environment === 'praia',
        emoji: '🌞',
        title: 'Qual época combina com a sua praia?',
        options: [
          { value: 'verao', emoji: '🏖️', label: 'Verão', description: 'Alta estação, mar quente' },
          { value: 'primavera', emoji: '🌸', label: 'Primavera', description: 'Clima bom, menos gente' },
          { value: 'outono', emoji: '🍂', label: 'Outono', description: 'Sossego e bom preço' },
          { value: 'inverno', emoji: '🧣', label: 'Inverno', description: 'Praias vazias e preços baixos' },
          { value: 'flexivel', emoji: '🔀', label: 'Tanto faz', description: 'Tenho flexibilidade' },
        ],
      },
      {
        emoji: '☀️',
        title: 'Em qual época do ano você quer viajar?',
        options: [
          { value: 'verao', emoji: '🌞', label: 'Verão', description: 'Calor e dias longos' },
          { value: 'outono', emoji: '🍂', label: 'Outono', description: 'Clima ameno e cores' },
          { value: 'inverno', emoji: '🧣', label: 'Inverno', description: 'Frio e aconchego' },
          { value: 'primavera', emoji: '🌸', label: 'Primavera', description: 'Tudo florido' },
          { value: 'flexivel', emoji: '🔀', label: 'Tanto faz', description: 'Tenho flexibilidade' },
        ],
      },
    ],
  },
];
