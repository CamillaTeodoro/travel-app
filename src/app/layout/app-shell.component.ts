import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../core/auth';

interface NavItem {
  label: string;
  emoji: string;
  path: string;
  exact: boolean;
}

/**
 * Moldura branca arredondada sobre o fundo teal (conforme prints de /layout),
 * com navegação superior em pills e estado ativo preenchido.
 */
@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-dvh flex justify-center sm:items-center sm:py-8 sm:px-4">
      <div
        class="bg-surface w-full max-w-md flex flex-col overflow-hidden
               sm:rounded-[2rem] sm:shadow-2xl sm:min-h-[85dvh]"
      >
        <header class="shrink-0 px-3 pt-3 pb-2 bg-surface/95 backdrop-blur border-b border-slate-100">
          <nav aria-label="Navegação principal" class="flex items-center gap-1 overflow-x-auto">
            @for (item of navItems; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-accent-600 text-white shadow"
                [routerLinkActiveOptions]="{ exact: item.exact }"
                class="rounded-pill px-3 py-1.5 text-sm font-bold text-ink-muted whitespace-nowrap
                       min-h-9 inline-flex items-center gap-1 transition-colors
                       hover:text-brand-800 focus-visible:outline-2 focus-visible:outline-accent-600"
              >
                <span aria-hidden="true">{{ item.emoji }}</span>{{ item.label }}
              </a>
            }
            <span class="flex-1"></span>
            @if (auth.isAuthenticated()) {
              <button
                type="button"
                (click)="signOut()"
                class="rounded-pill px-3 py-1.5 text-sm font-bold text-ink-muted min-h-9
                       hover:text-brand-800 focus-visible:outline-2 focus-visible:outline-accent-600"
              >
                Sair
              </button>
            } @else {
              <a
                routerLink="/login"
                class="rounded-pill px-3 py-1.5 text-sm font-bold text-brand-700 min-h-9
                       inline-flex items-center bg-brand-50
                       hover:bg-brand-100 focus-visible:outline-2 focus-visible:outline-accent-600"
              >
                Entrar
              </a>
            }
          </nav>
        </header>

        <main class="flex-1 overflow-y-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AppShellComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly navItems: NavItem[] = [
    { label: 'Início', emoji: '🏠', path: '/', exact: true },
    { label: 'Quiz', emoji: '🎯', path: '/quiz', exact: false },
    { label: 'Destinos', emoji: '🌴', path: '/resultados', exact: false },
    { label: 'Planos', emoji: '💎', path: '/planos', exact: false },
  ];

  protected async signOut(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigateByUrl('/');
  }
}
