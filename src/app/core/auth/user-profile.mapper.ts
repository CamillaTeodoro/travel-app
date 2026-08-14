import type { User } from '@angular/fire/auth';

import type { UserProfile } from '../models';

/** Converte o usuário do Firebase Auth no documento `users/{uid}` (sem createdAt). */
export function toUserProfile(user: User): Omit<UserProfile, 'createdAt'> {
  return {
    uid: user.uid,
    displayName: user.displayName ?? null,
    email: user.email ?? null,
    photoURL: user.photoURL ?? null,
    isAnonymous: user.isAnonymous,
  };
}
