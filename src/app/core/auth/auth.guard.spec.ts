import { TestBed } from '@angular/core/testing';
import type { User } from '@angular/fire/auth';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, firstValueFrom, isObservable, of } from 'rxjs';

import { authGuard } from './auth.guard';
import { FirebaseAuthAdapter } from './firebase-auth.adapter';

describe('authGuard', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/quiz' } as RouterStateSnapshot;

  function setup(user: User | null) {
    TestBed.configureTestingModule({
      providers: [{ provide: FirebaseAuthAdapter, useValue: { authState$: of(user) } }],
    });
  }

  async function runGuard(): Promise<boolean | UrlTree> {
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    return isObservable(result)
      ? firstValueFrom(result as Observable<boolean | UrlTree>)
      : (result as boolean | UrlTree);
  }

  it('permite acesso quando há usuário autenticado', async () => {
    setup({ uid: 'user-1' } as User);
    expect(await runGuard()).toBeTrue();
  });

  it('redireciona visitantes para /login preservando returnUrl', async () => {
    setup(null);
    const result = await runGuard();
    const router = TestBed.inject(Router);

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/login?returnUrl=%2Fquiz');
  });
});
