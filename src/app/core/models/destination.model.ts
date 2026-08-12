/** Faixa de preço exibida nas tags dos cards (ex.: "$$$ · Premium"). */
export type PriceTier = '$' | '$$' | '$$$';

/**
 * Documento `quizzes/{quizId}/destinations/{destinationId}`.
 * Gerado exclusivamente pela Cloud Function `generateRecommendations`.
 */
export interface Destination {
  id?: string;
  rank: number; // 1..5 — rank 1 recebe o badge "#1 Recomendado"
  matchScore: number; // 0..100 — badge "98% match"
  name: string;
  location: string;
  country: string;
  isInternational: boolean;
  rating: number; // 0..5, uma casa decimal (ex.: 4.9)
  priceTier: PriceTier;
  tags: string[];
  summary: string;
  highlights: string[];
  bestSeason: string;
  imageQuery: string;
}
