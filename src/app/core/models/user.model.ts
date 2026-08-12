import type { Timestamp } from '@angular/fire/firestore';

/** Documento `users/{uid}` — perfil criado no primeiro login. */
export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  createdAt: Timestamp;
}
