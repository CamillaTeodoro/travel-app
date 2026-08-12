import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { User } from '@angular/fire/auth';
import { Router, provideRouter } from '@angular/router';

import { AuthService } from '../../core/auth';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let element: HTMLElement;
  let auth: jasmine.SpyObj<AuthService>;
  let router: Router;

  const fakeUser = { uid: 'user-1' } as User;

  beforeEach(async () => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', [
      'signInWithEmail',
      'signUpWithEmail',
      'signInWithGoogle',
      'signInAnonymously',
    ]);

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  function fillForm(email: string, password: string): void {
    const emailInput = element.querySelector<HTMLInputElement>('#email')!;
    const passwordInput = element.querySelector<HTMLInputElement>('#password')!;
    emailInput.value = email;
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = password;
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function submitForm(): void {
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  function clickButton(label: string): void {
    const button = Array.from(element.querySelectorAll('button')).find((b) =>
      b.textContent?.includes(label),
    );
    expect(button).withContext(`botão "${label}" deve existir`).toBeTruthy();
    button!.click();
    fixture.detectChanges();
  }

  it('não envia formulário inválido e exibe validações', () => {
    fillForm('nao-e-email', '123');
    submitForm();

    expect(auth.signInWithEmail).not.toHaveBeenCalled();
    expect(element.textContent).toContain('Informe um e-mail válido.');
    expect(element.textContent).toContain('pelo menos 6 caracteres');
  });

  it('faz login com e-mail/senha válidos e navega para a home', async () => {
    auth.signInWithEmail.and.resolveTo(fakeUser);

    fillForm('ana@exemplo.com', 'secreta1');
    submitForm();
    await fixture.whenStable();

    expect(auth.signInWithEmail).toHaveBeenCalledWith('ana@exemplo.com', 'secreta1');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('alterna para cadastro e usa signUpWithEmail', async () => {
    auth.signUpWithEmail.and.resolveTo(fakeUser);

    clickButton('Cadastre-se');
    expect(element.textContent).toContain('Crie a sua conta');

    fillForm('novo@exemplo.com', 'secreta1');
    submitForm();
    await fixture.whenStable();

    expect(auth.signUpWithEmail).toHaveBeenCalledWith('novo@exemplo.com', 'secreta1');
    expect(auth.signInWithEmail).not.toHaveBeenCalled();
  });

  it('login com Google navega ao concluir', async () => {
    auth.signInWithGoogle.and.resolveTo(fakeUser);

    clickButton('Continuar com Google');
    await fixture.whenStable();

    expect(auth.signInWithGoogle).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('acesso anônimo navega ao concluir', async () => {
    auth.signInAnonymously.and.resolveTo(fakeUser);

    clickButton('Continuar sem conta');
    await fixture.whenStable();

    expect(auth.signInAnonymously).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('respeita o returnUrl vindo do guard', async () => {
    auth.signInAnonymously.and.resolveTo(fakeUser);
    fixture.componentRef.setInput('returnUrl', '/quiz');
    fixture.detectChanges();

    clickButton('Continuar sem conta');
    await fixture.whenStable();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/quiz');
  });

  it('exibe mensagem amigável quando o login falha', async () => {
    auth.signInWithEmail.and.rejectWith({ code: 'auth/invalid-credential' });

    fillForm('ana@exemplo.com', 'errada1');
    submitForm();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.textContent).toContain('E-mail ou senha incorretos.');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
