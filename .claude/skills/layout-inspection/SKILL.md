---
name: layout-inspection
description: Inspeção visual obrigatória dos prints da pasta /layout antes de construir ou alterar qualquer UI. Use sempre que for criar/editar componentes, páginas, estilos ou tokens de tema do TravelQuiz.
---

# Inspeção Visual de Layout (TravelQuiz)

Antes de escrever qualquer template/CSS de um componente ou página:

1. **Leia o print correspondente** com a ferramenta Read:
   - Home → `layout/tela inicial.png`
   - Quiz → `layout/quiz.png`
   - Resultados/Destinos → `layout/resultado quiz.png`
   - Planos → `layout/planos.png`
2. **Extraia e confira contra os tokens** definidos em `src/styles.scss` (`@theme`):
   cores, raios de borda, sombras, tipografia. Nunca hardcode cores — use os tokens
   (`brand`, `accent`, `lime`, `amber`, `surface`).
3. **Checklist de fidelidade** ao concluir a UI:
   - [ ] Estrutura (ordem/hierarquia dos blocos) igual ao print
   - [ ] Paleta: fundo teal gradiente, moldura branca arredondada, CTAs azuis
   - [ ] Navegação em pills no topo com estado ativo preenchido
   - [ ] Cards brancos com raio grande (~1rem+) e sombra suave
   - [ ] Pills/badges/chips com as mesmas cores do print
   - [ ] Emojis/ícones presentes onde o print mostra
   - [ ] Textos em pt-BR idênticos ou equivalentes aos do print
   - [ ] Responsivo: mobile-first (prints são mobile), com max-width central em desktop
   - [ ] a11y: contraste AA, `aria-*` em controles, foco visível, área de toque ≥ 44px
4. Se um elemento não existir nos prints (ex.: tela de login), **derive do design system**
   dos prints existentes e registre a decisão no PR.
