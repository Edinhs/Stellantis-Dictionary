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

## 2. Riscos e mitigação
| Risco | Impacto | Mitigação |
|---|---|---|
| Vazamento de dados confidenciais do setor | Alto | RBAC, criptografia em trânsito/repouso, revisão de segurança antes de cada release, sem dados reais em ambiente de teste |
| Alucinação do chatbot (resposta incorreta sobre sigla/processo) | Médio | RAG restrito ao contexto recuperado + citar fontes; admin revisa termos |
| Dependência de um único provedor de LLM | Médio | Camada de adapter (`LlmProvider`) desacoplada |
| Escopo crescer demais para "uso pessoal" | Médio | Fases bem definidas (MVP primeiro, ingestão de documentos depois) |

## 3. Roadmap por fases
- **Fase 0 — Documentação (atual)**: Briefing, SPEC, PDR, definição de agentes/skills.
- **Fase 1 — MVP**: auth multiusuário, CRUD de termos, chatbot RAG básico sobre
  termos cadastrados manualmente, interface web mínima.
- **Fase 2 — Ingestão de documentos**: upload, chunking, embeddings automáticos.
- **Fase 3 — Qualidade de vida**: histórico de conversas, busca melhorada, painel
  admin mais completo, métricas de uso.
- **Fase 4 — Hardening/produção**: MFA, auditoria completa, SSO (se necessário),
  revisão de segurança formal (pentest leve).

## 4. Estrutura de agentes de IA (para a implementação, via subagentes)

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
      └────────────┘   └──────────────┘   └──────────────┘  └──────────────┘
```

### Papéis e responsabilidades
- **Backend Agent**: API, autenticação/autorização, modelo de dados, CRUD do
  dicionário, integração com Postgres/pgvector.
- **Frontend/Design Agent**: página HTML/SPA, UI de login/cadastro, tela de chat,
  painel admin, responsividade e acessibilidade.
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
