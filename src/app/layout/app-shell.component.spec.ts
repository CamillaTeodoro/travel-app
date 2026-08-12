import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../core/auth';
import { AppShellComponent } from './app-shell.component';

describe('AppShellComponent', () => {
  let fixture: ComponentFixture<AppShellComponent>;
  let authMock: { isAuthenticated: ReturnType<typeof signal<boolean>>; signOut: jasmine.Spy };

  beforeEach(async () => {
    authMock = { isAuthenticated: signal(false), signOut: jasmine.createSpy('signOut').and.resolveTo() };

    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();
  });

  function nav(): HTMLElement {
    return fixture.nativeElement.querySelector('nav');
  }

  it('exibe as 4 pills de navegação dos prints com suas rotas', () => {
    const links = Array.from(nav().querySelectorAll('a'));
    const byLabel = (label: string) => links.find((a) => a.textContent?.includes(label));

    expect(byLabel('Início')?.getAttribute('href')).toBe('/');
    expect(byLabel('Quiz')?.getAttribute('href')).toBe('/quiz');
    expect(byLabel('Destinos')?.getAttribute('href')).toBe('/resultados');
    expect(byLabel('Planos')?.getAttribute('href')).toBe('/planos');
  });

  it('mostra "Entrar" quando deslogado', () => {
    expect(nav().textContent).toContain('Entrar');
    expect(nav().textContent).not.toContain('Sair');
  });

  it('mostra "Sair" quando autenticado e encerra a sessão ao clicar', () => {
    authMock.isAuthenticated.set(true);
    fixture.detectChanges();

    const sairButton = Array.from(nav().querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Sair'),
    );
    expect(sairButton).withContext('botão Sair deve existir').toBeTruthy();

    sairButton!.click();
    expect(authMock.signOut).toHaveBeenCalled();
  });

  it('possui um router-outlet para o conteúdo das páginas', () => {
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
  });
});
