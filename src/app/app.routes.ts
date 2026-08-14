import { Routes } from '@angular/router';

import { authGuard } from './core/auth';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
    title: 'TravelQuiz — Descubra o seu próximo destino ideal',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPage),
    title: 'Entrar — TravelQuiz',
  },
  {
    path: 'quiz',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/coming-soon/coming-soon.page').then((m) => m.ComingSoonPage),
    data: { title: 'Quiz de Viagem', emoji: '🎯', stage: 3 },
    title: 'Quiz de Viagem — TravelQuiz',
  },
  {
    path: 'resultados',
    loadComponent: () =>
      import('./shared/coming-soon/coming-soon.page').then((m) => m.ComingSoonPage),
    data: { title: 'Seus Destinos', emoji: '🌴', stage: 4 },
    title: 'Seus Destinos — TravelQuiz',
  },
  {
    path: 'planos',
    loadComponent: () =>
      import('./shared/coming-soon/coming-soon.page').then((m) => m.ComingSoonPage),
    data: { title: 'Escolha seu Plano', emoji: '💎', stage: 5 },
    title: 'Planos — TravelQuiz',
  },
  { path: '**', redirectTo: '' },
];
