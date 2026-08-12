# TravelQuiz — Arquitetura & Plano de Desenvolvimento

> Web App híbrido/responsivo (PWA-ready) de recomendação de destinos de viagem por IA.
> Stack: **Angular 19 (Standalone Components + Signals + OnPush)** · **Tailwind CSS v4** · **Firebase (Auth, Firestore, Cloud Functions, Hosting)**.

---

## 1. Visão Geral

O app mapeia o perfil do viajante através de um quiz interativo de 6 passos e usa uma
Cloud Function com IA (Claude / GPT) para sugerir de 3 a 5 destinos personalizados.
Em seguida o usuário escolhe um dos 4 planos de serviço de planejamento, gerando um
lead no Firestore.

### Decisões técnicas (e por quê)

| Decisão | Motivo |
| --- | --- |
| Angular **19** (não 20+) | Node local é 20.17; Angular 20 exige Node ^20.19. Angular 19 já entrega Standalone, Signals, `@let`, e `provideExperimentalZonelessChangeDetection` se necessário. |
| Tailwind CSS **v4** (`@tailwindcss/postcss`) | Tokens de design via CSS variables (`@theme`), zero config JS, compatível com Angular 19. |
| **@angular/fire 19** | Wrapper oficial do Firebase para Angular com providers standalone e suporte a emuladores. |
| Testes: **Jasmine/Karma** (ChromeHeadless) | Padrão do Angular 19 — zero atrito de configuração; roda em CI com `--watch=false`. |
| Functions: **Node 20 + TypeScript + firebase-functions v6** | Runtime atual do Firebase; `onCall` v2 com App Check opcional. |
| PWA: **@angular/pwa** | Service worker + manifest desde a Etapa 1, facilitando empacotamento futuro (TWA/Capacitor). |

---

## 2. Mapeamento `/layout` → Rotas & Componentes

| Print | Rota | Componente (feature) | Elementos-chave do design |
| --- | --- | --- | --- |
| `layout/tela inicial.png` | `/` (Home) | `features/home/home.page.ts` | Hero com foto aérea de praia, badge "TravelQuiz", pill "1.200+ destinos disponíveis", título "Descubra o seu próximo **destino ideal**" (destaque verde-claro), chips ("Personalizado", "2 minutos", "200+ países"), CTA azul "Fazer o Quiz de Viagem", CTA secundário "Ver destinos em alta →", prova social (avatares + "48.000+ viajantes satisfeitos"). |
| `layout/quiz.png` | `/quiz` | `features/quiz/quiz.page.ts` + `quiz-step.component.ts` | Header "Passo 1 de 6" + porcentagem (17%), barra de progresso teal + dots, card da pergunta com emoji, grid 2×2 de opções (card branco, emoji, título, subtítulo cinza), botões "Avançar →" (desabilitado até selecionar) e "← Voltar". |
| `layout/resultado quiz.png` | `/resultados` | `features/results/results.page.ts` + `destination-card.component.ts` | Header "Seus Destinos / Baseado no seu perfil de viajante", banner azul "Análise concluída! … 98% compatível", cards de destino: foto, badge "98% match", badge "#1 Recomendado" (âmbar), coração de favorito, nome + nota ★, localização, tags pill (preço, perfil, ambiente), CTA azul "Quero Planejar Esta Viagem ✈". |
| `layout/planos.png` | `/planos` | `features/plans/plans.page.ts` + `plan-card.component.ts` | Header "Escolha seu Plano", toggle "Pagamento por viagem", 4 cards: Gratuito (R$ 0), Essencial (R$ 149, badge "Popular"), Premium (R$ 349, badge "Mais vendido"), VIP/Concierge; lista de benefícios com check verde, CTA por card. |
| (todas) | shell | `layout/app-shell.component.ts` | Fundo teal-escuro gradiente, "moldura" branca arredondada, navegação superior em pills: Início 🏠 · Quiz 🎯 · Destinos · Planos 💎 (pill ativa preenchida). |

Rota adicional (sem print — segue o design system): `/login` → `features/auth/login.page.ts`.

### Paleta extraída dos prints (tokens Tailwind `@theme`)

| Token | Valor aprox. | Uso |
| --- | --- | --- |
| `--color-brand-900/800` | teal escuro `#0f5754` / `#116e63` | fundo externo, textos fortes |
| `--color-brand-500` | teal `#14b8a6` | barra de progresso, acentos |
| `--color-accent-500` | azul CTA `#2563eb`→`#3b82f6` | botões primários, banner resultado |
| `--color-lime-400` | verde-claro `#a3e635` | destaque "destino ideal", pills |
| `--color-amber-400` | âmbar | badge "#1 Recomendado" |
| `--color-surface` | branco / `#f8fafc` | cards, moldura |
| Tipografia | sans geométrica bold (Inter/Nunito Sans) | títulos pesados, corpo regular |

---

## 3. Estrutura do Projeto

```
travel-app/
├── .claude/skills/            # Skills do Claude Code (layout-inspection, pre-commit-tests, open-feature-pr)
├── docs/ARCHITECTURE.md       # este documento
├── layout/                    # prints de referência do design (fonte da verdade visual)
├── functions/                 # Firebase Cloud Functions (workspace npm próprio, TypeScript)
│   ├── src/
│   │   ├── index.ts           # exports das functions
│   │   ├── recommendations/   # (Etapa 4) generateRecommendations
│   │   └── shared/            # prompt builders, schemas, clients de IA
│   └── package.json
├── src/
│   ├── app/
│   │   ├── core/              # singletons: serviços, guards, config
│   │   │   ├── firebase/      # providers do @angular/fire + wiring de emuladores
│   │   │   ├── models/        # interfaces do domínio (espelham o Firestore)
│   │   │   └── services/      # AuthService, QuizService, RecommendationService, LeadService
│   │   ├── features/          # páginas lazy standalone (home, auth, quiz, results, plans)
│   │   ├── layout/            # app-shell, navegação
│   │   ├── shared/            # componentes/pipes/directives reutilizáveis
│   │   ├── app.config.ts      # providers globais (router, fire, SW)
│   │   └── app.routes.ts      # rotas lazy
│   ├── environments/          # config Firebase (placeholders + flag useEmulators)
│   └── styles.scss            # Tailwind v4 + @theme tokens
├── firebase.json              # hosting + emuladores (auth, firestore, functions)
├── .firebaserc
├── firestore.rules
└── firestore.indexes.json
```

---

## 4. Modelo de Dados — Firestore

```
users/{uid}
  displayName: string
  email: string | null
  photoURL: string | null
  isAnonymous: boolean
  createdAt: Timestamp

quizzes/{quizId}
  userId: string                       // uid do respondente
  answers: {
    budget:      'economico' | 'moderado' | 'confortavel' | 'luxo'
    company:     'sozinho' | 'casal' | 'familia' | 'amigos'
    environment: 'praia' | 'montanha' | 'cidade' | 'campo' | 'neve' | 'cidade-historica'
    travelStyle: 'relaxamento' | 'aventura' | 'gastronomia' | 'cultura'
    duration:    'fim-de-semana' | 'ate-7-dias' | 'ate-15-dias' | 'mais-de-15-dias'
    season:      'verao' | 'outono' | 'inverno' | 'primavera' | 'flexivel'
  }
  status: 'pending' | 'processing' | 'completed' | 'error'
  createdAt: Timestamp
  completedAt: Timestamp | null

quizzes/{quizId}/destinations/{destinationId}   // resultado da IA (subcoleção)
  rank: number                        // 1..5 (#1 Recomendado)
  matchScore: number                  // 0..100 (badge "98% match")
  name: string                        // "Maldivas"
  location: string                    // "Oceano Índico"
  country: string
  isInternational: boolean
  rating: number                      // 4.9
  priceTier: '$' | '$$' | '$$$'
  tags: string[]                      // ["Ideal para casais", "Praia", "Luxo"]
  summary: string
  highlights: string[]
  bestSeason: string
  imageQuery: string                  // termo p/ imagem (Unsplash/estático)

leads/{leadId}
  userId: string
  quizId: string
  destinationId: string | null        // destino escolhido (opcional)
  planId: 'gratuito' | 'essencial' | 'premium' | 'vip'
  planPriceBRL: number                // 0 | 149 | 349 | preço VIP
  contact: { name: string; email: string; whatsapp: string | null }
  status: 'novo' | 'em-contato' | 'convertido' | 'perdido'
  createdAt: Timestamp
```

**Regras de segurança (essência):** usuário lê/escreve apenas seus próprios
`users/{uid}`, `quizzes` e `leads` (`request.auth.uid == resource.data.userId`);
subcoleção `destinations` é somente-leitura para o dono (escrita apenas via Admin SDK
na Cloud Function).

---

## 5. Arquitetura da Cloud Function `generateRecommendations` (Etapa 4)

```
Client (RecommendationService)
  └─ httpsCallable('generateRecommendations', { quizId })
       └─ [Functions v2 onCall, região southamerica-east1]
            1. valida auth (uid) e ownership do quiz
            2. lê quizzes/{quizId} e monta prompt otimizado (pt-BR)
            3. chama IA — Anthropic Claude (claude-sonnet) ou OpenAI GPT-4o
               · chave via Secret Manager (defineSecret('ANTHROPIC_API_KEY'))
               · resposta forçada em JSON (schema validado com zod)
            4. grava 3–5 docs em quizzes/{quizId}/destinations (batch)
            5. atualiza quiz.status = 'completed'
            6. retorna { destinations } ao client
```

Falhas: `status='error'` no quiz + `HttpsError` tipado; retries idempotentes
(limpa subcoleção antes de regravar). Testes com `firebase-functions-test` + mock do client de IA.

---

## 6. Plano por Etapas (branches bloqueantes)

| Etapa | Branch | Escopo | Sai com |
| --- | --- | --- | --- |
| 1 ✅ (atual) | `feature/01-setup-arquitetura` | Workspace Angular+Tailwind+PWA, @angular/fire + emuladores, scaffolding Firebase (rules, functions workspace), modelos de dados, skills, docs, README | App compila, testes verdes, PR aberto |
| 2 | `feature/02-auth-and-layout` | App-shell fiel aos prints (moldura, nav pills), Home page, Firebase Auth (e-mail/senha, Google, anônimo), guards | Login funcional + Home fiel ao print |
| 3 | `feature/03-quiz-component` | Quiz de 6 passos com progress bar, Signals + Reactive Forms, persistência em `quizzes` | Fluxo do quiz completo com testes de integração |
| 4 | `feature/04-ai-destinations` | Cloud Function `generateRecommendations`, tela de resultados com cards de destino | Recomendações IA de ponta a ponta (emulador + mock) |
| 5 | `feature/05-plans-and-leads` | Tela dos 4 planos, captação de lead no Firestore | Funil completo quiz→destino→plano→lead |

**Fluxo Git:** nunca commitar na `main`; branch de feature a partir da `main`
atualizada; testes obrigatórios antes de cada commit; Conventional Commits;
PR detalhado → revisão humana → merge → próxima etapa.
