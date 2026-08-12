import type { Timestamp } from '@angular/fire/firestore';

/** Opções das perguntas do quiz — valores persistidos no Firestore. */
export type BudgetOption = 'economico' | 'moderado' | 'confortavel' | 'luxo';
export type CompanyOption = 'sozinho' | 'casal' | 'familia' | 'amigos';
export type EnvironmentOption =
  | 'praia'
  | 'montanha'
  | 'cidade'
  | 'campo'
  | 'neve'
  | 'cidade-historica';
export type TravelStyleOption = 'relaxamento' | 'aventura' | 'gastronomia' | 'cultura';
export type DurationOption =
  | 'fim-de-semana'
  | 'ate-7-dias'
  | 'ate-15-dias'
  | 'mais-de-15-dias';
export type SeasonOption = 'verao' | 'outono' | 'inverno' | 'primavera' | 'flexivel';

export interface QuizAnswers {
  budget: BudgetOption;
  company: CompanyOption;
  environment: EnvironmentOption;
  travelStyle: TravelStyleOption;
  duration: DurationOption;
  season: SeasonOption;
}

export type QuizStatus = 'pending' | 'processing' | 'completed' | 'error';

/** Documento `quizzes/{quizId}`. */
export interface Quiz {
  id?: string;
  userId: string;
  answers: QuizAnswers;
  status: QuizStatus;
  createdAt: Timestamp;
  completedAt: Timestamp | null;
}
