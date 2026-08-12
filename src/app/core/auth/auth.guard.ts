import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';

import { FirebaseAuthAdapter } from './firebase-auth.adapter';

/**
 * Bloqueia rotas para visitantes não autenticados, aguardando a primeira
 * resolução do estado de auth (evita redirecionar durante o carregamento).
 * Visitantes são levados a /login preservando a rota de origem em returnUrl.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const adapter = inject(FirebaseAuthAdapter);
  const router = inject(Router);

  return adapter.authState$.pipe(
    take(1),
    map((user) =>
      user
        ? true
        : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }),
    ),
  );
};
