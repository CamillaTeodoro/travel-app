import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService, mapAuthError } from '../../core/auth';
import { environment } from '../../../environments/environment';

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
      this.errorMessage.set(this.friendlyMessage(error));
    } finally {
      this.busy.set(false);
    }
  }

  /** Em dev, falha de rede quase sempre significa emuladores desligados. */
  private friendlyMessage(error: unknown): string {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code: unknown }).code)
        : '';
    if (code === 'auth/network-request-failed' && environment.useEmulators) {
      return 'Não foi possível conectar ao Firebase. Os emuladores estão rodando? Execute "firebase emulators:start" em outro terminal.';
    }
    return mapAuthError(error);
  }
}
