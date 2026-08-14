import type { QuizAnswers } from '../models';

export interface QuizOption<K extends keyof QuizAnswers = keyof QuizAnswers> {
  value: QuizAnswers[K];
  emoji: string;
  label: string;
  description: string;
}

export interface QuizQuestion<K extends keyof QuizAnswers = keyof QuizAnswers> {
  key: K;
  emoji: string;
  title: string;
  options: readonly QuizOption<K>[];
}

/**
 * As 6 perguntas do quiz, na ordem de exibição.
 * A primeira segue o print layout/quiz.png; as demais derivam do mesmo padrão
 * visual (emoji + título + subtítulo por opção).
 */
export const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  {
    key: 'environment',
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
  {
    key: 'budget',
    emoji: '💰',
    title: 'Qual é o seu orçamento aproximado?',
    options: [
      { value: 'economico', emoji: '🪙', label: 'Econômico', description: 'Viajar gastando pouco' },
      { value: 'moderado', emoji: '💵', label: 'Moderado', description: 'Conforto sem exageros' },
      { value: 'confortavel', emoji: '💳', label: 'Confortável', description: 'Boas experiências' },
      { value: 'luxo', emoji: '💎', label: 'Luxo', description: 'O melhor de cada lugar' },
    ],
  },
  {
    key: 'company',
    emoji: '🧳',
    title: 'Com quem você vai viajar?',
    options: [
      { value: 'sozinho', emoji: '🙋', label: 'Sozinho(a)', description: 'Liberdade total' },
      { value: 'casal', emoji: '💑', label: 'Em casal', description: 'Momentos a dois' },
      { value: 'familia', emoji: '👨‍👩‍👧‍👦', label: 'Família com filhos', description: 'Diversão para todos' },
      { value: 'amigos', emoji: '🎉', label: 'Com amigos', description: 'Boas histórias juntos' },
    ],
  },
  {
    key: 'travelStyle',
    emoji: '🧭',
    title: 'Qual estilo combina com a sua viagem?',
    options: [
      { value: 'relaxamento', emoji: '🧘', label: 'Relaxamento', description: 'Descansar de verdade' },
      { value: 'aventura', emoji: '🚵', label: 'Aventura', description: 'Adrenalina e natureza' },
      { value: 'gastronomia', emoji: '🍽️', label: 'Gastronomia', description: 'Comer bem é o roteiro' },
      { value: 'cultura', emoji: '🎭', label: 'Cultura', description: 'Museus, história e arte' },
    ],
  },
  {
    key: 'duration',
    emoji: '📅',
    title: 'Quanto tempo você tem para viajar?',
    options: [
      { value: 'fim-de-semana', emoji: '⏱️', label: 'Fim de semana', description: 'Escapada rápida' },
      { value: 'ate-7-dias', emoji: '🗓️', label: 'Até 7 dias', description: 'Uma semana boa' },
      { value: 'ate-15-dias', emoji: '📆', label: 'Até 15 dias', description: 'Sem pressa' },
      { value: 'mais-de-15-dias', emoji: '🌐', label: 'Mais de 15 dias', description: 'Imersão completa' },
    ],
  },
  {
    key: 'season',
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
];
