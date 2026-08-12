import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  UserCredential,
  authState,
  createUserWithEmailAndPassword,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  signInWithPopup,
  User,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

/**
 * Camada fina sobre o SDK do Firebase Auth (DIP): concentra as chamadas a
 * funções de módulo do SDK, permitindo que AuthService e guards sejam
 * testados com mocks simples deste adapter.
 */
@Injectable({ providedIn: 'root' })
export class FirebaseAuthAdapter {
  private readonly auth = inject(Auth);

  /** Emite o usuário atual (ou null) a cada mudança de sessão. */
  readonly authState$: Observable<User | null> = authState(this.auth);

  signInWithEmail(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  signUpWithEmail(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  signInWithGoogle(): Promise<UserCredential> {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  signInAnonymously(): Promise<UserCredential> {
    return firebaseSignInAnonymously(this.auth);
  }

  signOut(): Promise<void> {
    return firebaseSignOut(this.auth);
  }
}
