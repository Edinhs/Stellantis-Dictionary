# 28 — Regras de Negócio (Etapa 4)

Status: **aprovado — gate 4 (Regras de Negócio), 2026-07-17** (Produto Lead; DoD verificada por QA). Ver log `27` §5.
> Última atualização: 2026-07-17.
> Autoria: Analista de Requisitos (`requirements-analyst`), reporta ao Produto Lead
> (aprovador do gate da Etapa 4 do ciclo `14-ciclo-de-vida-engenharia.md`).
> Cobre a **Etapa 4 (Regras de Negócio)** do ciclo `14` §2 — consolida num só lugar
> as regras hoje **implícitas** nas SPECs, no formato **gatilho → condição →
> efeito**, cada uma ligada aos RF do doc `21` e à SPEC de origem por número
> (doc-standards §4). **Não redecide** nada: o que não está decidido pelo CEO vira
> pergunta em aberto (§9).
> Entradas: `21-requisitos-funcionais.md` (RF), `15-casos-de-uso.md` (CU),
> `09-plataforma-comunitaria-cargos-spec.md` (RBAC/moderação/cargos),
> `11-comunidade-qa-spec.md` (Q&A), `25-arquitetura-revisao-escopo-prototipo.md`
> (invariante da gamificação §4/S4, `target_type` expandido §5),
> `24-parecer-seguranca-prototipo.md` (LGPD), `03-pdr.md` (`Dxx`).

## 0. Como ler

- Cada regra tem **ID `RN-NN`**, no formato **Gatilho → Condição → Efeito**.
- **Rastreabilidade:** cada regra aponta os **RF** cobertos (doc `21`) e a **fonte**
  (SPEC/§). Regras que valem só na **visão-alvo** (não no protótipo `localStorage`
  sem auth) são marcadas **[ALVO]**; as observáveis no protótipo, **[PROTÓTIPO]**.
- Nomes de permissões/campos em crase: `can()`, `contributions.status`,
  `target_type`, `term_slug`.
- Regra transversal-mãe: **toda decisão de autorização passa por
  `can(user, permission)` — nunca `if role ==`** (SPEC `09` §2.1; doc `25` §4).

---

## 1. Autorização, cargos e RBAC (`can()`)
> Fonte: SPEC `09` §2/§2.1/§3; PDR `03` D12/D13; RF-063 [FUTURO]. Doc `25` §4 (S4).

### RN-01 — Cargo default no cadastro [ALVO]
- **Gatilho:** um Visitante conclui o cadastro (CU-01).
- **Condição:** e-mail ainda não cadastrado; nenhum cargo informado.
- **Efeito:** a conta é criada com cargo **`user`** (default automático).
- **RF:** RF-062, RF-063. **Fonte:** SPEC `09` §2 (tabela de cargos); PDR `03` D12.

### RN-02 — Autorização só por permissão nomeada [ALVO]
- **Gatilho:** qualquer rota de escrita/moderação/gestão é invocada.
- **Condição:** sempre.
- **Efeito:** a ação é liberada **se e somente se** `can(user, '<area>.<acao>')` for
  verdadeiro para o cargo do usuário; o código **nunca** compara `role` diretamente.
  Cargos são hierárquicos (`admin ⊇ coordinator ⊇ user`).
- **RF:** RF-063. **Fonte:** SPEC `09` §2.1/§3; doc `25` §4; PDR `03` D13.

### RN-03 — Matriz de permissões de conteúdo (dicionário/workflow e módulos novos) [ALVO]
- **Gatilho:** `user`/`coordinator`/`admin` tenta ver/propor/editar/aprovar/excluir
  conteúdo compartilhado (termo, workflow, projeto, componente, automação, canal,
  kit, nó de organograma).
- **Condição:** conforme a matriz da SPEC `09` §3, estendida pelos `target_type` do
  doc `25` §5.
- **Efeito:**
  - `user`: **Ver** e **Propor** (cria pendência); **não** edita direto nem aprova.
  - `coordinator`: Ver, Propor, **Editar direto**, **Aprovar/Rejeitar**, **Excluir
    (soft)**.
  - `admin`: tudo, incluindo **hard delete**.
- **RF:** RF-006, RF-007, RF-039, RF-040, RF-042, RF-043, RF-045, RF-046, RF-063,
  RF-064. **Fonte:** SPEC `09` §3; doc `25` §5.

### RN-04 — Atribuição de cargos e anti-escalonamento [ALVO]
- **Gatilho:** alguém tenta atribuir/alterar o cargo de outro usuário (`role.assign`).
- **Condição:** apenas `coordinator` ou `admin`; `coordinator` só entre `user ↔
  coordinator`.
- **Efeito:** a mudança é aplicada; se violar as travas, é **negada**. Travas duras:
  (a) `coordinator` **não** promove ninguém a `admin` nem edita um `admin`;
  (b) **ninguém** altera o próprio cargo; (c) toda mudança grava em `audit_log`
  (ator, valor antigo/novo).
- **RF:** RF-063. **Fonte:** SPEC `09` §3 (governança) e §7.

---

## 2. Cocriação, moderação e máquina de estados
> Fonte: SPEC `09` §4/§6; doc `25` §5; RF-064 [FUTURO]. PDR `03` D14/D16.

### RN-05 — Cocriação de `user` entra como proposta (propor-e-aprovar) [ALVO]
- **Gatilho:** um `user` cria/edita/remove conteúdo compartilhado (qualquer
  `target_type` de RN-03).
- **Condição:** cargo = `user`.
- **Efeito:** gera uma linha em `contributions` com `status='pending'`; **não** afeta
  o conteúdo público até aprovação. Fica visível ao autor e aos revisores.
- **RF:** RF-006, RF-007, RF-039..RF-043, RF-046, RF-064. **Fonte:** SPEC `09` §4;
  doc `25` §5. **Nota:** no protótipo a cocriação publica **direto, sem revisão**
  (RF-006/RF-007 observações; doc `20` §6) — divergência reconciliada nesta regra.

### RN-06 — Edição direta de `coordinator`/`admin` [ALVO]
- **Gatilho:** `coordinator`/`admin` edita conteúdo compartilhado.
- **Condição:** `can(user, '<area>.edit')` verdadeiro.
- **Efeito:** a mudança é gravada **direto** e **versionada** em `content_revisions`
  (snapshot completo); sem passar por fila.
- **RF:** RF-007, RF-063, RF-064. **Fonte:** SPEC `09` §4/§6.3.

### RN-07 — Máquina de estados da proposta [ALVO]
- **Gatilho:** transição de estado de uma `contribution`.
- **Condição:** transições válidas: `pending → approved | rejected | withdrawn`.
- **Efeito:**
  - **approved:** revisor aplica o `payload` à entidade-alvo, cria uma
    `content_revisions` e marca `reviewed_by`/`reviewed_at`.
  - **rejected:** exige `review_note` (feedback ao autor).
  - **withdrawn:** somente o **próprio autor** cancela sua proposta.
  - Qualquer outra transição é **inválida** (negada).
- **RF:** RF-064. **Fonte:** SPEC `09` §4 (máquina de estados).

### RN-08 — Revisor ≠ autor (anti-conflito) [ALVO]
- **Gatilho:** aprovação de uma proposta.
- **Condição:** havendo ≥2 revisores disponíveis.
- **Efeito:** o aprovador **deve** ser diferente do autor; auto-aprovação de `admin`
  é permitida mas **registrada em `audit_log`**.
- **RF:** RF-064. **Fonte:** SPEC `09` §4. *(Ver pergunta em aberto §9.2 — "sempre" ×
  "só com ≥2 revisores".)*

### RN-09 — Exclusão é soft-delete; rollback preserva histórico [ALVO]
- **Gatilho:** exclusão de conteúdo ou reversão de edição.
- **Condição:** `coordinator` só faz **soft delete** (`deleted_at`/`active=false`);
  **hard delete** só `admin`. Rollback só `coordinator`/`admin`.
- **Efeito:** exclusão marca o registro como inativo (some da UI, permanece
  auditável); rollback cria **nova revisão** a partir de um `snapshot` anterior —
  **nunca** apaga `content_revisions`.
- **RF:** RF-007, RF-063, RF-064. **Fonte:** SPEC `09` §6.3/§6.5.

### RN-10 — Trilha de auditoria append-only [ALVO]
- **Gatilho:** ação sensível (atribuição de cargo, aprovação/rejeição, exclusão,
  moderação, login sensível).
- **Condição:** sempre.
- **Efeito:** grava em `audit_log` (ator, ação, alvo, `before`/`after`, ip); registro
  **append-only** (nunca alterado/removido).
- **RF:** RF-064. **Fonte:** SPEC `09` §6.4.

---

## 3. Comunidade / Q&A (moderação leve)
> Fonte: SPEC `11` §2/§5; RF-067 [FUTURO]. PDR `03` D17.

### RN-11 — Publicação direta com moderação reativa [ALVO]
- **Gatilho:** `user` pergunta/responde/comenta na Comunidade.
- **Condição:** `can(user, 'qa.ask'|'qa.answer'|'qa.comment')`.
- **Efeito:** o conteúdo é **publicado direto** (sem fila propor-e-aprovar); o
  controle é **reativo** — reportar + moderar depois. (Diferente de RN-05, que é
  preventivo para conteúdo canônico.)
- **RF:** RF-067. **Fonte:** SPEC `11` §2 (nota "moderação leve").

### RN-12 — Voto: um por alvo, sem auto-voto [ALVO]
- **Gatilho:** usuário vota em pergunta/resposta.
- **Condição:** o alvo **não** é de sua autoria; ainda não votou nesse alvo.
- **Efeito:** registra `qa_votes` (+1/−1), único por `(target, user)`; auto-voto é
  **bloqueado** por constraint; recontagem atualiza o cache `score`.
- **RF:** RF-067. **Fonte:** SPEC `11` §2/§3/§5.

### RN-13 — Aceitar resposta [ALVO]
- **Gatilho:** aceitar uma resposta como solução.
- **Condição:** `user` só na **própria** pergunta; `coordinator`/`admin` em qualquer.
- **Efeito:** marca `is_accepted` e `accepted_answer_id` (**no máximo uma** aceita
  por pergunta, escrita transacional); status da pergunta pode ir a `resolved`.
- **RF:** RF-067. **Fonte:** SPEC `11` §2/§3.

### RN-14 — Moderação e gestão de tags [ALVO]
- **Gatilho:** ocultar/fechar/reabrir/excluir conteúdo, ou criar/renomear/fundir tag.
- **Condição:** `qa.moderate`/`qa.tag_manage` — só `coordinator`/`admin`; `user` só
  **reporta** e **aplica tags existentes**.
- **Efeito:** ação de moderação aplicada (exclusão sempre **soft-delete**) e gravada
  em `audit_log`; auto-ocultação temporária ao atingir N reports distintos até
  revisão.
- **RF:** RF-067. **Fonte:** SPEC `11` §2/§5.

---

## 4. Gamificação — engajamento, nunca permissão (invariante)
> Fonte: doc `25` §4 (invariante) e S4; briefing `01` §3.1/§8; RF-056..RF-061.

### RN-15 — Gamificação não concede acesso (invariante duro) [PROTÓTIPO/ALVO]
- **Gatilho:** um usuário sobe de nível, ganha XP ou desbloqueia insígnia.
- **Condição:** sempre.
- **Efeito:** **nenhuma** permissão/acesso é concedido ou alterado. O nível/cargo de
  gamificação é **rótulo de engajamento**, desacoplado do `role` de RBAC; o módulo
  `gamification` **nunca** alimenta `can()`. Autorização segue **exclusivamente** as
  regras da §1.
- **RF:** RF-056, RF-057, RF-059, RF-060. **Fonte:** doc `25` §4 (S4); briefing `01`
  §3.1/§8 Q2.

### RN-16 — +50 XP por cocriação [PROTÓTIPO]
- **Gatilho:** conclusão de uma ação de cocriação (termo, canal, kit, projeto,
  automação, componente, especialista, flashcard).
- **Condição:** a cocriação foi salva com sucesso.
- **Efeito:** `userXp += 50`, persiste, registra a entrada na timeline (RN-19) e pode
  disparar level-up (RN-18).
- **RF:** RF-058, RF-006, RF-036, RF-039, RF-040, RF-042, RF-043, RF-046, RF-061.
  **Fonte:** RF-058 (doc `21` §8); doc `20` §3. **Nota [ALVO]:** quando a cocriação
  de `user` for **moderada** (RN-05), a política de **quando** creditar XP
  (na proposta × na aprovação) é pergunta em aberto §9.4.

### RN-17 — +350 XP por conclusão de curso (idempotente) [PROTÓTIPO]
- **Gatilho:** marcar um curso técnico (Bio-Hybrid/ADAS/MultiAir) como concluído.
- **Condição:** o curso **ainda não** havia sido concluído.
- **Efeito:** `userXp += 350`, ativa a insígnia técnica correspondente e pode disparar
  level-up. Concluir o **mesmo** curso de novo **não** concede XP (idempotência).
- **RF:** RF-037, RF-038, RF-060. **Fonte:** RF-038 (doc `21` §5); doc `20` §3.

### RN-18 — Level-up ao atingir o teto do nível [PROTÓTIPO]
- **Gatilho:** `userXp` é atualizado.
- **Condição:** `userXp >= maxXp` do nível corrente. Tetos: **1500** por padrão;
  **2500** no nível 4 (`userLevel === 4`).
- **Efeito:** `userLevel` incrementa, o **XP excedente** transita para o próximo
  nível, promove cargo/insígnia de patente e emite notificação.
- **RF:** RF-056, RF-057. **Fonte:** RF-056/RF-057 (doc `21` §8); doc `20` §3.
  *(RN-15: essa promoção não altera RBAC.)*

### RN-19 — Timeline de contribuições [PROTÓTIPO]
- **Gatilho:** qualquer cocriação (RN-16) ou conclusão de curso (RN-17).
- **Condição:** ação concluída/persistida.
- **Efeito:** cria uma entrada datada na timeline do perfil, persistida e reexibida
  ao reabrir.
- **RF:** RF-061. **Fonte:** RF-061 (doc `21` §8); doc `20` §3.

### RN-20 — Conteúdo pessoal não passa por moderação [ALVO]
- **Gatilho:** criar/editar **flashcard** (RF-035/RF-036) ou **nota de notebook**
  (RF-030..RF-034).
- **Condição:** conteúdo **pessoal/privado** (não compartilhado).
- **Efeito:** **não** entra no fluxo de `contributions`/moderação (RN-05); mas a
  escrita ainda exige `can()` sobre o **próprio** recurso (dono só edita o seu).
- **RF:** RF-030..RF-036. **Fonte:** doc `25` §5 (exceção deliberada).

---

## 5. Cocriação e `target_type` expandido
> Fonte: doc `25` §5; SPEC `09` §6.2/§8.

### RN-21 — `target_type` polimórfico absorve os módulos novos [ALVO]
- **Gatilho:** cocriação de qualquer entidade compartilhada dos módulos do protótipo.
- **Condição:** o tipo é um dos `target_type` suportados: `term`, `workflow`,
  `person`, mais os novos **`project`, `component`, `automation`, `channel`,
  `kit_item`, `org_node`**.
- **Efeito:** a entidade entra no **mesmo** fluxo de `contributions` +
  `content_revisions` + `audit_log`, **sem** novas tabelas de histórico/moderação
  (reuso). Cada rota declara sua permissão nomeada `<area>.<acao>` e chama `can()`.
- **RF:** RF-039..RF-046, RF-063, RF-064. **Fonte:** doc `25` §5; SPEC `09` §8.

---

## 6. RAG — citação de fontes e anti-alucinação
> Fonte: SPEC `02` §3.3/§3.4; SPEC `11` §4; RF-068 [FUTURO]; briefing `01` §7; doc
> `26` R3.

### RN-22 — Resposta do RAG deve citar fontes [ALVO]
- **Gatilho:** o Sistema RAG/IA produz uma resposta no chat.
- **Condição:** houve recuperação de contexto por similaridade (`pgvector`).
- **Efeito:** a resposta é gerada **restrita ao contexto recuperado** e **cita as
  fontes** usadas (termos/documentos). Sem contexto suficiente, o sistema **declara
  que não sabe** em vez de inventar (guardrail anti-alucinação).
- **RF:** RF-068. **Fonte:** SPEC `02` §3.3/§3.4; briefing `01` §7; doc `26` R3.
  **Nota:** o chat do protótipo (RF-020) é **simulado por palavras-chave**, sem LLM
  nem fontes (doc `20` §3/§6); esta regra vale para o RAG real que o substitui.

### RN-23 — Só conteúdo curado entra no índice do RAG [ALVO]
- **Gatilho:** ingestão de conteúdo para o índice recuperável (`document_chunks`).
- **Condição:** o conteúdo é curado — termos/workflows publicados, documentos
  aprovados e, na Comunidade, **apenas respostas aceitas** (`status='resolved'`).
- **Efeito:** o item vira fonte recuperável; conteúdo não curado (perguntas abertas,
  rascunhos, pendências) **não** entra, reduzindo alucinação e ruído.
- **RF:** RF-067, RF-068. **Fonte:** SPEC `11` §4 (Fase B); briefing `01` §7.

---

## 7. Dados de pessoas — mediação e LGPD
> Fonte: SPEC `09` §3 (nota ¹)/§4/§7; doc `24`; RF-069 [FUTURO]; briefing `01` §8 Q3;
> doc `26` R2.

### RN-24 — Contribuição sobre pessoas é sempre moderada [ALVO]
- **Gatilho:** cocriação/edição envolvendo `person` (especialista, contato) ou nó de
  organograma com dados pessoais.
- **Condição:** o `target_type` toca **dados pessoais** — **inclusive** quando o autor
  é `coordinator`.
- **Efeito:** a contribuição é **sempre** moderada (nunca edição direta livre);
  aprovação obrigatória; exclusão é `active=false` (soft); tudo em `audit_log`.
- **RF:** RF-041, RF-044, RF-045, RF-069. **Fonte:** SPEC `09` §3 (nota ¹)/§4/§7.

### RN-25 — Dados de pessoas só a autenticados e ligados por `term_slug` [ALVO]
- **Gatilho:** exibição de especialistas/organograma/contatos.
- **Condição:** requisição autenticada.
- **Efeito:** dados pessoais **só** aparecem a usuários autenticados; especialistas
  são resolvidos por `term_slug` e expostos no verbete/hotspot. Acesso anônimo é
  negado.
- **RF:** RF-069. **Fonte:** SPEC `09` §7; docs `07`/`08`; RF-069 (doc `21` §11).

### RN-26 — Seed fictício até migração segura (pré-condição de dado) [ALVO]
- **Gatilho:** povoar organograma/especialistas em qualquer ambiente
  versionado/publicável.
- **Condição:** enquanto **não** houver base legal e migração segura aprovadas.
- **Efeito:** usar **dados fictícios**; **proibida** a publicação com nomes reais até
  tratar os achados CRÍTICO/ALTO do doc `24`. *(Decisão do CEO — reais × fictício —
  em aberto; recomendação de Segurança é fictício.)*
- **RF:** RF-069. **Fonte:** doc `24` §1/§3 (R1/R2); briefing `01` §8 Q3; doc `26` R2.

---

## 8. Rastreabilidade (RN ↔ RF ↔ fonte)

| Regra | RF principais | Fonte (SPEC/doc §) |
|---|---|---|
| RN-01..RN-04 | RF-062, RF-063 | SPEC `09` §2/§2.1/§3/§7; PDR `03` D12/D13 |
| RN-05..RN-10 | RF-006, RF-007, RF-039..RF-046, RF-064 | SPEC `09` §4/§6; doc `25` §5 |
| RN-11..RN-14 | RF-067 | SPEC `11` §2/§3/§5 |
| RN-15..RN-20 | RF-056..RF-061, RF-030..RF-036 | doc `25` §4/§5; RF-038/RF-058 (doc `21`) |
| RN-21 | RF-039..RF-046, RF-063, RF-064 | doc `25` §5; SPEC `09` §8 |
| RN-22..RN-23 | RF-067, RF-068 | SPEC `02` §3.3/§3.4; SPEC `11` §4 |
| RN-24..RN-26 | RF-041, RF-044, RF-045, RF-069 | SPEC `09` §3/§4/§7; doc `24` |

---

## 9. Perguntas em aberto

Herdadas das SPECs `09`/`11`, do doc `24` e do briefing `01`. Nada é decidido aqui.

1. **`coordinator` exclui (soft delete) ou só `admin`?** — RN-09 assume soft delete
   para `coordinator`; confirmar. *— ainda em aberto (SPEC `09` §10.1).*
2. **Revisor ≠ autor: sempre ou só com ≥2 revisores?** — RN-08. *— ainda em aberto
   (SPEC `09` §10.2).*
3. **Workflows entram no RAG desde o MVP?** — afeta RN-23. *— ainda em aberto (SPEC
   `09` §10.3).*
4. **Quando creditar XP de cocriação moderada** — na proposta ou só na aprovação
   (RN-16 vs. RN-05)? O protótipo credita na criação direta; com moderação a regra
   muda. *— ainda em aberto.*
5. **Gamificação no produto real** — RN-15..RN-20 valem em qual fase do produto (ou
   só demo)? *— ainda em aberto (briefing `01` §8 Q2; nota ao PDR `03`).*
6. **LGPD: pessoas reais × fictício** — RN-26 depende de decisão do CEO. *— ainda em
   aberto (briefing `01` §8 Q3; doc `24` §... veredito).*
7. **"Pergunte à IA primeiro" obrigatório antes de publicar no Q&A?** — afeta o
   acoplamento RN-11/RN-22. *— ainda em aberto (SPEC `11` §7.3).*
8. **Fase em que o RAG real (RN-22/RN-23) substitui o chat simulado (RF-020).** *—
   ainda em aberto (briefing `01` §8 Q4).*

> Aprovação do gate da Etapa 4 pendente do **Produto Lead** (`product-lead`).
