import type { User } from '@angular/fire/auth';

import { toUserProfile } from './user-profile.mapper';

describe('toUserProfile', () => {
  it('mapeia usuário completo do Google', () => {
    const user = {
      uid: 'user-1',
      displayName: 'Ana Viajante',
      email: 'ana@exemplo.com',
      photoURL: 'https://foto.exemplo/ana.png',
      isAnonymous: false,
    } as User;

    expect(toUserProfile(user)).toEqual({
      uid: 'user-1',
      displayName: 'Ana Viajante',
      email: 'ana@exemplo.com',
      photoURL: 'https://foto.exemplo/ana.png',
      isAnonymous: false,
    });
  });

  it('normaliza campos ausentes de usuário anônimo para null', () => {
    const user = {
      uid: 'anon-1',
      displayName: undefined,
      email: undefined,
      photoURL: undefined,
      isAnonymous: true,
    } as unknown as User;

    expect(toUserProfile(user)).toEqual({
      uid: 'anon-1',
      displayName: null,
      email: null,
      photoURL: null,
      isAnonymous: true,
    });
  });
});
