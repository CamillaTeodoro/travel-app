import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService, mapAuthError } from '../../core/auth';

type AuthMode = 'login' | 'signup';

/**
 * Login/Cadastro — sem print de referência: deriva do design system dos
 * prints de /layout (moldura branca, cards arredondados, CTA azul).
 * Oferece e-mail/senha, Google e acesso anônimo ("Continuar sem conta").
 */
@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.page.html',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  /** Preenchido pelo router (withComponentInputBinding) a partir do authGuard. */
  readonly returnUrl = input<string>('/');

  protected readonly mode = signal<AuthMode>('login');
  protected readonly busy = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected toggleMode(): void {
    this.mode.update((mode) => (mode === 'login' ? 'signup' : 'login'));
    this.errorMessage.set(null);
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    await this.authenticate(() =>
      this.mode() === 'login'
        ? this.auth.signInWithEmail(email, password)
        : this.auth.signUpWithEmail(email, password),
    );
  }

  protected async signInWithGoogle(): Promise<void> {
    await this.authenticate(() => this.auth.signInWithGoogle());
  }

  protected async continueAsGuest(): Promise<void> {
    await this.authenticate(() => this.auth.signInAnonymously());
  }

  private async authenticate(action: () => Promise<unknown>): Promise<void> {
    this.busy.set(true);
    this.errorMessage.set(null);
    try {
      await action();
      await this.router.navigateByUrl(this.returnUrl());
    } catch (error) {
      this.errorMessage.set(mapAuthError(error));
    } finally {
      this.busy.set(false);
    }
  }
}
