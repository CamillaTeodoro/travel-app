import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { User } from '@angular/fire/auth';

import { AuthService } from '../auth';
import { QuizService } from './quiz.service';
import { QuizRepository } from './quiz.repository';

describe('QuizService', () => {
  let service: QuizService;
  let repository: jasmine.SpyObj<QuizRepository>;
  let userSignal: ReturnType<typeof signal<User | null>>;

  beforeEach(() => {
    repository = jasmine.createSpyObj<QuizRepository>('QuizRepository', ['createQuiz']);
    userSignal = signal<User | null>({ uid: 'user-1' } as User);

    TestBed.configureTestingModule({
      providers: [
        { provide: QuizRepository, useValue: repository },
        { provide: AuthService, useValue: { user: userSignal } },
      ],
    });
    service = TestBed.inject(QuizService);
    service.reset();
  });

  function answerCurrent(): void {
    service.selectAnswer(service.currentQuestion().options[0].value);
  }

  it('inicia no passo 1 com 17% de progresso (como no print)', () => {
    expect(service.currentStep()).toBe(1);
    expect(service.totalSteps).toBe(6);
    expect(service.progressPercent()).toBe(17);
    expect(service.isFirstStep()).toBeTrue();
    expect(service.isLastStep()).toBeFalse();
  });

  it('não avança sem resposta selecionada', () => {
    expect(service.canAdvance()).toBeFalse();
    service.next();
    expect(service.currentStep()).toBe(1);
  });

  it('avança após selecionar e preserva resposta ao voltar', () => {
    answerCurrent();
    expect(service.canAdvance()).toBeTrue();
    service.next();
    expect(service.currentStep()).toBe(2);

    service.previous();
    expect(service.currentStep()).toBe(1);
    expect(service.currentAnswer()).toBe(service.currentQuestion().options[0].value);
  });

  it('não volta antes do passo 1', () => {
    service.previous();
    expect(service.currentStep()).toBe(1);
  });

  it('chega ao último passo com 100% e não passa dele', () => {
    for (let i = 0; i < service.totalSteps - 1; i++) {
      answerCurrent();
      service.next();
    }
    expect(service.currentStep()).toBe(6);
    expect(service.isLastStep()).toBeTrue();
    expect(service.progressPercent()).toBe(100);

    answerCurrent();
    service.next();
    expect(service.currentStep()).toBe(6);
  });

  it('reset limpa respostas e volta ao passo 1', () => {
    answerCurrent();
    service.next();
    service.reset();
    expect(service.currentStep()).toBe(1);
    expect(service.canAdvance()).toBeFalse();
  });

  it('submit persiste userId + 6 respostas e guarda o quizId', async () => {
    repository.createQuiz.and.resolveTo('quiz-123');
    for (let i = 0; i < service.totalSteps; i++) {
      answerCurrent();
      service.next();
    }

    const quizId = await service.submit();

    expect(quizId).toBe('quiz-123');
    expect(service.lastQuizId()).toBe('quiz-123');
    const [userId, answers] = repository.createQuiz.calls.mostRecent().args;
    expect(userId).toBe('user-1');
    expect(Object.keys(answers).sort()).toEqual([
      'budget',
      'company',
      'duration',
      'environment',
      'season',
      'travelStyle',
    ]);
  });

  it('submit falha com respostas incompletas', async () => {
    answerCurrent();
    await expectAsync(service.submit()).toBeRejected();
    expect(repository.createQuiz).not.toHaveBeenCalled();
  });

  it('submit falha sem usuário autenticado', async () => {
    userSignal.set(null);
    for (let i = 0; i < service.totalSteps; i++) {
      answerCurrent();
      service.next();
    }
    await expectAsync(service.submit()).toBeRejected();
    expect(repository.createQuiz).not.toHaveBeenCalled();
  });
});
