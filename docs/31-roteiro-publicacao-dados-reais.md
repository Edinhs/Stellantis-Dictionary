# 31 — Roteiro de Publicação com Dados Reais (o que falta para o site ir ao ar, seguro)

> Status: **rascunho para decisão do CEO**.
> Última atualização: 2026-07-24.
> Autoria: DevOps Lead (`devops-lead`), dono de hospedagem/deploy (`D6`).
> Insumos: Segurança (`24-parecer-seguranca-prototipo.md`), NFR
> (`22-requisitos-nao-funcionais.md`), Deploy (`17-deploy-e-entrega.md`),
> PDR (`03-pdr.md` — `D5`/`D6`), backlog (`04-tasks.md` — `T15–T17`).
> **Não executa nada.** É o levantamento honesto para o CEO decidir `D6`/`D5`.
>
> **Atualização 2026-07-24 — `D6` RESOLVIDA:** o CEO fechou a hospedagem em
> **Cloudflare (Pages + Workers) + Supabase (Postgres gerenciado com `pgvector`)** —
> exatamente o caminho recomendado no §3 deste roteiro. Registro formal no PDR
> `03-pdr.md` (`D6`). O corpo abaixo, que trata `D6` como decisão-nó pendente, fica
> como **contexto histórico da análise**. Pendências **operacionais** que seguem
> abertas: provisionamento ainda não executado e **connectors/MCP de Cloudflare e
> Supabase ainda não conectados** ao ambiente (o CEO precisa conectá-los antes de
> qualquer provisionamento automatizado). **`D5` (provedor de LLM) segue em aberto.**

Pergunta do CEO: *"O que falta para que o site seja publicado COM as informações
reais/internas do dicionário?"*

Resposta curta: **não é um passo, são cinco frentes** (infra, acesso, frontend
real, dados, segurança/LGPD) e uma **decisão-nó (`D6`, hospedagem)** que destrava
todas. Hoje o que está "no ar" é um **protótipo estático** com dados fictícios; o
backend real existe e passa nos testes, mas **nunca rodou em lugar nenhum** e
**não há site de produção**. Publicar dados internos reais no arranjo atual (repo
público + GitHub Pages) é **inviável** — ver §1.

---

## 1. O bloqueador central: público × dados internos

O site que está no ar hoje é servido de um **repositório PÚBLICO** via **GitHub
Pages**, a partir da branch de trabalho. É um **protótipo estático** que usa dados
de exemplo (`defaultTerms` + `localStorage`) — **não fala com o backend**. Segurança
já removeu dados reais dele (doc `24`, R4/R5 resolvidos), justamente porque tudo ali
é mundialmente visível.

Os dados que o CEO quer publicar são o oposto disso: **nomes de pessoas (PII/LGPD)**,
**URL interna** (`fiasa.com.br`), **códigos de projeto** (358/359/281). Colocar isso
no arranjo atual significaria **expor dado interno ao mundo inteiro** — sem
autenticação, sem base legal LGPD, e com o agravante de que o **GitHub Pages não tem
como restringir acesso** e o **histórico git guarda tudo para sempre**.

Conclusão dura: **o site atual não pode receber dado real.** Para publicar com dado
interno é preciso um ambiente **fundamentalmente diferente**:

1. **Hospedagem própria/controlada** (não GitHub Pages estático) que rode o backend
   + Postgres — isto é a **decisão `D6`, ainda em aberto** (CEO cogitou Cloudflare).
2. **Acesso restrito**: o site **não pode ser aberto ao mundo**; precisa de login e,
   idealmente, estar atrás de rede/identidade corporativa.
3. **Repositório privado** (ou pelo menos separar o dado do código) — e **limpeza do
   histórico git** (R3) se algo real já tiver encostado no repo.

**`D6` é o nó**: ela decide *onde* roda, *como* se restringe o acesso, *onde* ficam
os segredos, *como* é o CI/CD e *onde* ficam os backups. Enquanto `D6` for TBD, as
etapas 15–19 (deploy/operação) ficam **bloqueadas para execução real** (`17` §, `14`
§5). Este roteiro adianta o planejamento; **não** fura o bloqueio.

---

## 2. Lista priorizada e honesta do que falta

Legenda de esforço: **P** = pequeno (horas/1–2 dias), **M** = médio (dias),
**G** = grande (semanas). Esforço é de *engenharia*, não inclui espera por decisão.

### Bloco A — Infra / Hospedagem (dono: DevOps · amarrado a `D6`)

| # | Item | Esforço | Depende de |
|---|------|---------|-----------|
| A1 | **Fechar `D6`** (Cloudflare Workers+Pages / VPS / cloud privada / on-prem). Define todo o resto deste bloco. | — (decisão CEO) | — |
| A2 | Provisionar **Postgres + pgvector** gerenciado e privado (ex.: Neon/Supabase se for Cloudflare; ou Postgres na VPS). Rede fechada, porta **não** exposta. | M | A1 |
| A3 | **Empacotar e subir o app** no alvo (imagem Docker ou build Workers). Hoje o `docker-compose` é **só local** e diz explicitamente "NÃO é produção". Falta o override/manifesto de produção. | M | A1, A2 |
| A4 | **Gestão de segredos** no alvo (secret manager / env do provedor). Nunca commitar. JWT secret, DB URL, chaves. Revisão do Segurança Lead. | P–M | A1 |
| A5 | **HTTPS/TLS obrigatório** (certificado + redirect). Trivial em Cloudflare, manual em VPS. | P–M | A1 |
| A6 | **CI/CD de deploy** (`.github/workflows`): hoje **não existe pipeline de deploy** (nem de lint/test em CI). Build → test → deploy no merge. | M | A1, A3 |
| A7 | **Backups** do Postgres (dump agendado + teste de restauração) e retenção. Com dado real isto é **obrigatório**, não opcional. | M | A2 |
| A8 | **Health-check/observabilidade** em produção: o endpoint `GET /api/health` **já existe**; falta monitorá-lo + logs estruturados centralizados (`19`). | P | A3 |

### Bloco B — Controle de acesso (dono: Backend/Segurança · **crítico**)

| # | Item | Esforço | Depende de |
|---|------|---------|-----------|
| B1 | **Decidir quem são os usuários e como entram.** O backend tem JWT + RBAC (`can()`), mas **não há base de usuários nem provisionamento**. Opções: (a) cadastro interno com aprovação; (b) **SSO corporativo** (Google Workspace/Azure AD) — mais seguro, mais trabalho. | — (decisão CEO) | — |
| B2 | Implementar o fluxo escolhido em B1 (telas + provisionamento inicial de admin). Se cadastro simples: P–M. Se SSO/OIDC: **G**. | P–G | B1, C1 |
| B3 | **Garantir que o site NÃO seja aberto ao mundo**: gate de acesso na borda (Cloudflare Access / VPN / allowlist de IP) *além* do login da app. Defesa em profundidade — sem isto, um bug de auth vaza tudo. | M | A1, B1 |
| B4 | Revisão RBAC ponta-a-ponta com dado real (quem lê PII, quem edita, quem publica). | P | B2 |

### Bloco C — Frontend real / SPA de produção (dono: Frontend · **sem isto não há "site real"**)

| # | Item | Esforço | Depende de |
|---|------|---------|-----------|
| C1 | **A SPA de produção não existe.** `frontend/src` está vazio (só `.gitkeep`). Hoje o "site" é o **protótipo estático**, que não usa a API. `T15` (login), `T16` (dicionário), `T17` (chat) estão **não iniciados**. | **G** | A3 (API no ar ajuda) |
| C2 | Integrar a SPA à API real (auth, dicionário, contribuições/moderação). | M–G | C1, B2 |
| C3 | Decisão `T05g`: reaproveitar o CSS/JS do protótipo como base da SPA ou recomeçar. Afeta o esforço de C1. | — (decisão eng) | — |

> **Este é o maior item de esforço isolado.** Sem C1/C2, mesmo com backend e dados
> no ar, o usuário não tem um site para usar — só a API.

### Bloco D — Dados reais no banco (dono: Backend/Eng · auditado)

| # | Item | Esforço | Depende de |
|---|------|---------|-----------|
| D1 | **Importador auditado**: hoje as **682 siglas** estão só em `data/siglas-lista-geral-2.json` (rascunho) e **nunca foram carregadas** — não há banco vivo. Falta um script de importação idempotente, que registre no `audit_log`, com validação de schema. | M | A2 (banco vivo) |
| D2 | Carregar os **lotes reais do CEO** (com PII) via o mesmo importador — **só depois** do tratamento LGPD do Bloco E. | P–M | D1, E1 |
| D3 | **Fluxo de revisão/publicação**: rascunho → revisão → publicado (a migração `0008` já prevê `draft`/categoria nullable). Definir quem aprova. | M | B2, D1 |
| D4 | **Decisão de taxonomia** pendente: **4 → 8 categorias**. Afeta como os termos são classificados na carga. | — (decisão produto) | — |

### Bloco E — Segurança / LGPD antes de ir ao ar com dado real (dono: Segurança · **gate**)

| # | Item | Esforço | Depende de |
|---|------|---------|-----------|
| E1 | **Tratamento de PII (nomes de pessoas)**: definir base legal LGPD, minimização, e se nomes ficam só para usuários autenticados/autorizados (RNF-031). Sem isto, **não carregar** dado com PII. | M | B1 |
| E2 | **R3 — limpeza do histórico git**: dado interno já commitado permanece nos commits antigos. Reescrita de histórico é **destrutiva** e exige decisão explícita CEO/DevOps. **Segue pendente** (`24`). | M | decisão CEO |
| E3 | **Repo privado** (ou separar dado do código): pré-condição para dado real conviver com o repositório. | P (ação) | decisão CEO |
| E4 | Remover URLs internas (`fiasa.com.br`) e códigos de projeto (358/359/281) de **superfícies indevidas** (código, seeds públicos, protótipo) — só devem existir no banco restrito. | P–M | — |
| E5 | **Hardening HTTP**: `helmet`, `CORS` restrito, **rate limiting** — hoje **não estão no backend**. Necessário antes de expor a API. | P–M | A3 |
| E6 | **bcrypt → argon2**: hoje o hash de senha é `bcryptjs` (JS puro, aceitável no MVP por decisão registrada); revisitar `argon2` quando houver build nativo no pipeline. | P | A6 |
| E7 | **Hardening do `audit_log`** (imutabilidade/retenção) para dado sensível. | P–M | A2 |

### Bloco F — RAG / Chat (dono: RAG/Eng · condicional a `D5`)

| # | Item | Esforço | Depende de |
|---|------|---------|-----------|
| F1 | Só entra **se o chat fizer parte do "site publicado"**. Hoje há **stub** de `LlmProvider`; depende da **decisão `D5`** (provedor de LLM: Claude vs. OpenAI). | — (decisão CEO) | — |
| F2 | Se `D5` fechar: pipeline de embeddings/chunking + orquestração com citação de fontes + guardrails. **Com dado interno, atenção redobrada**: não enviar PII a LLM externo sem base legal. | G | D5, D2, E1 |

---

## 3. Caminho recomendado (o mais simples que atende "dado real, mas seguro")

Objetivo: **menor configuração viável** que permita publicar com dado real **sem
vazar**. Recomendação pragmática, em ordem:

1. **Fechar `D6` a favor de Cloudflare** (Pages + Workers) **com Postgres gerenciado
   privado** (Neon/Supabase com pgvector) — já validado como compatível com a
   arquitetura (`03`/`13`/`25`). Vantagem: TLS, gate de acesso (**Cloudflare
   Access**) e deploy prontos, sem operar VPS. *(Se o CEO preferir controle total,
   a alternativa é VPS própria — mais trabalho de HTTPS/segredos/backup/hardening.)*
2. **Tornar o repositório privado** e **limpar o histórico (R3)** antes de qualquer
   dado real encostar no versionamento. Manter dado real **fora do git** (só no
   banco).
3. **Acesso interno-only por padrão**: **Cloudflare Access na frente** + login da
   app (JWT já existe). Defesa em profundidade — o mundo não vê a URL.
4. **Definir usuários** pelo caminho mais barato aceitável: começar com **cadastro
   interno + aprovação por admin**; SSO corporativo fica como evolução (não bloqueia
   o MVP).
5. **Construir a SPA de produção (`T15–T17`)** — é o maior esforço e o gargalo real
   do "site". Não há atalho: sem ela, só existe API.
6. **Importador auditado** carrega as 682 siglas (dado não-PII primeiro), depois os
   lotes com PII **somente após E1 (LGPD)**.
7. **Gate de Segurança** (E1, E4, E5, E7) + **backups (A7)** aprovados **antes** do
   go-live com dado real.

Sequência mínima de valor: **D6 → repo privado + R3 → infra (A2–A5) → SPA (C1–C2) →
gate de segurança (E) → carga de dados (D) → go-live restrito**. RAG (`F`) e SSO são
evoluções pós-MVP.

**Honestidade sobre esforço:** mesmo pelo caminho mais enxuto, o item **C (SPA de
produção) é semanas de trabalho** e é inescapável. Infra + segurança + dados somam
mais dias. **Não é um "publicar amanhã"** — é um MVP real de produção. O que *é*
rápido: fechar decisões, tornar repo privado, provisionar infra Cloudflare.

---

## 4. Decisões que só o CEO pode tomar

- **`D6` — Hospedagem** *(o nó)*: Cloudflare (recomendado) vs. VPS vs. cloud privada
  vs. on-prem. Destrava todo o Bloco A e o deploy real.
- **`D5` — Provedor de LLM**: Claude vs. OpenAI. Só necessário **se o chat entrar no
  escopo do site publicado**. Atenção LGPD ao enviar dado interno a LLM externo.
- **Acesso interno-only?**: confirmar que o site é **restrito** (não público) e como
  os usuários entram — **cadastro interno** (barato) vs. **SSO corporativo** (seguro,
  caro). Define o Bloco B.
- **Repo privado + R3 (limpeza de histórico)**: autorizar tornar o repositório
  privado e a **reescrita destrutiva do histórico git** antes de dado real.
- **Taxonomia 4 → 8 categorias** (`D4`): afeta a carga dos dados.
- **Orçamento**: hospedagem gerenciada + Postgres gerenciado + (eventual) LLM têm
  custo mensal recorrente; SSO/gate corporativo pode ter custo. Definir teto.

---

## 5. Resumo executivo (para repassar ao CEO)

Hoje está no ar apenas um **protótipo estático com dados fictícios**, servido de um
**repositório e site públicos** — **não dá para colocar dado interno ali** (vazaria
para o mundo, sem base LGPD). O **backend real existe e passa nos testes, mas nunca
rodou**; a **SPA de produção não existe** (o "site" hoje é só o protótipo); e **não
há banco vivo** (as 682 siglas estão num rascunho, nunca carregadas).

Para publicar com dado real e **seguro**, faltam cinco frentes, destravadas por uma
decisão-nó (**`D6`, hospedagem**):
1. **Infra**: hospedar app + Postgres privado, HTTPS, segredos, CI/CD, backups.
2. **Acesso**: site **restrito** (não público) + login de usuários internos.
3. **Frontend real**: construir a SPA de produção (`T15–T17`) — **o maior esforço,
   inescapável**.
4. **Dados**: importador auditado carrega as siglas e os lotes reais no banco.
5. **Segurança/LGPD**: tratar PII, repo privado, limpar histórico git (R3),
   hardening (helmet/CORS/rate-limit) — **gate obrigatório antes do go-live**.

Caminho mais simples recomendado: **Cloudflare (Pages+Workers) + Postgres gerenciado
privado + Cloudflare Access (site interno-only) + repo privado com histórico limpo**.
É o menor arranjo que publica dado real sem vazar. **Não é rápido**: a SPA de
produção sozinha é semanas; o conjunto é um MVP de produção, não um "publicar
amanhã". Decisões pendentes do CEO: **D6 (hospedagem)**, **acesso interno-only e como
os usuários entram**, **autorizar repo privado + limpeza de histórico**, **D5 (LLM,
só se o chat entrar)**, **taxonomia** e **orçamento**.
