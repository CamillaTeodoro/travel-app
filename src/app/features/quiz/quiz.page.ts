import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { QuizService } from '../../core/quiz';
import type { QuizAnswers } from '../../core/models';
import { environment } from '../../../environments/environment';

/** Quiz passo a passo — referência visual: layout/quiz.png */
@Component({
  selector: 'app-quiz-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quiz.page.html',
})
export class QuizPage implements OnInit {
  protected readonly quiz = inject(QuizService);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.quiz.reset();
  }

  protected select(value: QuizAnswers[keyof QuizAnswers]): void {
    this.quiz.selectAnswer(value);
  }

  protected async advance(): Promise<void> {
    if (!this.quiz.canAdvance()) {
      return;
    }
    if (!this.quiz.isLastStep()) {
      this.quiz.next();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    try {
      const quizId = await this.quiz.submit();
      await this.router.navigate(['/resultados'], { queryParams: { quizId } });
    } catch {
      this.errorMessage.set(
        environment.useEmulators
          ? 'Não foi possível salvar o quiz. Os emuladores estão rodando? Execute "firebase emulators:start" em outro terminal.'
          : 'Não foi possível salvar o quiz agora. Tente novamente.',
      );
    } finally {
      this.submitting.set(false);
    }
  }

  protected async back(): Promise<void> {
    if (this.quiz.isFirstStep()) {
      await this.router.navigateByUrl('/');
      return;
    }
    this.quiz.previous();
  }
}
