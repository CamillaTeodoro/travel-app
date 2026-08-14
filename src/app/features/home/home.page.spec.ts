import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HomePage } from './home.page';

describe('HomePage', () => {
  let fixture: ComponentFixture<HomePage>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('exibe o título com o destaque "destino ideal"', () => {
    const h1 = element.querySelector('h1');
    expect(h1?.textContent).toContain('Descubra o seu');
    expect(h1?.textContent).toContain('destino ideal');
  });

  it('exibe a descrição do quiz de 8 perguntas', () => {
    expect(element.textContent).toContain('Responda 8 perguntas rápidas');
  });

  it('exibe os 3 chips de vantagens dos prints', () => {
    const chips = element.querySelectorAll('ul li');
    const text = Array.from(chips)
      .map((chip) => chip.textContent)
      .join(' ');
    expect(chips.length).toBe(3);
    expect(text).toContain('Personalizado');
    expect(text).toContain('2 minutos');
    expect(text).toContain('200+ países');
  });

  it('CTA principal leva ao quiz', () => {
    const cta = Array.from(element.querySelectorAll('a')).find((a) =>
      a.textContent?.includes('Fazer o Quiz de Viagem'),
    );
    expect(cta?.getAttribute('href')).toBe('/quiz');
  });

  it('CTA secundário leva aos destinos', () => {
    const cta = Array.from(element.querySelectorAll('a')).find((a) =>
      a.textContent?.includes('Ver destinos em alta'),
    );
    expect(cta?.getAttribute('href')).toBe('/resultados');
  });

  it('exibe a prova social dos 48.000+ viajantes', () => {
    expect(element.textContent).toContain('48.000+');
    expect(element.textContent).toContain('viajantes satisfeitos');
  });
});
