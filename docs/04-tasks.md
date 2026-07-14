# Backlog de Tarefas — quebra do PDR em passos pequenos

Este backlog traduz o roadmap do PDR (`03-pdr.md`) em tarefas pequenas e
sequenciais, para irmos avançando aos poucos e revisando a cada entrega.
Marque `[x]` conforme formos concluindo.

## Fase 0.5 — Protótipo visual (agora)
> Objetivo: validar telas e fluxo antes de escrever código "de verdade".
- [ ] T01 — Protótipo HTML: tela de login/cadastro
- [ ] T02 — Protótipo HTML: tela do dicionário (lista, busca, cadastro de termo)
- [ ] T03 — Protótipo HTML: tela de chat (RAG) com exibição de fontes citadas
- [ ] T04 — Protótipo HTML: painel admin (gestão de usuários e termos)
- [ ] T04b — Protótipo HTML: página principal com Explorador 3D do cockpit
  (modelo placeholder, girar com o mouse, hotspots com nome+prévia, clique →
  vai para o verbete no dicionário). Referência visual: "Cockpit Introduction".
- [ ] T04c — Protótipo HTML: página "Quem procurar" (diretório) + bloco de
  especialista no verbete e no hotspot 3D, com dados de exemplo. Ref.: SPEC `08`.
- [ ] T04d — Protótipo HTML: aba "Comunidade" (Q&A) — lista de perguntas,
  perguntar, detalhe com respostas/votos/aceitar. Ref.: SPEC `11`.
- [ ] T05 — Revisão do protótipo com você (aprovação antes do código real)

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

## Decisões que ainda bloqueiam algumas tarefas
- D5 (provedor de LLM): pode ficar em "modo mock/configurável" até decidirmos, para não travar T12/T13.
- D6 (hospedagem): não bloqueia o protótipo nem o desenvolvimento local via Docker Compose; só importa para deploy real.
