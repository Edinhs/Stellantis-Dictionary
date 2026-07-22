# Backlog de Tarefas — quebra do PDR em passos pequenos

Este backlog traduz o roadmap do PDR (`03-pdr.md`) em tarefas pequenas e
sequenciais, para irmos avançando aos poucos e revisando a cada entrega.
Marque `[x]` conforme formos concluindo.

> **Nota — governança por gates (`D18`).** As fases abaixo se encaixam nas 19 etapas
> do ciclo de vida `14-ciclo-de-vida-engenharia.md` (ver `14` §5 para o mapa
> fase→gate): Fase 0.5 = etapa 7 (Protótipo, dono `design-lead`, aprova o CEO em
> `T05`); Fases 1a–1h = etapas 8–12 (arquitetura/BD/dev/testes), com **QA e
> Segurança como gates transversais obrigatórios** (`14` §4); Fase 1e = gate de
> Segurança; Fases 2–4 alcançam as etapas 15–19 (deploy→evolução), **bloqueadas
> enquanto `D6` — hospedagem — estiver em aberto**. O projeto está na **Fase 0.5 /
> etapa 7** (grandfathering do protótipo já feito: não será refeito).

> **Reconciliação com o protótipo (2026-07-17).** O CEO entregou um protótipo
> funcional em `prototypes/portal-spa/` que **excede** o backlog original de
> protótipo (T01–T05). O escopo/UX real do protótipo está catalogado nos docs
> `20` (referência), `21` (RF), `22` (RNF) e `15` (casos de uso CU-09..CU-15). As
> tarefas T01–T04d abaixo ficam **superadas pelo protótipo entregue** (marcadas
> como cobertas); o que o protótipo trouxe **a mais** virou o bloco novo "Fase 0.6".
> Divergências que mudam decisão viram nota ao PDR `03` (ver §"Notas ao PDR").

## Fase 0.5 — Protótipo visual (superada pelo protótipo entregue)
> Objetivo: validar telas e fluxo antes de escrever código "de verdade".
- [x] T01 — Protótipo: ~~tela de login/cadastro~~ **NÃO no protótipo** (sem auth —
  vira RF [FUTURO], doc `21` RF-062). Perfil é apenas local.
- [x] T02 — Protótipo: dicionário (lista, busca, cadastro de termo) — coberto
  (doc `21` RF-001..RF-007).
- [x] T03 — Protótipo: chat — coberto como **StellantisGPT simulado** (doc `21`
  RF-020); citação de fontes/RAG real fica [FUTURO] (RF-068).
- [x] T04 — Protótipo: ~~painel admin~~ **NÃO no protótipo** (sem RBAC/moderação —
  [FUTURO], RF-063/RF-064).
- [x] T04b — Protótipo: Explorador 3D do cockpit — coberto e além (modelo `.glb`
  real do Grand Commander, órbita/zoom, wireframe, hotspots→verbete, fallback
  procedural; doc `21` RF-010..RF-015).
- [ ] T04c — Protótipo: página "Quem procurar" (diretório) + especialista no verbete
  e hotspot 3D. **Parcial:** há aba de Especialistas com "Contatar" (RF-041), mas
  **sem** ligação por `term_slug` nem no hotspot — pendência [FUTURO] (RF-069).
- [ ] T04d — Protótipo: aba "Comunidade" (Q&A). **NÃO no protótipo** — [FUTURO]
  (RF-067). Ref.: SPEC `11`.
- [x] T05 — Revisão/aprovação do protótipo com o CEO (aprovação formal do escopo dos
  docs `20`/`21`/`22`/`15` antes do código real). **Aprovado em 2026-07-19** ("Vamos
  avançar, o protótipo está bom por enquanto") — ver Gate 7 no log `27` §5.

## Fase 0.6 — Módulos do protótipo além do backlog original (a decidir escopo MVP)
> O protótipo trouxe módulos ricos ainda não previstos em T01–T05. Aqui ficam
> registrados como itens de escopo; **MVP vs. futuro é decisão do CEO** (perguntas
> em aberto abaixo). Rastreabilidade: doc `21` (RF) e `22` (RNF).
- [ ] T05a — Notebook de Engenharia (split-screen, autosave debounce 1200ms,
  ações IA Resumir/Melhorar/Extrair Siglas). RF-030..RF-034. **MVP?** — em aberto.
- [ ] T05b — Treinamento/Gamificação: flashcards 3D + criação com autocomplete,
  cursos→XP/badge/level-up, +50 XP por cocriação, níveis 1–4, insígnias, timeline.
  RF-035..RF-040, RF-055..RF-061. **MVP?** — em aberto (gamificação não está no
  roadmap do PDR `03`; ver nota ao PDR).
- [ ] T05c — Canais Oficiais (CRUD) e Kit Colaborador (links rápidos). RF-039/RF-040.
  **MVP?** — em aberto.
- [ ] T05d — Informações: Componentes Infotainment (filtro Tier-1), Projetos+versões,
  Diretrizes FaSTLAne 2030, Timeline, Veículos. RF-042..RF-049. **MVP?** — em aberto.
- [ ] T05e — Automações & IA (vitrine + ajuda no chat). RF-046/RF-046b. **MVP?** —
  em aberto.
- [ ] T05f — Organograma drill-down + modo gestão (CRUD) + mapa global. RF-044/RF-045.
  **Alvo:** restringir gestão a `coordinator`/`admin` (RBAC) — ver nota ao PDR.
- [ ] T05g — Decisão de reaproveitamento do frontend: reusar `app.js`/CSS do
  protótipo vs. reescrever modular na Fase 1d (doc `22` RNF-040/RNF-041). — em aberto.

## Fase 1a — Fundação do backend
> Depende de: decisão de hospedagem (D6) e provedor de LLM (D5) — podem ficar
> como "TBD configurável" para não travar o início.
- [ ] T06 — Estrutura do projeto (pastas backend/frontend, Docker Compose local)
- [ ] T07 — Banco de dados: schema inicial (users, terms) em Postgres + pgvector
- [ ] T08 — Autenticação: cadastro + login com JWT (hash de senha com argon2)
- [ ] T09 — Autorização: middleware de RBAC (papéis admin/user)

## Fase 1b — Dicionário
- [ ] T10 — API CRUD de termos (criar, listar, editar, remover) + campo `slug`
- [ ] T11 — Geração de embeddings para os termos cadastrados (pgvector)

## Fase 1b2 — Explorador 3D (código real)
> Depende de: T04b aprovado (protótipo) e T10 (termos com `slug`).
- [ ] T11a — Escolher/definir tecnologia 3D (three.js vs. model-viewer) e obter modelo placeholder (.glb, licença livre, comprimido com Draco)
- [ ] T11b — Modelo de dados/seed de hotspots (`cockpit_hotspots`) ligando pontos do modelo a `term_slug`
- [ ] T11c — Componente 3D no frontend: girar com mouse, hotspots com tooltip (nome + prévia), clique → navega para `/dicionario/{slug}`
- [ ] T11d — Fallback sem WebGL (imagem clicável / image-map apontando aos mesmos termos)

## Fase 1c — Chat RAG
- [ ] T12 — Adapter de LLM (`LlmProvider`) com implementação inicial (Claude ou OpenAI)
- [ ] T13 — Endpoint de chat: pergunta → busca por similaridade → prompt com contexto → resposta citando fontes
- [ ] T14 — Histórico de conversa por usuário (tabelas conversations/messages)

## Fase 1d — Frontend real (baseado no protótipo aprovado)
- [ ] T15 — Telas de login/cadastro integradas à API
- [ ] T16 — Tela do dicionário integrada à API
- [ ] T17 — Tela de chat integrada à API

## Fase 1f — Diretório de Responsáveis e Especialistas ("Quem procurar")
> Deriva da SPEC `08-responsaveis-especialistas-spec.md`. Depende de: T07/T10
> (termos com `slug`). Preenchimento dos dados é manual (JSON de sementes).
- [ ] T20 — Schema das tabelas `sectors`, `people`, `sector_owners`, `component_specialists` (cada uma com `metadata jsonb` — extensibilidade)
- [ ] T21 — JSON de sementes `seeds/diretorio.json` + carga na inicialização (validar `term_slug` contra `terms.slug`)
- [ ] T22 — API de leitura do diretório (setores, pessoa, especialistas por componente, busca) — só autenticado
- [ ] T23 — Integração no verbete: bloco "Especialista(s)" pelo `term_slug`
- [ ] T24 — Integração no hotspot 3D: link "Falar com o especialista" → card da pessoa
- [ ] T25 — Página "Quem procurar" (diretório + busca) integrada à API
- [ ] T26 — (Fase posterior) CRUD do diretório no painel admin + escrita na API

## Fase 1g — Plataforma comunitária, cargos e contribuição
> Deriva da SPEC `09-plataforma-comunitaria-cargos-spec.md`. Base de tudo que é
> comunitário. Depende de: T08/T09 (auth + RBAC base).
- [ ] T27 — Enum de cargos `user`/`coordinator`/`admin` em `users.role` + default `user` no cadastro
- [ ] T28 — Tabela `role_permissions` + resolvedor central `can(user, permission)` (autorização por permissão nomeada)
- [ ] T29 — Regras de atribuição de cargo: só `coordinator`/`admin`; coordenador não cria `admin`; ninguém muda o próprio cargo
- [ ] T30 — Entidade `workflows` (fluxo de trabalho) espelhando `terms` (+ `slug`, `steps jsonb`, `related_terms[]`)
- [ ] T31 — `contributions` (propor-e-aprovar) + fila de moderação (fluxo pending→approved/rejected/withdrawn)
- [ ] T32 — `content_revisions` (snapshot + rollback) para `terms`/`workflows`
- [ ] T33 — `audit_log` append-only (mudança de cargo, aprovação, exclusão) + soft delete em `terms`/`workflows`

## Fase 1h — Comunidade (Q&A)
> Deriva da SPEC `11-comunidade-qa-spec.md`. Depende de: T27/T28 (cargos +
> permissões) e T10 (termos com `slug`). Moderação leve (reativa).
- [ ] T34 — Schema Q&A: `questions`, `answers`, `qa_comments`, `qa_votes`, `tags`, `question_tags`, `qa_reports` (cada tabela nova com `metadata jsonb`)
- [ ] T35 — Permissões `qa.*` em `role_permissions` + checagem via `can()`
- [ ] T36 — API Q&A: perguntar/responder/comentar/votar/aceitar + listagem/ordenação/filtros
- [ ] T37 — Aba "Comunidade": lista, fluxo de perguntar (com anti-duplicata), detalhe da pergunta
- [ ] T38 — Tags ligadas a `term_slug`: bloco "Perguntas da comunidade" no verbete + especialistas na pergunta (reuso da API de `08`)
- [ ] T39 — Moderação: `qa_reports`, fechar/reabrir/duplicata, soft-delete, auto-ocultar por N reports, rate-limit; edições versionadas em `content_revisions`
- [ ] T40 — (Fase posterior) "Pergunte à IA primeiro"; respostas aceitas → RAG; promoção de resposta a conteúdo canônico via `contributions`

## Fase 1e — Segurança (transversal, revisão contínua)
- [ ] T18 — Checklist de segurança básico (rate limiting, sanitização de entrada, secrets via .env, HTTPS)
- [ ] T19 — Revisão de segurança de fechamento da Fase 1 (Segurança Agent)
  — inclui o diretório: dados pessoais só a autenticados, RBAC na escrita, LGPD

## Fases seguintes (backlog futuro, não detalhado ainda)
- [ ] Fase 2 — Ingestão de documentos (upload, chunking, embeddings automáticos)
- [ ] Fase 3 — Histórico avançado, busca melhorada, métricas de uso
- [ ] Fase 4 — MFA, auditoria completa, SSO, pentest leve

## Notas ao PDR `03` (divergências protótipo × decisões — não reescrever SPECs agora)
> Levantadas na reconciliação de 2026-07-17 (docs `20`/`21`/`22`/`15`). Cada uma pode
> virar uma decisão nova `Dn` no PDR, a critério do CEO/Produto Lead.
1. **Gamificação (XP/insígnias/level-up)** existe no protótipo (RF-055..RF-061) mas
   **não** consta no roadmap do PDR `03` §3 — decidir se é escopo de produto e em que
   fase (candidata a novo `Dn`).
2. **Módulos "extras"** (Notebook, Automações, Kit Colaborador, Diretrizes, Timeline,
   Veículos, Componentes, Projetos) não estavam no escopo MVP do PDR — confirmar
   quais entram no MVP real (T05a–T05e).
3. **Ausência de auth/RBAC/moderação no protótipo** (contraria D1/D12/D14) — confirmado
   como limitação intencional da fase; produto real segue o PDR (RF-062..RF-064).
4. **Chat simulado** (RF-020) vs. **RAG com fontes** (D2/D5, RF-068) — definir a fase
   de substituição.
5. **Modelo 3D:** protótipo usa `.glb` real (~19 MB) do Grand Commander; PDR `03` D9
   prevê **placeholder de licença livre** — confirmar asset/licença e meta de peso
   (Draco) para produção.
6. **Dados pessoais reais** no Organograma/Especialistas expostos no cliente (LGPD,
   doc `22` RNF-031) — recomendação: não publicar pessoas reais até a migração segura.

## Decisões que ainda bloqueiam algumas tarefas
- D5 (provedor de LLM): pode ficar em "modo mock/configurável" até decidirmos, para não travar T12/T13.
- D6 (hospedagem): não bloqueia o protótipo nem o desenvolvimento local via Docker Compose; só importa para deploy real.
