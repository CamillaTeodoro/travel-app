import { Injectable, inject } from '@angular/core';
import type { User } from '@angular/fire/auth';
import { Firestore, doc, getDoc, serverTimestamp, setDoc } from '@angular/fire/firestore';

import { toUserProfile } from './user-profile.mapper';

/**
 * Mantém o documento `users/{uid}` no Firestore.
 * Camada fina sobre o SDK — coberta por testes de integração com o emulador;
 * a lógica de mapeamento fica em user-profile.mapper.ts (testada em unidade).
 */
@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private readonly firestore = inject(Firestore);

  /** Cria o perfil no primeiro login; não sobrescreve perfis existentes. */
  async ensureProfile(user: User): Promise<void> {
    const ref = doc(this.firestore, 'users', user.uid);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) {
      await setDoc(ref, { ...toUserProfile(user), createdAt: serverTimestamp() });
    }
  }
}
