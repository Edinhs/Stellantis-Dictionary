# Organização de Agentes — "Empresa de Software" do projeto

> Documento **vivo**. É o organograma + registro (roster) oficial dos agentes e
> cargos. **Sempre que criarmos um novo cargo ou agente, este documento é
> atualizado e reenviado ao CEO.**
> Última atualização: 2026-07-14.

## 1. Estudo de caso — por que organizar como empresa

Até aqui os agentes eram uma lista solta no PDR (`03-pdr.md` §4). Ao crescer o
escopo (comunidade, cargos, Q&A, diretório de especialistas), a coordenação
"tudo no orquestrador" vira gargalo. A solução adotada é o modelo de uma
**empresa de software**: setores (departamentos) com um **agente responsável
(lead)** cada, que domina seu domínio e pode **criar sub-agentes especialistas**
sob demanda.

Benefícios: (1) responsabilidade clara por setor; (2) paralelismo entre
departamentos independentes; (3) especialização (cada agente é focado); (4)
extensibilidade — abrir um novo setor = adicionar um lead, sem reescrever os
demais; (5) governança — toda entrega passa por QA e Segurança antes de "pronto".

## 2. Organograma

```
                         ┌──────────────────────┐
                         │        CEO           │  (o usuário)
                         │   visão e decisão     │
                         └──────────┬───────────┘
                                    │ direção
                         ┌──────────▼───────────┐
                         │   Agente Geral        │  (este assistente)
                         │  orquestrador / CTO   │  planeja, delega, integra
                         └──────────┬───────────┘
        ┌──────────┬───────────┬────┴─────┬───────────┬───────────┐
        ▼          ▼           ▼          ▼           ▼           ▼
   ┌─────────┐┌─────────┐┌──────────┐┌────────┐┌──────────┐┌──────────┐
   │Documen- ││Produto  ││Engenharia││  QA /   ││Segurança ││ DevOps / │
   │ tação   ││ (PM)    ││  (Eng)   ││Qualidade││          ││  Infra   │
   │ Lead    ││ Lead    ││  Lead    ││ Lead    ││ Lead     ││ Lead     │
   └─────────┘└─────────┘└────┬─────┘└────────┘└──────────┘└──────────┘
                              │ sub-agentes especialistas
        ┌──────────┬──────────┼──────────┬──────────────┐
        ▼          ▼          ▼          ▼              ▼
   ┌─────────┐┌─────────┐┌──────────┐┌──────────┐  (novos conforme
   │ Backend ││Frontend ││ 3D/WebGL ││  RAG/IA  │   a necessidade)
   │Engineer ││Engineer ││ Engineer ││ Engineer │
   └─────────┘└─────────┘└──────────┘└──────────┘
```

## 3. Cadeia de comando e regras

1. **CEO (usuário)** define visão, prioridades e aprova decisões de alto nível.
2. **Agente Geral (este assistente)** traduz a visão em plano, **delega** aos
   leads e **integra** as entregas. Não implementa detalhe quando pode delegar.
3. **Leads de setor** são donos do seu domínio; podem **criar sub-agentes**
   especialistas quando a tarefa justificar (via ferramenta de Agent).
4. **Sub-agentes** são especialistas focados numa função; devolvem o resultado
   ao seu lead.
5. **Regra de qualidade**: nenhuma entrega é "concluída" sem passar por **QA** e,
   quando toca dados/segurança, pelo **Segurança Lead**.
6. **Regra de planejamento**: enquanto o projeto estiver em fase de planejamento,
   os agentes produzem docs/planos, não código de produção.
7. **Segredos**: nenhum agente commita segredos (API keys, tokens) — sempre via
   variáveis de ambiente.

## 3.1. Protocolo de delegação obrigatória

**Regra (efetiva a partir de 2026-07-14).** Todo prompt que chega ao projeto é
**delegado pelo Agente Geral ao(s) agente(s) de setor apropriado(s)** via a
ferramenta Agent, em vez de executado diretamente. O Agente Geral atua como
**orquestrador**: interpreta o pedido, escolhe o setor, delega, integra as
entregas e responde ao CEO — mas **não executa o trabalho de setor por conta
própria** quando há um lead responsável por aquele domínio.

**Mecanismo.** A regra é reforçada por um hook `UserPromptSubmit` configurado em
`.claude/settings.json`, que **injeta um lembrete de delegação a cada turno**.
O hook passa a valer **na próxima sessão** (ou após recarregar a configuração via
`/hooks`), garantindo que a orquestração por delegação seja o comportamento padrão
e não dependa de o Agente Geral "lembrar" da regra.

**Como escolher o setor.** A seleção segue a natureza do pedido:

| Natureza do pedido | Agente de setor |
|---|---|
| Documentação (PDR, SPEC, ADR, backlog, changelog) | `doc-lead` |
| Requisitos, priorização, escopo, critérios de aceite | `product-lead` |
| Arquitetura, contratos de API, implementação | `eng-lead` (delega aos engenheiros) |
| Testes, verificação, regressão, "pronto?" | `qa-lead` |
| Segurança, OWASP/ASVS, LGPD, RBAC, segredos | `security-lead` |
| Docker, CI/CD, ambientes, observabilidade | `devops-lead` |

Quando um pedido **abrange vários setores**, o Agente Geral aciona **múltiplos
agentes** (em paralelo quando independentes) e integra os resultados antes de
responder.

**Exceções tratadas direto pelo orquestrador.** O Agente Geral responde sem
delegar apenas em dois casos:
1. **Interações triviais** — saudações, confirmações e esclarecimentos de escopo
   que não produzem entrega de setor.
2. **Organização/configuração da própria "empresa"** — decisões sobre o
   organograma, criação/ajuste de cargos e agentes, cadeia de comando e
   configuração de orquestração (incluindo este documento e os hooks).

## 4. Registro (roster) de agentes

Arquivos de definição em `.claude/agents/`. Cada linha = um cargo/agente ativo.

| Cargo / Agente | Arquivo | Reporta a | Missão resumida | Pode criar sub-agentes? |
|---|---|---|---|---|
| **CEO** | — (o usuário) | — | Visão, prioridade, aprovação | — |
| **Agente Geral** | (este assistente) | CEO | Orquestra, delega, integra | Sim |
| Documentação Lead | `doc-lead.md` | Agente Geral | PDRs, SPECs, ADRs, backlog, changelog | Sim |
| Produto Lead | `product-lead.md` | Agente Geral | Requisitos, priorização, backlog, aceite | Sim |
| Engenharia Lead | `eng-lead.md` | Agente Geral | Coordena implementação; contratos de API | Sim |
| QA Lead | `qa-lead.md` | Agente Geral | Testes, verificação, critérios de aceite | Sim |
| Segurança Lead | `security-lead.md` | Agente Geral | Revisão de segurança, OWASP, LGPD, RBAC | Sim |
| DevOps Lead | `devops-lead.md` | Agente Geral | Docker, CI/CD, ambientes, observabilidade | Sim |
| Backend Engineer | `backend-engineer.md` | Engenharia Lead | API, auth, modelo de dados, Postgres | Sob demanda |
| Frontend Engineer | `frontend-engineer.md` | Engenharia Lead | SPA, telas, acessibilidade, responsividade | Sob demanda |
| 3D/WebGL Engineer | `threed-engineer.md` | Engenharia Lead | Explorador 3D, hotspots, fallback | Sob demanda |
| RAG/IA Engineer | `rag-engineer.md` | Engenharia Lead | Embeddings, chunking, adapter de LLM | Sob demanda |

## 5. Mapa setor → responsabilidades → docs/skills

| Setor | Responsável | Docs de referência | Skills previstas (PDR §5) |
|---|---|---|---|
| Documentação | Documentação Lead | todos os `docs/` | — |
| Produto | Produto Lead | `01-briefing`, `03-pdr`, `04-tasks` | — |
| Engenharia | Engenharia Lead | `02-spec`, `08`, `09`, `11` | — |
| Backend | Backend Engineer | `02-spec` §3–4, `09` | `backend-api`, `db-schema` |
| Frontend | Frontend Engineer | `02-spec` §3, protótipos | `ui-design-system` |
| 3D/WebGL | 3D/WebGL Engineer | `05-cockpit-3d-reference`, `08` | `3d-cockpit` |
| RAG/IA | RAG/IA Engineer | `02-spec` §3.4, `11` §4 | `rag-pipeline` |
| QA | QA Lead | `04-tasks` (critérios) | — |
| Segurança | Segurança Lead | `02-spec` §3.6, `09` §7 | `security-checklist` |
| DevOps | DevOps Lead | `02-spec` §5 | — |

## 6. Como abrir um novo setor/cargo (extensibilidade)

1. Definir missão, a quem reporta e se pode criar sub-agentes.
2. Criar o arquivo `.claude/agents/<nome>.md` (frontmatter + system prompt).
3. Adicionar a linha no roster (§4) e no mapa (§5).
4. Atualizar a data no topo e **reenviar este documento ao CEO**.

## 7. Histórico de mudanças
- 2026-07-14 — Criação da estrutura de empresa: 6 leads (Documentação, Produto,
  Engenharia, QA, Segurança, DevOps) + 4 engenheiros especialistas (Backend,
  Frontend, 3D/WebGL, RAG/IA).
- 2026-07-14 — Instituída a **regra de delegação obrigatória** (§3.1): todo prompt
  é delegado pelo Agente Geral ao(s) agente(s) de setor via ferramenta Agent, com
  reforço por hook `UserPromptSubmit` em `.claude/settings.json`; exceções apenas
  para interações triviais e para organização/configuração da própria "empresa".
