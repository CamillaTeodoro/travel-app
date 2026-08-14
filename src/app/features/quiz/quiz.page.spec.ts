import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { User } from '@angular/fire/auth';
import { Router, provideRouter } from '@angular/router';

import { AuthService } from '../../core/auth';
import { QuizRepository } from '../../core/quiz';
import { QuizPage } from './quiz.page';

/**
 * Testes de integração do fluxo do quiz: usam o QuizService real com
 * repositório e auth mockados, exercitando a UI de ponta a ponta.
 */
describe('QuizPage', () => {
  let fixture: ComponentFixture<QuizPage>;
  let element: HTMLElement;
  let repository: jasmine.SpyObj<QuizRepository>;
  let router: Router;

  beforeEach(async () => {
    repository = jasmine.createSpyObj<QuizRepository>('QuizRepository', ['createQuiz']);

    await TestBed.configureTestingModule({
      imports: [QuizPage],
      providers: [
        provideRouter([]),
        { provide: QuizRepository, useValue: repository },
        { provide: AuthService, useValue: { user: signal({ uid: 'user-1' } as User) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizPage);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  function mainButton(): HTMLButtonElement {
    return Array.from(element.querySelectorAll('button')).find((b) =>
      /Avançar|Ver meus destinos|Salvando/.test(b.textContent ?? ''),
    )!;
  }

  function selectFirstOption(): void {
    element.querySelector<HTMLButtonElement>('[role="radio"]')!.click();
    fixture.detectChanges();
  }

  function completeStep(): void {
    selectFirstOption();
    mainButton().click();
    fixture.detectChanges();
  }

  it('exibe o passo 1 com 13%, a pergunta do print e Avançar desabilitado', () => {
    expect(element.textContent).toContain('Passo 1 de 8');
    expect(element.textContent).toContain('13%');
    expect(element.textContent).toContain('Qual tipo de paisagem te faz mais feliz?');
    expect(mainButton().disabled).toBeTrue();
  });

  it('habilita Avançar ao selecionar uma opção e marca aria-checked', () => {
    selectFirstOption();
    const selected = element.querySelector('[role="radio"][aria-checked="true"]');
    expect(selected).toBeTruthy();
    expect(mainButton().disabled).toBeFalse();
  });

  it('avança para o passo 2 e volta preservando a seleção', () => {
    completeStep();
    expect(element.textContent).toContain('Passo 2 de 8');

    const voltar = Array.from(element.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('← Voltar'),
    )!;
    voltar.click();
    fixture.detectChanges();

    expect(element.textContent).toContain('Passo 1 de 8');
    expect(element.querySelector('[role="radio"][aria-checked="true"]')).toBeTruthy();
  });

  it('no passo 1, Voltar leva para a home', () => {
    const voltar = Array.from(element.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('← Voltar'),
    )!;
    voltar.click();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('completa os 8 passos, salva o quiz e navega para os resultados', async () => {
    repository.createQuiz.and.resolveTo('quiz-123');

    for (let step = 0; step < 7; step++) {
      completeStep();
    }
    expect(element.textContent).toContain('Passo 8 de 8');
    expect(mainButton().textContent).toContain('Ver meus destinos');

    completeStep();
    await fixture.whenStable();

    expect(repository.createQuiz).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['/resultados'], {
      queryParams: { quizId: 'quiz-123' },
    });
  });

  it('exibe erro amigável quando salvar falha', async () => {
    repository.createQuiz.and.rejectWith(new Error('offline'));

    for (let step = 0; step < 7; step++) {
      completeStep();
    }
    completeStep();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.textContent).toContain('Não foi possível salvar o quiz');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
