# ✈️ TravelQuiz

> Descubra o seu próximo **destino ideal**: responda 6 perguntas rápidas e nossa IA
> encontra o destino perfeito para o seu perfil de viajante.

Web App híbrido/responsivo (PWA-ready) construído com **Angular 19** e backend
100% serverless no **Firebase** (Auth, Firestore, Cloud Functions e Hosting).

## Funcionalidades

- 🔐 **Autenticação & Onboarding** — login/cadastro com e-mail/senha, Google e acesso anônimo (Firebase Auth via `@angular/fire`).
- 🎯 **Quiz Interativo de Perfil** — 6 passos com barra de progresso (orçamento, companhia, ambiente, estilo, duração e época do ano).
- 🤖 **Recomendações por IA** — Cloud Function `generateRecommendations` gera de 3 a 5 destinos personalizados (nacionais e internacionais) em JSON e persiste no Firestore.
- 🏝️ **Apresentação de Destinos** — cards com % de match, ranking, nota, tags e CTA de planejamento.
- 💎 **4 Planos de Serviço** — Gratuito, Essencial, Premium e VIP/Concierge, com captação de lead no Firestore ao selecionar.

## Arquitetura

```
Angular 19 (Standalone + Signals + OnPush)  ──►  @angular/fire
   │                                                │
   ├── Tailwind CSS v4 (tokens @theme)              ├── Firebase Auth
   ├── PWA (@angular/pwa, ngsw)                     ├── Cloud Firestore (rules restritivas)
   └── Jasmine/Karma (ChromeHeadless)               └── Cloud Functions v2 (Node 20 + TS)
                                                         └── generateRecommendations (IA)
```

O plano completo — mapeamento de telas, modelo de dados do Firestore, arquitetura da
Cloud Function e decisões técnicas — está em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

### Pasta `/layout` — fonte da verdade visual

A pasta [`/layout`](layout) contém os prints que guiam TODA a UI. Antes de criar ou
alterar qualquer componente, o print correspondente deve ser inspecionado
(skill `layout-inspection` em `.claude/skills/`):

| Print | Rota | Feature |
| --- | --- | --- |
| `layout/tela inicial.png` | `/` | Home (hero, chips, CTA do quiz) |
| `layout/quiz.png` | `/quiz` | Quiz passo a passo com progresso |
| `layout/resultado quiz.png` | `/resultados` | Cards de destinos recomendados |
| `layout/planos.png` | `/planos` | 4 planos de serviço + lead |

A paleta dos prints está tokenizada em [`src/styles.scss`](src/styles.scss)
(`@theme`: `brand` teal, `accent` azul, `lime`, `amber`, `surface`) — componentes
nunca usam cores hardcoded.

## Requisitos

- **Node.js 20+** (projeto validado com 20.17)
- **npm 8+**
- **Firebase CLI 13+** — `npm i -g firebase-tools`
- **Java 11+** (exigido pelos Emuladores do Firebase)
- Google Chrome (execução dos testes com Karma)

## Instalação

```bash
git clone https://github.com/CamillaTeodoro/travel-app.git
cd travel-app
npm install
npm --prefix functions install   # dependências das Cloud Functions
```

### Configuração do Firebase

- **Desenvolvimento**: nada a configurar — `src/environments/environment.development.ts`
  usa o projeto demo `demo-travelquiz` e conecta automaticamente nos emuladores
  (`useEmulators: true`).
- **Produção**: preencha `src/environments/environment.ts` com as credenciais do seu
  projeto no [console do Firebase](https://console.firebase.google.com) e ajuste o
  ID em `.firebaserc`.

## Rodando localmente

### Passo a passo (primeira vez)

```bash
# 1. Instale as dependências do app (na raiz do projeto)
npm install

# 2. Instale as dependências das Cloud Functions
cd functions
npm install
cd ..

# 3. Suba o app
npm start
```

Pronto — abra **http://localhost:4200** no navegador. Nesta etapa você verá a
tela placeholder da Etapa 1; as telas reais (Home, Quiz, Destinos, Planos)
chegam nas próximas etapas.

### E os Emuladores do Firebase?

**Você NÃO precisa deles para ver o app rodando.** Eles só serão necessários
quando formos testar login, quiz salvo no banco e a função de IA (Etapas 2+).

Quando precisar, abra um **segundo terminal** (deixe o `npm start` rodando no
primeiro) e rode:

```bash
firebase emulators:start
```

| Serviço | Endereço |
| --- | --- |
| App Angular | http://localhost:4200 |
| Painel dos Emuladores | http://localhost:4000 |
| Auth / Firestore / Functions | portas 9099 / 8080 / 5001 (automático) |

O app em modo dev já está configurado para se conectar sozinho nos emuladores
(`useEmulators: true`) — não é preciso criar projeto no Firebase nem colocar
credenciais para desenvolver.

> ⚠️ Os emuladores exigem **Java 11+** instalado (verifique com `java -version`).

## Testes

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

- **Unitários**: serviços, utilitários e componentes (Jasmine/Karma).
- **Integração**: fluxo do quiz, mocks das Cloud Functions e renderização dos planos
  (adicionados a cada etapa junto da feature).
- Functions: `npm --prefix functions run build && npm --prefix functions test`.

⚠️ Política do projeto: **nenhum commit é feito com testes falhando** — a suíte
completa roda antes de todo commit (skill `pre-commit-tests`).

## Estratégia de Branches & PRs

A `main` é protegida — **nunca** recebe commits diretos. O desenvolvimento segue
etapas rígidas e bloqueantes, cada uma em sua branch criada a partir da `main`
atualizada:

| Etapa | Branch | Escopo |
| --- | --- | --- |
| 1 | `feature/01-setup-arquitetura` | Arquitetura, Firebase config, tooling |
| 2 | `feature/02-auth-and-layout` | Autenticação + layout base dos prints |
| 3 | `feature/03-quiz-component` | Quiz interativo |
| 4 | `feature/04-ai-destinations` | Cloud Function com IA + destinos |
| 5 | `feature/05-plans-and-leads` | Planos de serviço + leads |

Fluxo: feature branch → commits pequenos em
[Conventional Commits](https://www.conventionalcommits.org/pt-br/) (`feat:`, `fix:`,
`test:`, `docs:`, `refactor:`) → PR detalhado para `main` → revisão humana →
merge → próxima etapa.

## Contribuindo

1. Crie sua branch a partir da `main` atualizada: `git checkout -b feature/minha-feature main`.
2. Inspecione os prints de `/layout` antes de mexer em UI e use os tokens de `styles.scss`.
3. Siga Clean Code, SOLID, DRY e a11y; componentes standalone com Signals e `OnPush`.
4. Rode a suíte de testes e o build antes de cada commit.
5. Commits no padrão Conventional Commits, pequenos e granulares.
6. Abra um PR para `main` descrevendo o que foi feito, como testar e as decisões técnicas.
