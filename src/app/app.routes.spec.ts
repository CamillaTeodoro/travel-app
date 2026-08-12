import { TestBed } from '@angular/core/testing';
import type { User } from '@angular/fire/auth';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { routes } from './app.routes';
import { FirebaseAuthAdapter, UserProfileService } from './core/auth';

/** Testes de integração do roteamento + guard de autenticação. */
describe('app.routes (integração)', () => {
  function setup(user: User | null): void {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        { provide: FirebaseAuthAdapter, useValue: { authState$: of(user) } },
        { provide: UserProfileService, useValue: { ensureProfile: () => Promise.resolve() } },
      ],
    });
  }

  it('renderiza a Home na raiz', async () => {
    setup(null);
    const harness = await RouterTestingHarness.create('/');
    expect(harness.routeNativeElement?.textContent).toContain('destino ideal');
  });

  it('visitante deslogado é redirecionado de /quiz para /login com returnUrl', async () => {
    setup(null);
    await RouterTestingHarness.create('/quiz');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/login?returnUrl=%2Fquiz');
  });

  it('usuário autenticado acessa /quiz', async () => {
    setup({ uid: 'user-1' } as User);
    const harness = await RouterTestingHarness.create('/quiz');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/quiz');
    expect(harness.routeNativeElement?.textContent).toContain('Quiz de Viagem');
  });

  it('rotas desconhecidas voltam para a Home', async () => {
    setup(null);
    await RouterTestingHarness.create('/nao-existe');
    expect(TestBed.inject(Router).url).toBe('/');
  });
});
