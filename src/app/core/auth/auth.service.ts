import { Injectable, computed, inject } from '@angular/core';
import type { User, UserCredential } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';

import { FirebaseAuthAdapter } from './firebase-auth.adapter';
import { UserProfileService } from './user-profile.service';

/**
 * Fachada de autenticação da aplicação.
 * Estado exposto como Signals; todo login garante o perfil em `users/{uid}`.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly adapter = inject(FirebaseAuthAdapter);
  private readonly profiles = inject(UserProfileService);

  /** undefined = estado inicial ainda não resolvido; null = deslogado. */
  readonly user = toSignal<User | null | undefined>(this.adapter.authState$, {
    initialValue: undefined,
  });

  readonly isAuthenticated = computed(() => !!this.user());

  signInWithEmail(email: string, password: string): Promise<User> {
    return this.completeSignIn(this.adapter.signInWithEmail(email, password));
  }

  signUpWithEmail(email: string, password: string): Promise<User> {
    return this.completeSignIn(this.adapter.signUpWithEmail(email, password));
  }

  signInWithGoogle(): Promise<User> {
    return this.completeSignIn(this.adapter.signInWithGoogle());
  }

  signInAnonymously(): Promise<User> {
    return this.completeSignIn(this.adapter.signInAnonymously());
  }

  signOut(): Promise<void> {
    return this.adapter.signOut();
  }

  private async completeSignIn(credential: Promise<UserCredential>): Promise<User> {
    const { user } = await credential;
    await this.profiles.ensureProfile(user);
    return user;
  }
}
