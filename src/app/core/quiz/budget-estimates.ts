import type { BudgetOption, DurationOption, EnvironmentOption } from '../models';

export interface BudgetRange {
  min: number;
  max: number;
}

/**
 * Custo diário médio por pessoa (BRL) de cada faixa de orçamento.
 * Valores de referência do MVP — futuramente podem vir de Remote Config
 * ou serem calibrados pela própria IA.
 */
const TIER_DAILY_BRL: Record<BudgetOption, BudgetRange> = {
  economico: { min: 150, max: 300 },
  moderado: { min: 300, max: 600 },
  confortavel: { min: 600, max: 1200 },
  luxo: { min: 1200, max: 3000 },
};

/** Fator de custo do tipo de destino (neve envolve equipamento, passes e, em geral, exterior). */
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

/** Arredonda para múltiplos de R$ 50 para exibir valores "redondos". */
function roundToFifty(value: number): number {
  return Math.round(value / 50) * 50;
}

/**
 * Estima o custo total da viagem por pessoa para uma faixa de orçamento,
 * dado o tipo de paisagem e o prazo escolhidos nos passos anteriores.
 * Sem contexto (não deveria ocorrer no fluxo), assume fator 1 e 7 dias.
 */
export function estimateBudgetRange(
  tier: BudgetOption,
  environment?: EnvironmentOption,
  duration?: DurationOption,
): BudgetRange {
  const daily = TIER_DAILY_BRL[tier];
  const factor = environment ? ENVIRONMENT_FACTOR[environment] : 1;
  const days = duration ? DURATION_DAYS[duration] : 7;
  return {
    min: roundToFifty(daily.min * factor * days),
    max: roundToFifty(daily.max * factor * days),
  };
}

const brlFormat = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

/** Ex.: "≈ R$ 450 – R$ 900 por pessoa". */
export function formatBudgetRange(range: BudgetRange): string {
  return `≈ ${brlFormat.format(range.min)} – ${brlFormat.format(range.max)} por pessoa`;
}
