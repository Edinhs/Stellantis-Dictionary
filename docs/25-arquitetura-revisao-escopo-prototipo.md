# 25 — Arquitetura: Revisão de Escopo a partir do Protótipo

Status: **rascunho para aprovação do gate (Etapa 8)**.
> Última atualização: 2026-07-17.
> Autoria: Engenharia Lead (`eng-lead`), dono e aprovador da Etapa 8 do ciclo de
> vida `14-ciclo-de-vida-engenharia.md`.
> Deriva de e **estende** (não substitui) `13-arquitetura-modular.md` — artefato
> mestre da arquitetura. Onde este doc é silente, vale o `13`.
> Entradas: `20-prototipo-referencia.md` (inventário do protótipo),
> `21-requisitos-funcionais.md` / `22-requisitos-nao-funcionais.md` (RF/RNF),
> `24-parecer-seguranca-prototipo.md` (restrições de segurança/LGPD),
> PDR `03-pdr.md` (decisões `Dxx`, incl. `D5`/`D6` em aberto), SPECs `08`/`09`/`11`.

## 1. Por que esta revisão

O protótipo funcional do CEO (doc `20`) revelou **escopo funcional maior** do que
o mapa de módulos do doc `13` §2 previa. O `13` cobre `dictionary`, `workflows`,
`contributions`, `directory`, `community-qa`, `rag`, `cockpit-3d`, `auth`,
`users`. O protótipo adiciona sete famílias funcionais **sem cobertura
arquitetural explícita**: Treinamento/gamificação, Organograma + mapa global,
Projetos veiculares, Componentes de Infotainment, Automações, Kit Colaborador e
Notebook de Engenharia.

Este documento faz o que a DoD da Etapa 8 (doc `14` L112–118) exige para o
**produto real**:

1. **Confirma o estilo arquitetural** (§2).
2. **Encaixa os novos módulos** nas camadas e fronteiras, deixando MVP vs. futuro
   como pergunta ao Produto/CEO (§3, §11).
3. **Isola as decisões voláteis `D5`/`D6`** por port/adapter (§7).
4. **Incorpora as restrições de segurança do doc `24`** como invariantes
   transversais (§8).

**Princípio herdado (doc `20` §6, decisão do CEO):** o protótipo é a **fonte de
escopo/UX**; a **arquitetura-alvo continua a do doc `13`** (monólito modular
Node/TS + Postgres/pgvector + RAG + RBAC). O protótipo (vanilla + `localStorage`,
sem backend) **não** é referência de implementação.

## 2. Estilo arquitetural — confirmado

**Decisão (recomendo aprovar):** manter integralmente o estilo do doc `13` §1 —
**Monólito Modular** feature-first, camadas internas `rota → serviço →
repositório`, com a disciplina de **Portas & Adaptadores** apenas nas fronteiras
voláteis (LLM, banco, e-mail). O escopo maior **reforça** essa escolha em vez de
contestá-la:

- O protótipo concentra ~5,4k linhas num único `app.js` (doc `20` §2; RNF-040) —
  exatamente o antipadrão que a **alta coesão por feature** do `13` §1.2 evita. A
  modularização por feature é o remédio, não microsserviços.
- Nenhum dos módulos novos introduz requisito de escala/isolamento que justifique
  sair do monólito (doc `13` §1.3, R1 — *MonolithFirst*). Todos são CRUD de
  conteúdo + leitura, no mesmo perímetro transacional.
- Os invariantes do `13` §1.2 (camadas isoladas, `can()` central, extensibilidade
  por `slug`/`metadata jsonb`/`target_type`, config fora do código, auditável por
  construção) **absorvem** os módulos novos sem exceção — ver §3 a §5.

Portanto o estilo e as camadas **não mudam**. O que muda é o **mapa de módulos**
(doc `13` §2) e o **conjunto de `target_type`** do fluxo de contribuição (§5).

## 3. Encaixe dos novos módulos nas camadas

Cada família do protótipo vira um **módulo coeso** em
`backend/src/modules/<modulo>/` seguindo a anatomia do doc `13` §3.1
(`index.ts` público + `routes → service → repository` + `schema`/`types`), ou é
**absorvida por um módulo existente** quando a coesão manda. Regra de ouro
mantida: só o `index.ts` é importável de fora (doc `13` §3.1/§7).

### 3.1 Mapa de encaixe

| Família (protótipo, doc `20`) | Módulo backend proposto | Encaixe | RF (doc `21`) | Tabelas propostas (Etapa 9) |
|---|---|---|---|---|
| Treinamento — cursos/trilhas, flashcards | **`training`** (novo) | Módulo de feature. Cursos = catálogo compartilhado; flashcards = conteúdo **pessoal** derivado de `term_slug`. | RF-035..RF-038 | `courses` (`slug`), `course_completions`, `flashcards` |
| Kit Colaborador + Canais Oficiais | **`resources`** (novo) | Coleções de links curados; coeso como um módulo só. Cocriação → passa por `contributions`. | RF-039, RF-040 | `channels`, `kit_items` |
| Gamificação — XP, níveis, insígnias, timeline | **`gamification`** (novo, transversal) | **Listener** de eventos de domínio; concede XP/insígnias. **Nunca** alimenta `can()` (§4). | RF-056..RF-061, RF-058 | `xp_events` (append-only), `user_progress`, `user_badges` |
| Organograma (árvore drill-down + CRUD) + mapa global de polos | **`directory`** (estende) | Absorvido por `directory` — mesma natureza (pessoas/setores, dados LGPD). Não criar módulo isolado (evita duplicar tratamento de PII). | RF-044, RF-045, RF-045b | `org_nodes` (recursivo, `parent_id`), `sites` (polos/país) |
| Projetos veiculares | **`projects`** (novo) | Módulo de conteúdo; elo opcional a `terms`/`components` por `slug`. Cocriação → `contributions`. | RF-043 | `projects` (`slug`, `code`, `status`, `versions jsonb`) |
| Componentes de Infotainment (filtro Tier-1) | **`components`** (novo) | Conteúdo técnico; **liga a `dictionary` por `term_slug`** e a especialistas via `component_specialists` (já em `directory`, doc `13` §2). | RF-042 | `components` (`slug`, `supplier_tier1`, `term_slug`) |
| Automações & IA | **`automations`** (novo) | Vitrine de conteúdo; atalho "perguntar ao chat" reusa `rag`. Cocriação → `contributions`. | RF-046, RF-046b | `automations` (`slug`, `links jsonb`) |
| Notebook de Engenharia (nota + IA assistiva) | **`notebook`** (novo) | Conteúdo **privado por usuário**. Ações "Resumir/Melhorar/Extrair Siglas" chamam o LLM **via port `LlmProvider`** do `rag` (§7), nunca um provedor direto. | RF-030..RF-034 | `notebooks` (dono `user_id`) |

### 3.2 Notas de coesão e fronteira

- **Flashcards 3D são frontend, não `threed`.** O flip é CSS 3D (doc `20` §3), sem
  WebGL. O módulo `threed` (doc `13` §2) segue exclusivo do Explorador do cockpit.
  Os flashcards moram em `frontend/src/pages/treinamento`, consumindo a API de
  `training`.
- **Organograma dentro de `directory`.** Concentrar pessoas/hierarquia/polos num
  módulo só evita **espalhar dados pessoais** (restrição LGPD do doc `24` §2.1) por
  várias fronteiras — menos superfícies a proteger.
- **`components` é o elo tríplice:** liga verbete (`dictionary` por `term_slug`),
  responsável (`directory`/`component_specialists`) e fornecedor Tier-1. Reusa
  contratos públicos, sem importar interiores (doc `13` §3.1).
- **Cada tabela nova nasce com `metadata jsonb` + `created_at`/`updated_at`**
  (doc `13` §6.3; SPEC `08`/`09`) e `slug` estável onde há conteúdo compartilhado
  — substitui os IDs `custom-<Date.now()>` do protótipo (doc `20` §6).
- O `app.ts` registra o `index.ts` de cada módulo novo (doc `13` §4.3), mantendo a
  lista de módulos ativos explícita e auditável num só lugar.

### 3.3 Novo mapa de módulos (delta ao doc `13` §2)

Módulos do `13` §2 **mantidos**: `core`, `shared`, `auth`, `users`, `dictionary`,
`workflows`, `contributions`, `directory` (agora + organograma/polos),
`community-qa`, `rag`, `cockpit-3d`, `frontend`, `threed`.

Módulos **acrescentados**: `training`, `resources`, `gamification`, `projects`,
`components`, `automations`, `notebook`.

## 4. Gamificação isolada da autorização (invariante crítico)

Restrição do doc `24` §2.4/R9 e da SPEC `09`: **XP/nível/insígnias NÃO podem virar
papel de permissão.** O protótipo promove "cargo" por XP (doc `20` §3, `level up`);
no produto isso é **apenas rótulo de engajamento**, desacoplado do `role` que
`can()` resolve (doc `13` §1.2 item 4).

Regras arquiteturais:

1. **`gamification` é um consumidor de eventos, não uma fonte de verdade de
   acesso.** Ele **nunca** é consultado por `core/authz`. A cadeia de autorização
   permanece `role → role_permissions → can()` (SPEC `09` §2.1), sem qualquer
   ramo por XP/nível.
2. **Direção de dependência:** os módulos de conteúdo **não importam**
   `gamification`. Eles **emitem eventos de domínio** (ex.: `contribution.approved`,
   `course.completed`) num **dispatcher síncrono em `core/events`** (novo
   sub-módulo de `core`); `gamification` **assina** esses eventos e concede XP.
   Isso preserva o baixo acoplamento (doc `13` §7): quem cria conteúdo não sabe que
   a gamificação existe.
3. **`xp_events` é append-only** (mesma disciplina do `audit_log`, doc `13` §6.1):
   cada concessão de XP fica auditável e nunca reescreve `role`.
4. O `level`/insígnia é **projeção** de `xp_events` em `user_progress`; se a
   gamificação sair de escopo no MVP (pergunta em aberto §11), remover o listener
   **não afeta** nenhum outro módulo.

> Nota: o `core/events` é um **dispatcher em processo** (monólito, sem broker),
> mantendo a simplicidade operacional do doc `13` §1.1. É o mesmo padrão que já
> serve o `audit_log`; formaliza-se aqui por causa do fan-out da gamificação.

## 5. Contribuição/moderação transversal — `target_type` expandido

O protótipo publica toda cocriação **direto, sem revisão** (doc `20` §6; RF-006/
RF-007 observações). No produto, **toda cocriação de conteúdo compartilhado** entra
no fluxo do módulo transversal `contributions` (doc `13` §2/§6.4): `user`
**propõe-e-aprova** (`pending → approved/rejected/withdrawn`),
`coordinator`/`admin` editam direto (SPEC `09` §4; RF-063/RF-064).

O ganho de extensibilidade do `13` (SPEC `09` §8) é o que torna isso barato: o
**`target_type` polimórfico** absorve os tipos novos **sem novas tabelas de
histórico/moderação**. O enum de `target_type` passa a incluir, além de `term`/
`workflow`/pessoa:

`project`, `component`, `automation`, `channel`, `kit_item`, `org_node`.

Consequências:
- `content_revisions` (rollback) e `audit_log` (quem/quando) cobrem os módulos
  novos **de graça** — reuso, não reimplementação (doc `13` §6.4).
- **Flashcards e Notebook são exceção** deliberada: conteúdo **pessoal/privado**,
  não compartilhado, **não** passa por moderação (mas escrita ainda exige `can()`
  sobre o próprio recurso — dono só edita o seu).
- **Toda rota de escrita** dos módulos novos declara a permissão exigida e chama
  `can()` (doc `13` §5); nenhuma checa cargo direto. Permissões nomeadas seguem
  `<area>.<acao>` (doc `13` §3.2): `project.create`, `component.approve`,
  `orgchart.edit`, `automation.create`, `resource.moderate`, etc. A matriz por
  cargo é seed em `seeds/role_permissions.json` (doc `13` §3 layout).

## 6. Regras de dependência — delta ao doc `13` §7

As seis regras duras do doc `13` §7 **permanecem**. Acréscimos para os módulos
novos:

1. **`gamification` só depende de `core` (events, db) e `shared`.** Nenhum módulo
   de conteúdo depende de `gamification` (fluxo por evento — §4).
2. **`notebook` e `automations` dependem do port `LlmProvider`** exposto por `rag`
   (ou elevado a `shared` — decisão de detalhe da Etapa 9), **nunca** de um SDK de
   LLM concreto (§7).
3. **`components` → contrato público de `dictionary` e de `directory`** (por
   `term_slug`), sem importar interiores.
4. **`org_nodes`/`sites` vivem em `directory`;** qualquer módulo que precise da
   estrutura organizacional a consome pelo `index.ts` público de `directory`.
5. **`core/events` não depende de `modules`** (mesma regra do `core` no `13` §7.2):
   o dispatcher só conhece um tipo de envelope de evento em `shared`; os
   assinantes se registram no bootstrap (`app.ts`).

> Como no doc `13` §7 (nota), essas regras devem virar lint na CI
> (`dependency-cruiser`/`no-restricted-imports`) — a alinhar com o `devops-lead` na
> Etapa 11.

## 7. Decisões voláteis `D5`/`D6` — isoladas por port/adapter

Reafirma o doc `13` §7.4/§10.5. O escopo maior **não** toca as decisões em aberto:

- **`D5` (provedor de LLM — Claude vs. OpenAI, PDR `03`):** continua atrás do port
  **`LlmProvider`** (SPEC `02` §2; doc `13` §2/§7.4). O escopo maior **amplia os
  consumidores** desse port: além do chat (`rag`), agora o **Notebook** (RF-032..34)
  e o atalho de **Automações** (RF-046b). Isso torna o port **mais** valioso, não o
  compromete — todos os consumidores falam com a mesma interface; trocar de
  provedor é uma mudança de adapter + `config`.
- **`D6` (hospedagem — on-prem/cloud/Docker, PDR `03`):** segue configurável por
  ambiente (doc `13` §1.2 item 6; RNF-032). Nenhum módulo novo assume um alvo de
  hospedagem. A estratégia de secret manager continua dependente de `D6` (doc `13`
  §10.4), sem bloquear a arquitetura.

Conclusão: `D5`/`D6` permanecem **não-bloqueantes** para a Etapa 8 — os módulos
novos herdam o isolamento já desenhado.

## 8. Restrições de segurança do doc `24` como invariantes transversais

Incorporadas à arquitetura como **restrições transversais** (aplicam-se a todos os
módulos, novos e existentes). Rastreabilidade ao doc `24`:

| # | Invariante arquitetural | Origem (doc `24`) | Onde vive |
|---|---|---|---|
| S1 | **Escape de saída obrigatório + CSP** em toda renderização de conteúdo cocriado (substitui o `innerHTML` cru do protótipo). Frontend nunca injeta string não-escapada. | §2.3 MÉDIO / R7 | `frontend` (render), header CSP no backend/`core/http` |
| S2 | **Sanitização de entrada** no serviço, antes de persistir conteúdo rico. | §2.3 / R7 | camada serviço dos módulos de conteúdo |
| S3 | **RBAC + moderação em toda cocriação** (nada publica direto). | §1 / §2.4 (RF-063/064) | `contributions` + `can()` (§5) |
| S4 | **XP/gamificação desacoplado de `role`;** acesso só por `can()`. | §2.4 / R9 | `gamification` isolado (§4) |
| S5 | **Segredos só no backend;** bundle client-side sem chaves (chamada ao LLM no servidor). | §2.5 INFO / RNF-033 | `core/config` + adapter `LlmProvider` |
| S6 | **Minimização de dados pessoais (LGPD):** organograma/especialistas só a autenticados; base legal/minimização; sem seed de pessoas reais até migração segura. | §2.1 CRÍTICO / R1–R2 | `directory` (org_nodes/sites/specialists), atrás de `auth` |
| S7 | **Validação de MIME/tamanho de upload no backend** (avatar e imagem de componente). | §2.4 BAIXO / R8 | serviço de `users` e `components` |
| S8 | **CDNs com versão fixa + SRI** (ou servidos localmente). | §2.5 INFO / R10 | `frontend` (build/assets) |
| S9 | **Generalizar dados sensíveis nos seeds** (códigos de projeto, fornecedores, domínios internos) — placeholders. | §2.2 ALTO / R4–R5 | `seeds/` + `projects`/`components` |

S1–S5 e S6 são **restrições de projeto** (afetam fronteiras/camadas) e por isso
entram na arquitetura; S7–S9 são **conformidade de implementação** verificada pela
Segurança na Etapa 11 (backlog `04`). A anonimização do organograma (R1/R2, doc
`24`) é **pré-condição de dado**, não de arquitetura — segue como pergunta ao CEO
(§11).

## 9. Contrato de API — delta

Mantém os princípios do doc `13` §5 (REST/JSON, prefixo `/api`, envelope
padronizado, permissão declarada por rota + `can()`). Novas áreas de rota,
coerentes com os módulos:

`/api/treinamento` (cursos, flashcards), `/api/recursos` (canais, kit),
`/api/gamificacao` (progresso/insígnias — **somente leitura** pelo cliente;
escrita só via eventos internos), `/api/projetos`, `/api/componentes`,
`/api/automacoes`, `/api/notebook` (escopo do próprio usuário), e a extensão de
`/api/diretorio` para organograma/polos.

O contrato detalhado (payloads, códigos, permissão por endpoint) é produzido
**quando as tarefas de backend de cada área começarem** (doc `13` §5), não
congelado aqui. Este doc fixa **onde** cada área vive e **como** é exposta.

## 10. Recomendação de gate (Etapa 8)

**Recomendação: APROVAR a Etapa 8** com este doc `25` + o doc `13` como artefato
de arquitetura conjunto. Justificativa contra a DoD (doc `14` L116):

1. **Estilo decidido** — monólito modular confirmado para o produto real (§2). ✔
2. **Fronteiras/regras de dependência fixadas** — os sete blocos novos têm módulo,
   camada e direção de dependência definidos (§3, §6); o que é MVP fica como
   pergunta ao Produto/CEO, não inventado (§11). ✔
3. **`D5`/`D6` isolados por port/adapter** — reafirmado e ampliado sem bloqueio
   (§7). ✔
4. **Segurança do doc `24` incorporada** como invariantes transversais (§8). ✔

**Encaminhamentos de coordenação (regra do doc `13` §8 / `14` §4):**
- Entrega vai ao **QA Lead** (verificação da DoD do gate) e ao **Segurança Lead**
  (confirma que S1–S9 refletem o parecer `24`).
- **Etapa 9 (Banco)** só abre após este gate; o `backend-engineer` materializa as
  tabelas propostas (§3.1) e o enum de `target_type` expandido (§5) como migrações
  versionadas, com aprovação **+ Segurança** (LGPD, doc `14` L126).

**O que precisa de decisão do CEO antes da Etapa 9** (não bloqueia aprovar a
arquitetura, mas condiciona o schema): **escopo de MVP** dos módulos novos (§11.1)
e a **decisão LGPD** do doc `24` (§11.3). `D5`/`D6` seguem não-bloqueantes.

## 11. Perguntas em aberto

1. **Escopo de MVP entre os módulos novos** — quais das sete famílias
   (`training`, `resources`, `gamification`, `projects`, `components`,
   `automations`, `notebook`) entram no primeiro corte e quais viram Fase 2+?
   Recomendação de Engenharia (a confirmar pelo Produto/CEO): o **núcleo**
   (`dictionary`, `rag`, `cockpit-3d`, `directory`) do PDR `03` §3 Fase 1 permanece
   MVP; entre os novos, `components` e `projects` têm o menor custo (CRUD + elo por
   `slug`) e a `gamification` é a mais adiável (é engajamento, não função-núcleo).
   **Decisão é do Produto/CEO** — *ainda em aberto* (herda doc `20` §8.1, doc `21`
   §12.2/§12.5). Nota ao PDR: possível novo `Dn` para **gamificação no produto**.
2. **`D5` (provedor de LLM)** e **`D6` (hospedagem)** — seguem em aberto no PDR
   `03`; tratados como configuráveis por port/adapter + env (§7), portanto **não
   bloqueiam** a Etapa 8. Confirmar quando o CEO decidir. *— ainda em aberto.*
3. **Decisão LGPD do doc `24`** — usar **pessoas reais** ou **seed fictício** no
   organograma/especialistas (`directory`)? Recomendação de Segurança: **fictício**
   até migração segura (doc `24` §4.1, R1/R2). É **pré-condição de dado** para a
   Etapa 9 popular seeds. *— decisão do CEO em aberto.*
4. **Granularidade `training` vs. `resources`** — manter Kit + Canais num módulo
   `resources` separado de `training` (cursos/flashcards), ou unificar? Recomendação:
   separado (coesão distinta: aprendizado vs. links curados). Decisão de detalhe da
   Engenharia, a fixar na Etapa 9. *— em aberto (baixo impacto).*
5. **`core/events` (dispatcher em processo)** — formalizar o barramento de eventos
   síncrono no `core` (§4) já na fundação (Etapa 9/`T06`) ou só quando
   `gamification` entrar em escopo? Depende de §11.1. *— em aberto.*
6. **Elevar `LlmProvider` de `rag` para `shared`** — com Notebook e Automações
   consumindo o port (§6.2), o contrato pode subir para `shared/contracts`. Decisão
   de detalhe da Etapa 9. *— em aberto (baixo impacto).*
