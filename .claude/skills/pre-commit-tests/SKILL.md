---
name: pre-commit-tests
description: Rotina obrigatória de qualidade antes de qualquer commit no TravelQuiz — roda build, testes unitários/integração (app e functions) e valida Conventional Commits. Use antes de todo git commit.
---

# Rotina Pré-Commit (TravelQuiz)

Execute SEMPRE antes de `git commit`. Se qualquer passo falhar, **corrija antes de commitar** — nunca commite com testes quebrados.

## 1. Testes do app Angular

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

## 2. Build de produção (detecta erros de template/AOT que os testes não pegam)

```bash
npm run build
```

## 3. Testes das Cloud Functions (quando `functions/src` tiver mudanças)

```bash
npm --prefix functions run build && npm --prefix functions test --if-present
```

## 4. Padrão de commit (Conventional Commits)

- Formato: `tipo(escopo opcional): descrição no imperativo em pt-BR`
- Tipos permitidos: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`, `style`, `ci`
- Commits pequenos e granulares — um assunto por commit.
- Exemplos:
  - `feat(quiz): adiciona barra de progresso passo a passo`
  - `test(auth): cobre login anônimo com emulador`
  - `docs: atualiza mapeamento de layouts no README`

## 5. Regras de branch

- NUNCA commitar na `main`. Confirme com `git branch --show-current` que está em `feature/*`.
- Toda branch nova nasce da `main` atualizada (`git checkout main && git pull` antes).
