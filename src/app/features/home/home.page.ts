import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Tela inicial — referência visual: layout/tela inicial.png */
@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.page.html',
})
export class HomePage {
  protected readonly featureChips = [
    { emoji: '🎯', label: 'Personalizado' },
    { emoji: '⚡', label: '2 minutos' },
    { emoji: '🌍', label: '200+ países' },
  ];
}
