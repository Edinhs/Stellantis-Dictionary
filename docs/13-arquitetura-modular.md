# Arquitetura Modular — Estrutura do Projeto

> Última atualização: 2026-07-14.
> Autoria: Engenharia Lead. Entrega de abertura da Fase 1 (tarefa `T06` do
> backlog `04-tasks.md`).
> Deriva de: SPEC `02-spec.md` (arquitetura geral e stack), SPEC
> `08-responsaveis-especialistas-spec.md` (§0 princípios de extensibilidade),
> SPEC `09-plataforma-comunitaria-cargos-spec.md` (cargos, `can()`, auditoria) e
> SPEC `11-comunidade-qa-spec.md` (Q&A).

Este documento define **como o código do projeto será organizado** para ser fácil
de manter e auditar. É a fonte da verdade da estrutura de pastas, das fronteiras
entre módulos e das regras de dependência, **antes** de frontend e backend
divergirem. Ainda é planejamento + esqueleto: nenhuma lógica de produção é
escrita aqui.

## 1. Decisão de estilo arquitetural

**Decisão recomendada (aguardando confirmação do CEO): Monólito Modular
(*modular monolith*) com módulos por feature e camadas internas
`rota → serviço → repositório`, tomando emprestada a disciplina de fronteiras do
estilo Portas & Adaptadores (*hexagonal*) para as dependências externas
(banco, LLM, e-mail).**

### 1.1 Por quê

- **Um único artefato deployável, mas modular por dentro.** Para uma equipe
  pequena e um MVP que roda via Docker Compose (SPEC `02` §5, requisito de
  portabilidade), microsserviços adicionam custo operacional sem benefício. O
  guia é começar monólito e manter a **modularidade interna** desde o início, de
  modo que uma extração futura seja possível se o negócio exigir (ver
  Referência R1 — Fowler, *MonolithFirst*).
- **Camadas isoladas já são requisito das SPECs.** A SPEC `08` §0.3 exige
  "dados → API de leitura → UI; a UI nunca lê o banco direto". Isso é exatamente
  o *Presentation–Domain–Data Layering* (R2 — Fowler). Traduzimos para o
  backend como `rota (HTTP) → serviço (regra de negócio) → repositório (acesso a
  dados)`.
- **Fronteiras explícitas contra dependências indesejadas.** O estilo
  Portas & Adaptadores (R3 — Cockburn) nos dá o vocabulário para isolar o que é
  volátil e "em aberto": o **provedor de LLM** (D5) e a **hospedagem/banco** (D6)
  entram como *adapters* atrás de *ports* (interfaces). Trocar Claude por OpenAI,
  ou Postgres local por gerenciado, não toca a regra de negócio (SPEC `02` §2,
  linha do `LlmProvider`).
- **Baixo acoplamento / alta coesão** (R4 — *Modular programming*): cada feature
  do produto é um módulo coeso; módulos só se falam por contratos, nunca
  importando o "interior" um do outro.

### 1.2 Princípios adotados (invariantes do projeto)

1. **Alta coesão por feature** — cada área de produto (dicionário, diretório,
   Q&A…) mora em um módulo próprio, com suas rotas, serviços e repositórios.
2. **Baixo acoplamento entre módulos** — um módulo **não importa o interior**
   de outro. A comunicação é por (a) contrato público do módulo ou (b) serviços
   de `core/shared`. Ver §7 (regras de dependência).
3. **Camadas isoladas** — `rota → serviço → repositório`. A rota não fala com o
   banco; o repositório não conhece HTTP; a UI nunca lê o banco (SPEC `08` §0.3).
4. **Autorização central** — toda decisão de acesso passa por
   `can(user, permission)` (SPEC `09` §2.1); nunca `if role == 'admin'`.
5. **Extensibilidade de primeira classe** (SPEC `08` §0) — elo por `slug`,
   `metadata jsonb` em toda tabela nova, `target_type` polimórfico para
   contribuições/revisões/auditoria (SPEC `09` §8).
6. **Config fora do código** — segredos e escolhas de ambiente vêm do ambiente,
   nunca hardcoded (R5 — *Twelve-Factor* III; SPEC `02` §3.6).
7. **Auditável por construção** — `audit_log`, logs estruturados, migrações
   versionadas e trilha `contributions`/`content_revisions` são parte da
   estrutura, não um adendo (ver §6).

### 1.3 Alternativas consideradas e descartadas (por ora)

| Alternativa | Por que não agora |
|---|---|
| **Microsserviços** | Custo operacional alto; equipe pequena; MVP em Docker Compose. Reavaliar só sob escala real (R1). |
| **Hexagonal "puro" em todo o código** | Cerimônia (ports/adapters para tudo) desacelera o MVP. Adotamos a disciplina **só nas fronteiras voláteis** (LLM, banco, e-mail). |
| **Camadas por tipo técnico no topo** (`/controllers`, `/services`, `/models` globais) | Espalha uma feature por várias pastas, dificultando manutenção/auditoria. Preferimos **feature-first**, com camadas **dentro** de cada módulo. |

## 2. Mapa de módulos

Cada módulo de backend é uma feature coesa. Os módulos transversais vivem em
`core` (infra) e `shared` (contratos/tipos comuns). Frontend e 3D são módulos
próprios (pacotes separados). Alinhamento com as features documentadas:

| Módulo | Responsabilidade | Fonte (SPEC) | Tabelas principais |
|---|---|---|---|
| `core` | Config, conexão de banco, logging estruturado, tratamento de erro, `audit_log`, e o resolvedor `can()`. Infra que todos usam. | `02` §3.6, `09` §2.1/§6.4 | `audit_log` |
| `shared` | Tipos, DTOs e contratos comuns (sem lógica de infra): tipos de `Contribution`, `ContentRevision`, `Permission`, envelope de resposta/erro. | `08` §0, `09` §8 | — (só contratos) |
| `auth` | Cadastro, login, JWT (access+refresh), hash de senha, refresh em cookie `httpOnly`. | `02` §3.1 | `users` (auth) |
| `users` | Perfil, cargos (`user`/`coordinator`/`admin`), `role_permissions`, regras de atribuição de cargo (anti-escalonamento). Provê os dados que `can()` resolve. | `09` §2/§3/§6.1 | `users.role`, `role_permissions` |
| `dictionary` | CRUD de termos, `slug`, categorias, sinônimos, busca textual. Fonte única da verdade por `slug`. | `02` §3.2 | `terms` |
| `workflows` | Fluxos de trabalho (espelha `terms`), `steps jsonb`, `related_terms[]`. | `09` §5 | `workflows` |
| `contributions` | Fluxo propor-e-aprovar (`pending→approved/rejected/withdrawn`), fila de moderação e `content_revisions` (rollback). Transversal a `dictionary`/`workflows`/`directory`. | `09` §4/§6.2/§6.3 | `contributions`, `content_revisions` |
| `directory` | "Quem procurar": setores, pessoas, responsáveis, especialistas por `term_slug`. Dados pessoais (LGPD). | `07`/`08` | `sectors`, `people`, `sector_owners`, `component_specialists` |
| `community-qa` | Q&A: perguntas, respostas, comentários, votos, tags, reports; moderação leve. | `10`/`11` | `questions`, `answers`, `qa_comments`, `qa_votes`, `tags`, `question_tags`, `qa_reports` |
| `rag` | Chat RAG: embeddings, chunking, busca por similaridade, orquestração de prompt com citação, guardrails. **Adapter de LLM** (port `LlmProvider`). | `02` §3.3/§3.4 | `documents`, `document_chunks`, `conversations`, `messages` |
| `cockpit-3d` (backend) | Config/seed de hotspots (`cockpit_hotspots`) ligando pontos do modelo a `term_slug`. O `.glb` é asset do frontend. | `02` §3.5 | `cockpit_hotspots` |
| `frontend` (SPA) | Telas: login/cadastro, dicionário, chat, admin, "Quem procurar", Comunidade. Consome a API REST; nunca lê o banco. | `02` §2, `04-tasks` Fase 1d | — |
| `threed` (3D/WebGL) | Explorador 3D: render glTF/`.glb`, orbit controls, hotspots por `term_slug`, tooltip, fallback sem WebGL (image-map). | `02` §3.5, `05` | — |

Notas de coesão:
- `contributions` é um módulo **transversal de conteúdo**: as áreas
  `dictionary`, `workflows` e `directory` submetem propostas a ele usando
  `target_type` polimórfico (SPEC `09` §8), sem cada uma reinventar histórico.
- `community-qa` usa moderação **reativa** (não passa por `contributions` no
  caminho normal), mas **reusa** `content_revisions` e `audit_log` (SPEC `11`
  §3). Isso é uma dependência de `community-qa → core`, não o contrário.
- `directory` e `community-qa` **ligam por `term_slug` a `dictionary`** sem
  importar seu código: usam o contrato de leitura publicado pelo módulo
  (single-source-of-truth por `slug`).

## 3. Layout de pastas proposto

Monorepo simples. `backend/` e `frontend/` são pacotes independentes; `db/`,
`seeds/`, `tests/`, `docker/` e `docs/` são compartilhados. O 3D é um sub-pacote
do frontend (roda no navegador).

```
Stellantis-Dictionary/
├── README.md
├── docs/                          # documentação (este doc é o 13)
├── prototypes/                    # protótipos HTML da Fase 0.5 (já existe)
├── docker/                        # infra local (delegado ao devops-lead)
│   ├── docker-compose.yml         # app + Postgres/pgvector
│   └── postgres/                  # init/extensões (pgvector)
├── .env.example                   # todas as variáveis, SEM valores secretos
├── db/
│   ├── migrations/                # migrações versionadas NNNN-descricao.sql
│   │   └── 0000-init.sql          # placeholder (extensão pgvector, etc.)
│   └── README.md                  # convenção de migração (§6.3)
├── seeds/                         # dados de sementes versionados
│   ├── role_permissions.json      # matriz de permissões por cargo (SPEC 09)
│   ├── diretorio.json             # setores/pessoas/especialistas (SPEC 08)
│   └── cockpit_hotspots.json      # hotspots → term_slug (SPEC 02 §3.5)
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts               # bootstrap: monta core + registra módulos
│       ├── app.ts                 # composição do servidor HTTP (Fastify/Express)
│       ├── core/                  # infra transversal (§4.1)
│       │   ├── config/            # leitura de env (12-factor), tipada
│       │   ├── db/                # pool Postgres, helper de transação
│       │   ├── logging/           # logger estruturado (JSON) + request-id
│       │   ├── audit/             # gravação de audit_log (append-only)
│       │   ├── errors/            # classes de erro + handler central
│       │   ├── http/              # tipos de rota, envelope de resposta
│       │   └── authz/             # resolvedor central can(user, permission)
│       ├── shared/                # contratos/tipos comuns (§4.2)
│       │   └── contracts/         # Contribution, ContentRevision, Permission...
│       └── modules/               # um diretório por feature (§4.3)
│           ├── auth/
│           ├── users/
│           ├── dictionary/
│           ├── workflows/
│           ├── contributions/
│           ├── directory/
│           ├── community-qa/
│           ├── rag/
│           └── cockpit-3d/
├── frontend/
│   ├── package.json
│   └── src/
│       ├── pages/                 # login, dicionario, chat, admin, comunidade
│       ├── components/            # UI reutilizável
│       ├── api/                   # cliente da API REST (única porta p/ dados)
│       ├── styles/
│       └── three/                 # módulo 3D (Explorador do cockpit)
│           ├── viewer/            # render glTF/.glb, orbit controls
│           ├── hotspots/          # hotspots ligados a term_slug
│           └── fallback/          # image-map sem WebGL
├── tests/
│   ├── backend/                   # espelha modules/ (um dir de teste por módulo)
│   └── frontend/
└── .github/workflows/             # CI: lint, testes, build (delegado ao devops)
```

### 3.1 Anatomia de um módulo de backend

Cada módulo em `backend/src/modules/<modulo>/` expõe **camadas isoladas** e um
único ponto de entrada público:

```
modules/dictionary/
├── index.ts            # CONTRATO PÚBLICO do módulo: registra rotas +
│                       # exporta o serviço público (o que outros módulos podem usar)
├── dictionary.routes.ts    # camada ROTA: HTTP, validação de entrada, chama serviço
├── dictionary.service.ts   # camada SERVIÇO: regra de negócio, chama can(), repo
├── dictionary.repository.ts# camada REPOSITÓRIO: SQL/acesso a dados; sem HTTP
├── dictionary.schema.ts    # DTOs/validação (entrada e saída da API)
├── dictionary.types.ts     # tipos internos do módulo
└── README.md               # responsabilidade e fronteiras do módulo
```

Regra de exposição: **só `index.ts` é importável de fora**. `routes`, `service`,
`repository` internos não são importados por outros módulos — isso mantém o
baixo acoplamento (§7). Se `community-qa` precisa validar um `term_slug`, chama
o **serviço público** de `dictionary` via seu contrato, não o repositório.

### 3.2 Convenções de nomes

- Pastas de módulo em **kebab-case** (`community-qa`, `cockpit-3d`).
- Arquivos em `<modulo>.<camada>.ts` (`users.service.ts`).
- Identificadores técnicos de dados/permissões em inglês (`term_slug`,
  `dictionary.approve`); rótulos de UI em português (SPEC `09` §2).
- Migrações: `NNNN-descricao-em-kebab.sql`, número sequencial de 4 dígitos,
  **nunca reutilizado** (§6.3).
- Permissões nomeadas seguem o padrão `<area>.<acao>` (`qa.moderate`,
  `role.assign`), resolvidas por `role_permissions` (SPEC `09`/`11`).

## 4. Como cada módulo expõe rotas/serviços/repositórios

### 4.1 `core` (infra transversal)
Não é feature; é a fundação. Fornece a todos: `config` (env tipado), `db` (pool +
transação), `logging` (logger JSON com `request_id`), `audit` (gravar
`audit_log`), `errors` (handler central), `http` (envelope de resposta/erro) e
`authz` (`can()`). Nenhum módulo de feature reimplementa isso.

### 4.2 `shared` (contratos)
Só **tipos e contratos** — zero dependência de infra. Ex.: o tipo
`Permission` (união de strings nomeadas), o shape de `Contribution`/
`ContentRevision` (`target_type` polimórfico), o envelope padrão de resposta.
Backend e (quando útil) frontend referenciam os mesmos contratos, evitando
divergência do contrato de API.

### 4.3 Módulos de feature
Cada um segue §3.1. O `app.ts` do backend **compõe** o servidor registrando o
`index.ts` de cada módulo (injeção das dependências de `core`). Assim a lista de
módulos ativos é explícita e auditável num só lugar.

## 5. Contrato de API (princípio, detalhamento em doc próprio)

Fonte da verdade **antes** de frontend/backend divergirem (responsabilidade da
Engenharia Lead). Princípios que a estrutura já fixa:

- **REST/JSON**, prefixo `/api`, rotas por área (`/api/dicionario`,
  `/api/diretorio`, `/api/comunidade`, `/api/chat`…), coerente com SPEC `02`/`08`.
- **Envelope de resposta e de erro padronizados** (em `core/http` + `shared`),
  para o frontend tratar erros de forma uniforme.
- **Toda rota declara a permissão exigida** e a rota chama `can()` — a checagem
  não fica espalhada em `if`.
- O contrato completo (rotas, payloads, códigos) será detalhado em um documento
  de contrato de API dedicado quando as tarefas de backend de cada área
  começarem (T08+, T22, T36…). Este doc fixa **onde** ele vive e **como** é
  exposto, não congela cada endpoint.

## 6. Auditabilidade

Auditabilidade é requisito de projeto (mandato do CEO) e das SPECs. A estrutura a
garante em quatro pontos, todos **parte do esqueleto**:

### 6.1 `audit_log` (quem fez o quê, quando)
Tabela append-only (SPEC `09` §6.4). Vive em `core/audit`. Toda ação sensível
grava aqui: atribuição de cargo (SPEC `09` §3), aprovação/rejeição de
contribuição, exclusão, ações de moderação de Q&A (SPEC `11` §2). Registra
`actor_id`, `action`, `target_type/target_id`, `before/after`, `ip`. Como é
transversal, mora em `core` — qualquer módulo o chama, nenhum o duplica.

### 6.2 Logs estruturados (observabilidade)
`core/logging` emite **logs em JSON, um evento por linha, como *event stream***
(R5 — *Twelve-Factor* XI; R6 — OWASP Logging), com `request_id` de correlação.
Nunca loga segredos nem senhas/tokens (SPEC `02` §3.6). Distinção clara:
`audit_log` é registro de negócio/compliance (no banco); logs estruturados são
operacionais (stdout). Os dois se complementam.

### 6.3 Migrações versionadas
`db/migrations/NNNN-descricao.sql`, sequenciais, **nunca reescritas** depois de
aplicadas (mudança = nova migração). Isso dá uma trilha auditável da evolução do
schema e reprodutibilidade entre ambientes. `db/README.md` fixa a convenção.
Toda tabela nova nasce com `metadata jsonb` + `created_at`/`updated_at` (regra de
extensibilidade das SPECs `08`/`09`).

### 6.4 Trilha de contribuição e revisão (rollback)
O módulo `contributions` materializa `contributions` (propostas) e
`content_revisions` (snapshot completo por revisão, para rollback) — SPEC `09`
§6.2/§6.3. Responde "qual era o conteúdo e como volto"; o `audit_log` responde
"quem agiu e quando". Q&A reusa `content_revisions` para edições (SPEC `11` §3).
`target_type` polimórfico faz qualquer nova área de conteúdo entrar no mesmo
fluxo sem novas tabelas de histórico (SPEC `09` §8).

## 7. Regras de dependência (quem pode importar quem)

Direção de dependência permitida (setas = "pode importar"):

```
frontend/threed  ──▶  (API REST)  ──▶  backend

dentro do backend:
  modules/*  ──▶  core        (infra: config, db, logging, audit, authz)
  modules/*  ──▶  shared      (contratos/tipos)
  modules/*  ──▶  index.ts público de OUTRO módulo  (contrato, não interior)
  core       ──▶  (nada de modules; core não conhece features)
  shared     ──▶  (nada; só tipos, sem infra)
```

Regras duras:
1. **Nenhum módulo importa o interior de outro** (`service`/`repository`/`routes`
   alheios). Só o `index.ts` público — que é o contrato.
2. **`core` e `shared` não dependem de `modules`.** A infra não conhece as
   features; isso evita ciclos e mantém `core` reusável.
3. **A UI (frontend/threed) nunca acessa o banco** — só a API REST (SPEC `08`
   §0.3). O cliente HTTP fica isolado em `frontend/src/api`.
4. **Adapters externos atrás de ports.** LLM (`rag`) e futuros serviços
   (e-mail) são interfaces em `shared`/módulo, com implementação selecionada por
   `config` — sustenta D5 (provedor de LLM) e D6 (hospedagem) **configuráveis**.
5. **Autorização só via `can()`** (`core/authz`); nenhum módulo checa cargo
   direto (SPEC `09` §2.1).
6. **Ciclos são proibidos.** Se dois módulos precisam um do outro, o contrato
   comum sobe para `shared`, ou a lógica compartilhada vira serviço de `core`.

> Fase posterior: essas regras podem ser fixadas por lint (ex.: regra de
> `no-restricted-imports` / dependency-cruiser) na CI — a definir com o
> devops-lead.

## 8. Faseamento da construção (por módulos)

Coerente com o backlog `04-tasks.md` (Fase 1a→1h):
1. `core` + `shared` + `db/migrations` (fundação) — parte de `T06`/`T07`.
2. `auth` + `users` (`can()`, `role_permissions`) — `T08`/`T09`/`T27`/`T28`.
3. `dictionary` — `T10`/`T11`.
4. `contributions` (transversal) — `T30`–`T33`.
5. `directory` — `T20`–`T25`.
6. `community-qa` — `T34`–`T39`.
7. `rag` — `T12`–`T14`.
8. `cockpit-3d` + `threed` (frontend) — `T11a`–`T11d`.
9. `frontend` real — `T15`–`T17` (após protótipo aprovado, `T05`).

Cada módulo entregue vai para o QA Lead e, se toca dados/segurança, para o
Segurança Lead (regra de coordenação).

## 9. Referências da pesquisa

- **R1** — M. Fowler, *MonolithFirst* — martinfowler.com/bliki/MonolithFirst.html
  — "manter modularidade interna; extrair serviços só quando as fronteiras
  estiverem claras".
- **R2** — M. Fowler, *PresentationDomainDataLayering* —
  martinfowler.com/bliki/PresentationDomainDataLayering.html — separar
  apresentação, domínio e dados (base do `rota → serviço → repositório`).
- **R3** — A. Cockburn, *Hexagonal Architecture (Ports & Adapters)* —
  en.wikipedia.org/wiki/Hexagonal_architecture_(software) — componentes
  fracamente acoplados; adapters intercambiáveis (LLM/banco atrás de ports).
- **R4** — *Modular programming* —
  en.wikipedia.org/wiki/Modular_programming — separar em módulos coesos com
  interfaces; base de baixo acoplamento / alta coesão.
- **R5** — *The Twelve-Factor App* — 12factor.net/config (III, config no
  ambiente) e 12factor.net/logs (XI, logs como *event stream*).
- **R6** — OWASP, *Logging Cheat Sheet* —
  cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html — o que e como
  logar de forma auditável sem vazar dados sensíveis.

## 10. Perguntas em aberto

1. **Framework HTTP do backend**: Fastify ou Express? (SPEC `02` §2 recomenda um
   dos dois — decisão de detalhe da Engenharia; sugerimos **Fastify** por
   validação/serialização por schema e desempenho) — *aguardando confirmação*.
2. **Frontend**: HTML/JS puro (protótipo atual) ou framework (React) para a SPA
   real? (SPEC `02` §2 deixa em aberto) — *aguardando decisão do CEO na Fase 1d*.
3. **Monorepo com um só `package.json` vs. workspaces** (backend/frontend
   separados por workspace do npm/pnpm)? — *decisão de detalhe a alinhar com o
   devops-lead*.
4. ~~Onde vivem os segredos~~ — **Decisão**: em `.env` local (nunca commitado);
   `.env.example` versionado sem valores. Estratégia de secret manager depende de
   **D6 (hospedagem)** — *ainda em aberto no PDR*.
5. **D5 (provedor de LLM)** e **D6 (hospedagem)** seguem em aberto no PDR `03`;
   a estrutura os trata como **configuráveis** (port/adapter + env), portanto não
   bloqueiam `T06`. Confirmar quando o CEO decidir.
