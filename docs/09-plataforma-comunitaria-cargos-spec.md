# SPEC — Plataforma Comunitária, Cargos e Contribuição

Status: **rascunho para validação** (ainda só planejamento; nada implementado).
Deriva das decisões de comunidade/cargos do PDR (`03-pdr.md`) e segue os
princípios de extensibilidade da SPEC `08` (§0: fonte única por `slug`,
`metadata jsonb` em toda tabela nova, camadas isoladas).

## 1. Visão geral

A plataforma é **comunitária**: os próprios usuários alimentam três áreas de
conteúdo — **dicionário** (`terms`), **fluxo de trabalho** (`workflows`, novo) e
**especialistas** (diretório do doc `07`/`08`). O que cada usuário pode
adicionar/editar é governado pelo seu **cargo**.

## 2. Modelo de cargos (papéis)

Consolidação dos cargos pedidos com os papéis já existentes (`admin`/`user`):

| Cargo (rótulo pt-BR na UI) | Identificador técnico | Observação |
|---|---|---|
| Usuário comum | `user` | **Default automático no cadastro.** É o `user` já previsto. |
| Coordenador | `coordinator` | Novo papel intermediário: modera conteúdo e atribui cargos. |
| Administrador | `admin` | É o `admin` já existente (mesmo papel, rótulo pt-BR). |

Conjunto final: **`user`, `coordinator`, `admin`** (hierárquico:
admin ⊇ coordinator ⊇ user). O identificador técnico fica em inglês; a UI
mostra o rótulo em português.

### 2.1 Autorização por permissões nomeadas (não por `if role ==`)
RBAC como base + camada fina de **permissões nomeadas** resolvidas por papel.
O código pergunta `can(user, 'dictionary.approve')`, nunca checa o papel direto.
Assim, criar um 4º cargo no futuro é **configuração** (linhas em
`role_permissions`), não deploy de código.

Exemplos de permissões: `dictionary.propose`, `dictionary.edit`,
`dictionary.approve`, `workflow.edit`, `specialist.approve`, `role.assign`.

## 3. Matriz de permissões

Legenda: **V** ver · **P** propor (cria pendência) · **E** editar direto ·
**A** aprovar/rejeitar · **D** excluir. `—` sem permissão.

### Dicionário / Fluxo de trabalho (mesma matriz)
| Cargo | Ver | Propor | Editar direto | Aprovar | Excluir |
|---|---|---|---|---|---|
| user | V | P | — | — | — |
| coordinator | V | P | E | A | D (soft) |
| admin | V | P | E | A | D |

### Especialistas / diretório (dados pessoais — LGPD)
| Cargo | Ver | Propor | Editar direto | Aprovar | Excluir |
|---|---|---|---|---|---|
| user | V | P¹ | — | — | — |
| coordinator | V | P | E | A | D (soft, `active=false`) |
| admin | V | P | E | A | D |

¹ Propostas envolvendo **pessoas/contatos** exigem aprovação **sempre**
(inclusive de coordenador), por serem dados pessoais.

### Atribuição de cargos (governança)
| Cargo | Ver cargos | Atribuir/alterar cargo de outros |
|---|---|---|
| user | só o próprio | — |
| coordinator | sim | **Sim** — `user` ↔ `coordinator` |
| admin | sim | **Sim** — qualquer cargo, inclusive `admin` |

Regras de segurança (anti-escalonamento de privilégio):
- Somente `coordinator` e `admin` atribuem/alteram cargos (**requisito central**).
- `coordinator` **não** promove ninguém a `admin` nem edita um `admin`.
- Ninguém altera o **próprio** cargo.
- Toda mudança de cargo é registrada no `audit_log` (quem, valor antigo/novo).

## 4. Fluxo de contribuição e moderação (híbrido por cargo)

- `user` → **propor-e-aprovar** (moderado): a contribuição vira pendência e
  **não** afeta o conteúdo público até aprovação. Adequado ao ambiente
  corporativo/confidencial.
- `coordinator`/`admin` → **edição direta** (gravada e versionada), pois já são
  a autoridade de revisão. Tudo fica no histórico para auditoria/rollback.
- **Exceção LGPD**: contribuições sobre `people` são sempre moderadas.

### Máquina de estados da proposta
`pending → approved | rejected | withdrawn`
- **pending**: criada por `user`; visível ao autor e revisores, fora do público.
- **approved**: revisor aplica o `payload` à entidade-alvo, cria uma revisão de
  conteúdo e marca a proposta (`reviewed_by`, `reviewed_at`).
- **rejected**: revisor recusa com `review_note` obrigatória (feedback ao autor).
- **withdrawn**: autor cancela a própria proposta.

Recomendação anti-conflito: quando houver ≥2 revisores, aprovador ≠ autor;
auto-aprovação de `admin` é permitida, mas registrada na auditoria.

## 5. Nova entidade: Fluxo de trabalho (`workflows`)

Novo tipo de conteúdo, modelado espelhando `terms` para reaproveitar RAG,
versionamento e o elo por `slug`.

```
workflows (
  id            uuid pk,
  slug          text unique,     -- elo estável (RAG, links, futuros hotspots)
  title         text,
  description   text,
  category      text,            -- reusa a ideia de terms.category
  steps         jsonb,           -- [{ordem, titulo, detalhe, term_slug?}]
  related_terms text[],          -- term_slugs relacionados (liga ao dicionário)
  status        text,            -- 'published' | 'draft'
  created_by    uuid fk users(id),
  metadata      jsonb,
  created_at    timestamptz,
  updated_at    timestamptz
)
```
- Um passo pode referenciar um termo (`term_slug`) → reaproveita a fonte única
  da verdade já usada por hotspots/especialistas.
- Entra no pipeline RAG como as demais fontes (decisão do RAG Agent: chunks em
  `document_chunks` ou coluna `embedding` própria).

## 6. Modelo de dados — cargos, contribuição e histórico

Todas as tabelas novas com `metadata jsonb` + `created_at`/`updated_at`.

### 6.1 Cargos e permissões (abordagem A — recomendada no MVP)
```
users.role        -- enum: 'user' | 'coordinator' | 'admin' (default 'user')

role_permissions (
  role        text,   -- 'user' | 'coordinator' | 'admin'
  permission  text,   -- 'dictionary.approve', 'role.assign', ...
  primary key (role, permission)
)
```
`role_permissions` é dado semente, editável sem migração. Futuro (abordagem B,
só se surgirem cargos dinâmicos): `roles` + `user_roles` (N:N) +
`role_permissions(role_id, permission)` — migração direta, **não fazer agora**.

### 6.2 Propostas comunitárias
```
contributions (
  id          uuid pk,
  author_id   uuid fk users(id),
  target_type text,       -- 'term' | 'workflow' | 'person' | 'sector' | ...
  target_id   uuid null,  -- nulo se action='create'
  action      text,       -- 'create' | 'update' | 'delete'
  payload     jsonb,      -- estado proposto
  status      text,       -- 'pending' | 'approved' | 'rejected' | 'withdrawn'
  review_note text null,
  reviewed_by uuid null fk users(id),
  reviewed_at timestamptz null,
  metadata    jsonb,
  created_at  timestamptz, updated_at timestamptz
)
```

### 6.3 Versionamento de conteúdo (rollback)
```
content_revisions (
  id              uuid pk,
  target_type     text,   -- 'term' | 'workflow' | 'person' | ...
  target_id       uuid,
  revision_number int,    -- sequencial por (target_type, target_id)
  snapshot        jsonb,  -- estado COMPLETO da entidade após a mudança
  change_summary  text,
  edited_by       uuid fk users(id),
  contribution_id uuid null fk contributions(id),
  metadata        jsonb,
  created_at      timestamptz
)
```
Rollback = criar nova revisão com o `snapshot` de uma anterior (nunca apaga
histórico). Só `coordinator`/`admin`.

### 6.4 Auditoria transversal (segurança/compliance, append-only)
```
audit_log (
  id          uuid pk,
  actor_id    uuid fk users(id),
  action      text,   -- 'role.assign','contribution.approve','term.delete',...
  target_type text, target_id text,
  before      jsonb null, after jsonb null,
  ip          inet null, metadata jsonb,
  created_at  timestamptz
)
```
Divisão de papéis: `content_revisions` responde "qual era o conteúdo e como
volto"; `audit_log` responde "quem fez a ação e quando" (inclui mudança de
cargo, rejeição, login sensível). Toda atribuição de cargo grava aqui.

Índices: `contributions(status, target_type)` (fila de moderação),
`content_revisions(target_type, target_id, revision_number)`,
`audit_log(actor_id, created_at)`.

### 6.5 Ajustes leves no modelo existente
- Adicionar `metadata jsonb` às tabelas do `02-spec.md` quando forem tocadas.
- Soft delete (`deleted_at`/`active`) em `terms` e `workflows`: coordenador
  exclui via soft delete; hard delete só `admin`.

## 7. Segurança e privacidade
- Autorização sempre via resolvedor central `can(user, permission)`.
- Anti-escalonamento de privilégio (regras da §3).
- LGPD: área de especialistas sempre moderada; dados pessoais só a autenticados.
- `audit_log` append-only; política de retenção na fase de hardening.

## 8. Extensibilidade e trade-offs
- **Permissões nomeadas** → novos cargos/áreas são configuração, não código.
- **`target_type` polimórfico** em contribuições/revisões/auditoria → qualquer
  nova área de conteúdo entra no mesmo fluxo sem novas tabelas de histórico.
- **`metadata jsonb`** e **elo por `slug`** em tudo que é novo.
- Trade-offs assumidos: snapshot completo (rollback simples, mais storage);
  RBAC+permissões em vez de ABAC (menos poder, muito menos complexidade);
  contribuição híbrida (mais atrito para `user`, exigido por confidencialidade).

### Riscos e mitigação
| Risco | Impacto | Mitigação |
|---|---|---|
| Escalonamento de privilégio | Alto | Coordenador não toca em `admin`; ninguém muda o próprio cargo; auditoria de cargos |
| Fila de moderação vira gargalo | Médio | Direct-write para coordenador/admin; vários coordenadores por área; métricas (fase 3) |
| Vandalismo/erro em conteúdo | Médio | `content_revisions` + rollback; proposta de `user` não afeta público antes de aprovar |
| Dados pessoais editados sem controle (LGPD) | Alto | Especialistas sempre moderado; só a autenticados; `active=false`; auditoria |
| Explosão de cargos/permissões | Médio | Manter 3 cargos; granularidade via permissões configuráveis |

## 9. Encaixe no roadmap
- **Fase 1**: enum de 3 cargos + `role_permissions` + `can()`; `workflows` com
  contribuição moderada; `contributions` + `content_revisions` básicos.
- **Fase 3**: fila de moderação no painel, rollback na UI, notificações, métricas.
- **Fase 4**: `audit_log` completo, retenção, eventual migração para cargos
  dinâmicos (abordagem B) se o negócio exigir.

## 10. Perguntas em aberto
1. `coordinator` pode excluir conteúdo (soft delete) ou apenas `admin`?
2. Aprovação exige revisor ≠ autor sempre, ou só quando houver ≥2 revisores?
3. `fluxo de trabalho` entra no RAG desde o MVP ou em fase posterior?
