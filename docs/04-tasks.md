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

## Fase 1e — Segurança (transversal, revisão contínua)
- [ ] T18 — Checklist de segurança básico (rate limiting, sanitização de entrada, secrets via .env, HTTPS)
- [ ] T19 — Revisão de segurança de fechamento da Fase 1 (Segurança Agent)

## Fases seguintes (backlog futuro, não detalhado ainda)
- [ ] Fase 2 — Ingestão de documentos (upload, chunking, embeddings automáticos)
- [ ] Fase 3 — Histórico avançado, busca melhorada, métricas de uso
- [ ] Fase 4 — MFA, auditoria completa, SSO, pentest leve

## Decisões que ainda bloqueiam algumas tarefas
- D5 (provedor de LLM): pode ficar em "modo mock/configurável" até decidirmos, para não travar T12/T13.
- D6 (hospedagem): não bloqueia o protótipo nem o desenvolvimento local via Docker Compose; só importa para deploy real.
