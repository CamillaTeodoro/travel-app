export type PlanId = 'gratuito' | 'essencial' | 'premium' | 'vip';

/** Card de plano exibido em /planos (conteúdo estático no app). */
export interface Plan {
  id: PlanId;
  name: string;
  tagline: string; // ex.: "IA Básica", "IA + Curadoria"
  priceBRL: number | null; // null = sob consulta (VIP)
  priceNote: string; // ex.: "para sempre", "por viagem"
  badge: string | null; // ex.: "Popular", "Mais vendido"
  features: string[];
  ctaLabel: string; // ex.: "Começar Grátis", "Selecionar Plano"
  highlighted: boolean;
}
