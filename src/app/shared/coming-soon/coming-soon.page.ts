import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Placeholder para rotas cujas telas chegam nas próximas etapas.
 * Recebe título/emoji/etapa via `data` da rota (withComponentInputBinding).
 */
@Component({
  selector: 'app-coming-soon-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="px-5 py-16 text-center">
      <p class="text-6xl" aria-hidden="true">{{ emoji() }}</p>
      <h1 class="mt-4 text-2xl font-extrabold text-ink">{{ title() }}</h1>
      <p class="mt-2 text-ink-muted">
        Esta tela chega na Etapa {{ stage() }}. Enquanto isso, que tal começar pela home?
      </p>
      <a
        routerLink="/"
        class="mt-8 inline-flex items-center justify-center min-h-12 px-6 rounded-card
               bg-accent-600 hover:bg-accent-700 text-white font-extrabold transition-colors
               focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
      >
        ← Voltar ao início
      </a>
    </section>
  `,
})
export class ComingSoonPage {
  readonly title = input.required<string>();
  readonly emoji = input<string>('🚧');
  readonly stage = input<number>(3);
}
