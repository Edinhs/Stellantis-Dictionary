# PDR — Aba "Comunidade" (Q&A)

> Status: **rascunho da ideia para validação**. Só planejamento; nada
> implementado. Detalhamento técnico na SPEC `11-comunidade-qa-spec.md`.

## 1. Objetivo

Uma aba **"Comunidade"** onde qualquer usuário autenticado **faz e responde
perguntas** — um Q&A interno estilo Stack Overflow / Discourse para o time.
Fecha o ciclo do conhecimento: além de consultar (dicionário), ver a peça (3D)
e saber com quem falar (especialistas), o usuário pode **perguntar à comunidade**
e ter as respostas registradas e reutilizáveis.

## 2. Princípio: moderação leve (distinta do conteúdo canônico)

Decisão de produto central: **Q&A é conteúdo conversacional de moderação leve**
— `user` publica direto, sem fila de aprovação. O controle é **reativo**
(reportar → moderar depois), não preventivo. Isso contrasta de propósito com o
conteúdo **canônico** (dicionário/workflows), que segue o fluxo
propor-e-aprovar da SPEC `09`. O valor é capturado quando uma boa resposta é
**promovida** a verbete/workflow canônico (passa então pelo fluxo moderado).

## 3. Decisões propostas

| # | Decisão | Status |
|---|---|---|
| Q1 | Aba "Comunidade" = Q&A (perguntar, responder, comentar, votar, aceitar resposta) | Proposto |
| Q2 | Moderação **leve/reativa** para `user`; `coordinator`/`admin` moderam | Proposto |
| Q3 | Ligação por `slug`/`term_slug`: pergunta com tag de termo aparece no verbete | Proposto |
| Q4 | Reuso de especialistas: pergunta com `term_slug` mostra quem procurar (rota de `08`) | Proposto |
| Q5 | **Reputação/pontos fora do MVP** — só votos + resposta aceita como sinal de qualidade | Proposto |
| Q6 | RAG faseado: "pergunte à IA primeiro" (MVP+) → respostas aceitas viram fonte (fase B) | Proposto |
| Q7 | Criar tags novas restrito a `coordinator`/`admin`; `user` só aplica existentes | Proposto |

## 4. Integração com o resto (linkar por slug, não duplicar)

- **Dicionário**: bloco "Perguntas da comunidade sobre este termo" no verbete.
- **Especialistas**: na pergunta com `term_slug`, mostrar especialistas do
  componente (reuso direto da API de `08`).
- **Workflows**: tag `kind='workflow'` (fase posterior).
- **RAG**: (A) "pergunte à IA primeiro" reduz duplicatas; (B) **só** respostas
  **aceitas** entram no índice (`document_chunks`, `source_type='qa'`) — evita
  poluir o RAG com conteúdo não verificado.
- **Promoção a canônico**: ação de coordinator/admin transforma resposta aceita
  em `contribution` (fluxo moderado da SPEC `09`).

## 5. Fases

- **MVP (Q&A-1)**: perguntar/responder/comentar/votar/aceitar; tags (incl.
  `term_slug`); status; soft-delete; reportar + fila de moderação; edição
  própria versionada; bloco no verbete; "pergunte à IA primeiro".
- **Q&A-2**: notificação a especialistas; respostas aceitas → RAG; promoção a
  canônico; busca semântica.
- **Q&A-3**: reputação/badges (se justificado), integração com workflows,
  digests/subscrições a tags.

## 6. Riscos (resumo; detalhe na SPEC `11`)
- Duplicatas/baixa qualidade → sugestão de similares + "pergunte à IA primeiro".
- Moderação leve como vetor de spam → reportar + auto-ocultar por N reports +
  rate-limit + soft-delete auditável.
- Q&A confundir-se com conteúdo canônico → fronteira explícita + promoção via
  `contributions`.

## 7. Perguntas em aberto
1. Notificação a especialista no MVP é só exibir contato, ou já e-mail/Teams?
2. Reputação entra em alguma fase planejada ou fica indefinida até haver escala?
3. "Pergunte à IA primeiro" é obrigatório antes de publicar ou opcional?
