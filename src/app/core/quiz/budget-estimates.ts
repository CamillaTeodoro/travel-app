import type {
  AccommodationOption,
  BudgetOption,
  DurationOption,
  EnvironmentOption,
  QuizAnswers,
  TransportOption,
} from '../models';

export interface BudgetRange {
  min: number;
  max: number;
}

/**
 * Custo diário médio por pessoa (BRL) de cada faixa de orçamento
 * (hospedagem padrão + alimentação + passeios, sem transporte).
 * Valores de referência do MVP — futuramente podem vir de Remote Config
 * ou serem calibrados pela própria IA.
 */
const TIER_DAILY_BRL: Record<BudgetOption, BudgetRange> = {
  economico: { min: 150, max: 300 },
  moderado: { min: 300, max: 600 },
  confortavel: { min: 600, max: 1200 },
  luxo: { min: 1200, max: 3000 },
};

/**
 * Fator de custo do tipo de destino — também proxy de distância para o
 * transporte (neve envolve equipamento, passes e, em geral, exterior).
 */
const ENVIRONMENT_FACTOR: Record<EnvironmentOption, number> = {
  campo: 0.9,
  praia: 1,
  'cidade-historica': 1,
  cidade: 1.1,
  montanha: 1.1,
  neve: 1.8,
};

/** Dias considerados para cada opção de prazo. */
const DURATION_DAYS: Record<DurationOption, number> = {
  'fim-de-semana': 3,
  'ate-7-dias': 7,
  'ate-15-dias': 15,
  'mais-de-15-dias': 21,
};

/** Fator do tipo de hospedagem sobre o custo diário. */
const ACCOMMODATION_FACTOR: Record<AccommodationOption, number> = {
  hostel: 0.65,
  apartamento: 0.85,
  casa: 1,
  hotel: 1.15,
};

/**
 * Custo de transporte por pessoa: parcela fixa (ida e volta) e, quando há
 * aluguel de carro, uma diária. Multiplicado pelo fator do destino como
 * proxy de distância.
 */
const TRANSPORT_COST: Record<TransportOption, { fixed: BudgetRange; perDay?: BudgetRange }> = {
  onibus: { fixed: { min: 150, max: 450 } },
  'carro-proprio': { fixed: { min: 200, max: 500 } },
  trem: { fixed: { min: 250, max: 700 } },
  aviao: { fixed: { min: 700, max: 1800 } },
  'carro-alugado': { fixed: { min: 150, max: 300 }, perDay: { min: 60, max: 120 } },
};

/** Arredonda para múltiplos de R$ 50 para exibir valores "redondos". */
function roundToFifty(value: number): number {
  return Math.round(value / 50) * 50;
}

/**
 * Estima o custo total da viagem por pessoa para uma faixa de orçamento,
 * a partir do contexto respondido nos passos anteriores: paisagem (fator de
 * custo/distância), prazo (dias), hospedagem (fator diário) e transporte
 * (parcela fixa + diárias de aluguel). Sem contexto, assume valores neutros.
 */
export function estimateBudgetRange(
  tier: BudgetOption,
  answers: Partial<QuizAnswers> = {},
): BudgetRange {
  const daily = TIER_DAILY_BRL[tier];
  const environmentFactor = answers.environment ? ENVIRONMENT_FACTOR[answers.environment] : 1;
  const accommodationFactor = answers.accommodation
    ? ACCOMMODATION_FACTOR[answers.accommodation]
    : 1;
  const days = answers.duration ? DURATION_DAYS[answers.duration] : 7;

  const stayFactor = environmentFactor * accommodationFactor * days;
  let min = daily.min * stayFactor;
  let max = daily.max * stayFactor;

  if (answers.transport) {
    const transport = TRANSPORT_COST[answers.transport];
    min += (transport.fixed.min + (transport.perDay?.min ?? 0) * days) * environmentFactor;
    max += (transport.fixed.max + (transport.perDay?.max ?? 0) * days) * environmentFactor;
  }

  return { min: roundToFifty(min), max: roundToFifty(max) };
}

const brlFormat = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

/** Ex.: "≈ R$ 450 – R$ 900 por pessoa, já com transporte". */
export function formatBudgetRange(range: BudgetRange, includesTransport = false): string {
  const base = `≈ ${brlFormat.format(range.min)} – ${brlFormat.format(range.max)} por pessoa`;
  return includesTransport ? `${base}, já com transporte` : base;
}
