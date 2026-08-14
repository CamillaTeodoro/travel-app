import { Injectable, computed, inject, signal } from '@angular/core';

import { AuthService } from '../auth';
import type { QuizAnswers } from '../models';
import { QUIZ_QUESTIONS } from './quiz-questions';
import { QuizRepository } from './quiz.repository';

/**
 * Estado do quiz passo a passo (Signals) e submissão para o Firestore.
 * O componente de página é uma casca fina sobre este serviço.
 */
@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly repository = inject(QuizRepository);
  private readonly auth = inject(AuthService);

  readonly questions = QUIZ_QUESTIONS;

  private readonly stepIndex = signal(0);
  private readonly answers = signal<Partial<QuizAnswers>>({});

  /** Id do último quiz submetido — usado pela tela de resultados (Etapa 4). */
  readonly lastQuizId = signal<string | null>(null);

  readonly totalSteps = this.questions.length;
  readonly currentStep = computed(() => this.stepIndex() + 1);
  readonly currentQuestion = computed(() => this.questions[this.stepIndex()]);
  readonly isFirstStep = computed(() => this.stepIndex() === 0);
  readonly isLastStep = computed(() => this.stepIndex() === this.totalSteps - 1);

  /** Percentual exibido no badge (Passo 1 de 6 → 17%, como no print). */
  readonly progressPercent = computed(() =>
    Math.round((this.currentStep() / this.totalSteps) * 100),
  );

  /** Resposta selecionada da pergunta atual (ou undefined). */
  readonly currentAnswer = computed(() => this.answers()[this.currentQuestion().key]);

  readonly canAdvance = computed(() => this.currentAnswer() !== undefined);

  selectAnswer(value: QuizAnswers[keyof QuizAnswers]): void {
    const key = this.currentQuestion().key;
    this.answers.update((answers) => ({ ...answers, [key]: value }));
  }

  next(): void {
    if (this.canAdvance() && !this.isLastStep()) {
      this.stepIndex.update((index) => index + 1);
    }
  }

  previous(): void {
    if (!this.isFirstStep()) {
      this.stepIndex.update((index) => index - 1);
    }
  }

  reset(): void {
    this.stepIndex.set(0);
    this.answers.set({});
  }

  /**
   * Persiste o quiz respondido em `quizzes` e retorna o id do documento.
   * Requer todas as respostas preenchidas e usuário autenticado (garantido
   * pelo authGuard da rota).
   */
  async submit(): Promise<string> {
    const user = this.auth.user();
    if (!user) {
      throw new Error('Quiz submetido sem usuário autenticado.');
    }
    const answers = this.answers();
    if (this.questions.some((question) => answers[question.key] === undefined)) {
      throw new Error('Quiz submetido com respostas incompletas.');
    }

    const quizId = await this.repository.createQuiz(user.uid, answers as QuizAnswers);
    this.lastQuizId.set(quizId);
    return quizId;
  }
}
