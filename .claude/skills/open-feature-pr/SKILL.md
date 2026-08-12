---
name: open-feature-pr
description: Abre o Pull Request padronizado de uma etapa do TravelQuiz para a main — push da branch, corpo do PR com template e parada bloqueante aguardando revisão. Use ao finalizar cada etapa (feature/0X-*).
---

# Abertura de PR por Etapa (TravelQuiz)

## Pré-condições
1. Rodar a skill `pre-commit-tests` — tudo verde.
2. Branch atual é `feature/0X-*` e todos os commits seguem Conventional Commits.

## Passos

1. Push da branch:
   ```bash
   git push -u origin (git branch --show-current)
   ```
2. Abrir o PR para `main`:
   - Com GitHub CLI: `gh pr create --base main --title "<titulo>" --body-file <arquivo>`
   - Sem `gh`: gerar o corpo do PR em arquivo, exibir para o usuário e fornecer o link
     `https://github.com/CamillaTeodoro/travel-app/compare/main...<branch>?expand=1`

## Template do corpo do PR

```markdown
## Etapa X — <nome da etapa>

### O que foi feito
- <lista objetiva de entregas>

### Como testar
1. `npm ci` (e `npm --prefix functions ci` se aplicável)
2. `firebase emulators:start` (quando aplicável)
3. `npm start` e validar <fluxo>
4. `npm test -- --watch=false --browsers=ChromeHeadless`

### Evidências de qualidade
- [ ] Testes unitários verdes (N specs)
- [ ] Build de produção ok
- [ ] Fidelidade visual conferida contra `/layout` (skill layout-inspection)

### Decisões técnicas
- <decisões e trade-offs relevantes>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

## Pós-PR (BLOQUEANTE)
- **PARAR imediatamente.** Não iniciar a próxima etapa até o PR ser revisado,
  aprovado e mergeado na `main` pelo usuário.
- Próxima etapa só começa com `git checkout main && git pull` seguido da criação
  da nova branch `feature/0(X+1)-*`.
