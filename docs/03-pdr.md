# PDR — Product Decision Record

## 1. Decisões tomadas
| # | Decisão | Status |
|---|---|---|
| D1 | Escopo v1 = multiusuário completo (cadastro, login, papéis admin/user) | Confirmado |
| D2 | Fonte do dicionário = cadastro manual + ingestão de documentos (híbrido) | Confirmado |
| D3 | Segurança é requisito de primeira classe (dado ambiente empresarial) | Confirmado |
| D4 | Stack: Node.js/TS + Postgres/pgvector + adapter de LLM | Recomendado — aguardando confirmação final |
| D5 | Provedor de LLM inicial | **RESOLVIDA (CEO, 2026-07-24): Google Gemini** (modelo indicado pelo CEO como **"3.1"**) como provedor de LLM inicial, **via API Key**. Escolha **PROVISÓRIA** ("por enquanto"), com intenção de atualizar/trocar depois. O adapter multi-provedor (`rag/LlmProvider`, doc `13` §1.1) **permanece abstrato** — a troca futura de provedor não deve exigir reescrita do pipeline RAG. Ver nota operacional §2.2. **Segurança:** a API Key é SEGREDO e nunca entra no repositório (público) — ver §2.2. |
| D6 | Estratégia de hospedagem (on-prem vs. cloud privada vs. local via Docker) | **RESOLVIDA (CEO, 2026-07-24): Cloudflare + Supabase.** App em **Cloudflare** (Pages para o frontend + Workers para o backend) e **Supabase** (Postgres gerenciado com `pgvector`) como banco. É exatamente o caminho recomendado no roteiro `31-roteiro-publicacao-dados-reais.md` §3 e compatível com a arquitetura já aprovada (`13`/`25`) — **não** conflita com o schema da Etapa 9. Destrava o Bloco A do roteiro `31` e o deploy real (etapas 15–19). **Nota operacional:** arquitetura decidida, mas **provisionamento ainda não executado**; os **connectors/MCP de Cloudflare e Supabase ainda NÃO estão conectados** ao ambiente de trabalho — pendência de execução do CEO conectá-los antes de qualquer provisionamento automatizado (ver §2.1). *(Histórico: nota do CEO em 2026-07-19 cogitava Cloudflare em avaliação.)* |
| D7 | Explorador 3D do cockpit na página principal, com hotspots ligados ao dicionário | Confirmado — MVP simplificado (modelo placeholder + poucos hotspots) |
| D8 | Tecnologia 3D: `three.js` vs. `<model-viewer>` | Em aberto — decidir no protótipo (model-viewer para MVP rápido; three.js se precisar de mais controle) |
| D9 | Origem do modelo 3D (placeholder livre no MVP; modelo oficial depois) | Confirmado — placeholder no MVP, sem depender de asset oficial |
| D10 | Módulo "Responsáveis e Especialistas" ("quem procurar"), ligado por `term_slug` | Confirmado — ver docs `07`/`08` |
| D11 | **Plataforma comunitária**: usuários alimentam dicionário, fluxo de trabalho e especialistas | Confirmado — ver SPEC `09` |
| D12 | **Cargos finais: `user` (comum, default no cadastro), `coordinator`, `admin`** | Confirmado — só `coordinator`/`admin` atribuem cargos |
| D13 | Autorização por **permissões nomeadas** resolvidas por cargo (RBAC + capabilities), não `if role ==` | Recomendado — ver SPEC `09` §2.1 |
| D14 | Contribuição **híbrida**: `user` propõe-e-aprova (moderado); `coordinator`/`admin` editam direto | Confirmado — ver SPEC `09` §4 |
| D15 | Novo tipo de conteúdo **`workflows`** (fluxo de trabalho), espelhando `terms` | Confirmado — ver SPEC `09` §5 |
| D16 | Histórico/auditoria: `contributions` + `content_revisions` (rollback) + `audit_log` (append-only) | Confirmado — ver SPEC `09` §6 |
| D17 | **Aba "Comunidade" (Q&A)**: usuários fazem e respondem perguntas | Confirmado — PDR/SPEC dedicados (docs `10`/`11`, em elaboração) |
| D18 | **Ciclo de vida de Engenharia de 19 etapas com gates sequenciais rígidos** como espinha dorsal governada (cada etapa = portão com dono, DoD e aprovador) | Confirmado — ver doc `14-ciclo-de-vida-engenharia.md`; docs de apoio `15`–`19` |
| D19 | **Criação de 4 cargos**: Design Lead (UX/UI, 7º lead → Agente Geral), Analista de Requisitos (→ Produto Lead), Release/Deploy Engineer e SRE/Monitoramento (→ DevOps Lead) | Confirmado — ver roster `12` §4/§7 |
| D20 | **Escopo do MVP (B1) após o protótipo:** núcleo (dicionário + RAG + cockpit 3D + auth/RBAC) **+ Componentes de Infotainment + Projetos**. Notebook, Gamificação, Canais/Kit, Automações e Organograma+mapa ficam **fora do MVP** (fases futuras) | Confirmado — CEO, 2026-07-19; ver backlog `04` Fase 0.6, log de gates `27` |

## 2. Riscos e mitigação
| Risco | Impacto | Mitigação |
|---|---|---|
| Vazamento de dados confidenciais do setor | Alto | RBAC, criptografia em trânsito/repouso, revisão de segurança antes de cada release, sem dados reais em ambiente de teste |
| Alucinação do chatbot (resposta incorreta sobre sigla/processo) | Médio | RAG restrito ao contexto recuperado + citar fontes; admin revisa termos |
| Dependência de um único provedor de LLM | Médio | Camada de adapter (`LlmProvider`) desacoplada |
| Escopo crescer demais para "uso pessoal" | Médio | Fases bem definidas (MVP primeiro, ingestão de documentos depois) |
| Explorador 3D pesar/atrasar o MVP ou não rodar em máquinas fracas | Médio | MVP com modelo leve/placeholder, compressão Draco, fallback em imagem clicável (image-map) sem WebGL |
| Uso de asset 3D/imagem sem licença adequada | Médio | Usar modelo genérico de licença livre; imagem oficial só como referência interna, não redistribuída |

### 2.1 Nota operacional — `D6` (hospedagem)
A **arquitetura de hospedagem está decidida** (`D6` = Cloudflare + Supabase,
2026-07-24), mas isso é **decisão de arquitetura, não de execução**. Pontos honestos
em aberto no plano operacional:

- **Provisionamento ainda NÃO foi executado.** Não existe projeto Cloudflare
  (Pages/Workers) nem instância Supabase provisionada; nada roda em produção. O
  backend real existe e passa nos testes, mas **nunca rodou hospedado** (ver roteiro
  `31` §5).
- **Connectors/MCP de Cloudflare e Supabase ainda NÃO estão conectados** ao ambiente
  de trabalho. **Pendência operacional do CEO:** conectá-los **antes** de qualquer
  provisionamento automatizado. Sem esses connectors, nenhum agente pode provisionar
  infra de forma automatizada.
- Isso é **pendência de execução, não altera a decisão de arquitetura.** A sequência
  de destravamento continua sendo `D6 → repo privado + R3 → infra → SPA → gate de
  segurança → carga de dados → go-live restrito` (roteiro `31` §3).

### 2.2 Nota operacional e de segurança — `D5` (provedor de LLM)
A escolha do provedor inicial está **decidida** (`D5` = Google Gemini "3.1" via API
Key, 2026-07-24), mas há pontos operacionais e de segurança que precisam ficar
explícitos e honestos:

- **Escolha provisória.** O CEO definiu Gemini "por enquanto", com intenção de
  atualizar/trocar depois. Por isso o **adapter multi-provedor (`rag/LlmProvider`)
  deve permanecer abstrato** — trocar de provedor (Gemini → outro) é substituir o
  adapter/variáveis de ambiente, **sem reescrever o pipeline RAG** (`rag.service`).
  A arquitetura de portas & adaptadores já prevê isso (doc `13` §1.1; port em
  `backend/src/modules/rag/llm-provider.port.ts`).
- **A API Key do Gemini é um SEGREDO.** O repositório é **PÚBLICO** — a chave
  **NUNCA** pode ser commitada (nem em `.env`, código, testes, histórico de git ou
  documentação). Vazar a chave permite uso indevido e custo em nome do projeto.
- **Como a chave entra:** exclusivamente via **variável de ambiente / gestor de
  segredos** do ambiente de hospedagem (**Cloudflare**, quando provisionado — ver
  `D6`/§2.1), e localmente via `.env` (que **não** é versionado). O `.env.example`
  carrega apenas o **placeholder** `GEMINI_API_KEY=__CHANGE_ME__`, nunca o valor
  real.
- **Estado atual:** o CEO **ainda NÃO enviou a chave**. Enquanto isso, o pipeline
  opera com o adapter stub (`llm-provider.stub.ts`). A implementação do **adapter
  Gemini é um passo de engenharia separado e futuro** — esta decisão registra
  apenas a escolha do provedor, não altera código do adapter agora.

## 3. Roadmap por fases
- **Fase 0 — Documentação (atual)**: Briefing, SPEC, PDR, definição de agentes/skills.
- **Fase 1 — MVP**: auth multiusuário, CRUD de termos, chatbot RAG básico sobre
  termos cadastrados manualmente, interface web mínima, **e Explorador 3D
  simplificado** (modelo placeholder com poucos hotspots ligados ao dicionário).
- **Fase 2 — Ingestão de documentos**: upload, chunking, embeddings automáticos.
- **Fase 3 — Qualidade de vida**: histórico de conversas, busca melhorada, painel
  admin mais completo, métricas de uso.
- **Fase 4 — Hardening/produção**: MFA, auditoria completa, SSO (se necessário),
  revisão de segurança formal (pentest leve).

## 4. Estrutura de agentes de IA (para a implementação, via subagentes)

> **Atualização (2026-07-14):** esta seção evoluiu para o modelo de **empresa de
> software**, com um agente responsável por setor (Documentação, Produto,
> Engenharia, QA, Segurança, DevOps) e engenheiros especialistas. Os agentes
> foram **criados de fato** em `.claude/agents/`. O organograma e o registro
> (roster) oficial vivem em `docs/12-organizacao-agentes-empresa.md` (documento
> vivo, reenviado ao CEO a cada novo cargo/agente). O diagrama abaixo é a
> proposta original, mantida como referência histórica.

Hierarquia proposta para quando formos implementar (nada será criado ainda):

```
                     ┌────────────────────┐
                     │   Orquestrador      │  (você, delegando)
                     │ (este assistente)   │
                     └─────────┬──────────┘
             ┌─────────────────┼─────────────────┬─────────────────┐
             ▼                 ▼                 ▼                 ▼
      ┌────────────┐   ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
      │  Backend    │   │   Frontend/  │   │   RAG/IA     │  │  Segurança   │
      │  Agent      │   │   Design     │   │   Agent      │  │  Agent       │
      │             │   │   Agent      │   │              │  │ (revisão)    │
      └────────────┘   └───────┬──────┘   └──────────────┘  └──────────────┘
                               │ (sub-frente)
                               ▼
                        ┌──────────────┐
                        │  3D/WebGL     │
                        │  Agent        │
                        └──────────────┘
```

### Papéis e responsabilidades
- **Backend Agent**: API, autenticação/autorização, modelo de dados, CRUD do
  dicionário, integração com Postgres/pgvector, endpoint de hotspots do 3D.
- **Frontend/Design Agent**: página HTML/SPA, UI de login/cadastro, tela de chat,
  painel admin, responsividade e acessibilidade.
- **3D/WebGL Agent** (sub-frente do Frontend): Explorador 3D do cockpit —
  renderização do modelo, orbit controls, hotspots, tooltips e a ligação
  hotspot → verbete do dicionário; fallback sem WebGL.
- **RAG/IA Agent**: pipeline de embeddings, chunking, orquestração do prompt para
  o LLM, adapter multi-provedor (Claude/OpenAI), qualidade das respostas.
- **Segurança Agent**: revisão de cada entrega das demais frentes (checklist
  OWASP, checagem de segredos, RBAC, rate limiting) antes de considerar uma fase
  "concluída".

### Regras de delegação
1. O orquestrador nunca implementa diretamente — apenas planeja, divide o
   trabalho em tarefas claras e delega a cada agente especializado.
2. Tarefas independentes (ex.: schema de banco vs. tela de login) podem rodar em
   paralelo.
3. Tarefas dependentes (ex.: frontend do chat depende do contrato da API do
   backend) rodam em sequência, com o contrato de API definido antes.
4. Toda entrega passa pelo Segurança Agent antes de ser considerada pronta.

## 5. Skills a serem criadas (fase de tooling, ainda não implementadas)
- `backend-api`: padrões de código para rotas, validação de entrada, autenticação
  JWT, RBAC — usada pelo Backend Agent.
- `db-schema`: convenções de migração/schema Postgres + pgvector — usada pelo
  Backend Agent e RAG Agent.
- `ui-design-system`: paleta, componentes, acessibilidade e responsividade da
  página HTML — usada pelo Frontend/Design Agent.
- `rag-pipeline`: padrões de chunking, geração de embeddings, prompt template com
  citação de fontes — usada pelo RAG/IA Agent.
- `3d-cockpit`: padrões de renderização 3D (three.js/model-viewer), definição e
  posicionamento de hotspots, ligação hotspot → termo (`slug`), fallback sem
  WebGL — usada pelo 3D/WebGL Agent.
- `security-checklist`: checklist OWASP/ASVS aplicado a cada PR/entrega — usada
  pelo Segurança Agent.

## 6. Perguntas em aberto antes de avançar para a Fase 1
1. ~~Onde o sistema será hospedado~~ — **RESOLVIDA (CEO, 2026-07-24, `D6`):**
   **Cloudflare** (Pages + Workers) + **Supabase** (Postgres gerenciado com
   `pgvector`). Ver `D6` na tabela §1 e roteiro `31` §3. Pendência apenas
   operacional: provisionamento ainda não executado e connectors/MCP de
   Cloudflare/Supabase ainda não conectados ao ambiente.
2. ~~Qual provedor de LLM usar primeiro~~ — **RESOLVIDA (CEO, 2026-07-24, `D5`):**
   **Google Gemini** (modelo "3.1") via API Key, como escolha **provisória**; o
   adapter multi-provedor segue abstrato para trocar depois. Ver `D5` na tabela §1
   e nota operacional/segurança §2.2. Pendência: o CEO ainda não enviou a API Key
   (segredo — nunca no repositório público) e o adapter Gemini ainda não foi
   implementado.
3. ~~Existe algum documento real do setor~~ — **Decidido**: iniciar com dados
   fictícios/de teste no dicionário para validar o fluxo (nenhum dado
   confidencial real será usado até que a estratégia de hospedagem/segurança
   esteja definida).

> Aprovação registrada em 2026-07-13: Briefing, SPEC e PDR aprovados pelo
> stakeholder. Próximo passo: iniciar Fase 1 (MVP) quando solicitado —
> incluindo a decisão de hospedagem e de provedor de LLM.
