# PDR — Product Decision Record

## 1. Decisões tomadas
| # | Decisão | Status |
|---|---|---|
| D1 | Escopo v1 = multiusuário completo (cadastro, login, papéis admin/user) | Confirmado |
| D2 | Fonte do dicionário = cadastro manual + ingestão de documentos (híbrido) | Confirmado |
| D3 | Segurança é requisito de primeira classe (dado ambiente empresarial) | Confirmado |
| D4 | Stack: Node.js/TS + Postgres/pgvector + adapter de LLM | Recomendado — aguardando confirmação final |
| D5 | Provedor de LLM (Claude vs. OpenAI) | Em aberto — abstraído via adapter para não bloquear o desenvolvimento |
| D6 | Estratégia de hospedagem (on-prem vs. cloud privada vs. local via Docker) | Em aberto — impacta diretamente a arquitetura de segurança |
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

## 2. Riscos e mitigação
| Risco | Impacto | Mitigação |
|---|---|---|
| Vazamento de dados confidenciais do setor | Alto | RBAC, criptografia em trânsito/repouso, revisão de segurança antes de cada release, sem dados reais em ambiente de teste |
| Alucinação do chatbot (resposta incorreta sobre sigla/processo) | Médio | RAG restrito ao contexto recuperado + citar fontes; admin revisa termos |
| Dependência de um único provedor de LLM | Médio | Camada de adapter (`LlmProvider`) desacoplada |
| Escopo crescer demais para "uso pessoal" | Médio | Fases bem definidas (MVP primeiro, ingestão de documentos depois) |
| Explorador 3D pesar/atrasar o MVP ou não rodar em máquinas fracas | Médio | MVP com modelo leve/placeholder, compressão Draco, fallback em imagem clicável (image-map) sem WebGL |
| Uso de asset 3D/imagem sem licença adequada | Médio | Usar modelo genérico de licença livre; imagem oficial só como referência interna, não redistribuída |

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
1. ~~Onde o sistema será hospedado~~ — **Decisão adiada**: definir hospedagem
   (Docker local, VPS próprio ou cloud privada) apenas no início da Fase 1,
   quando houver mais clareza sobre quem vai acessar o sistema e de onde.
2. Qual provedor de LLM usar primeiro (Claude ou OpenAI), mesmo que a
   arquitetura suporte trocar depois? — **ainda em aberto**.
3. ~~Existe algum documento real do setor~~ — **Decidido**: iniciar com dados
   fictícios/de teste no dicionário para validar o fluxo (nenhum dado
   confidencial real será usado até que a estratégia de hospedagem/segurança
   esteja definida).

> Aprovação registrada em 2026-07-13: Briefing, SPEC e PDR aprovados pelo
> stakeholder. Próximo passo: iniciar Fase 1 (MVP) quando solicitado —
> incluindo a decisão de hospedagem e de provedor de LLM.
