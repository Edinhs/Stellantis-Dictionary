---
name: rag-pipeline
description: >-
  Use ao trabalhar no pipeline RAG do chatbot do Stellantis-Dictionary: chunking,
  geração de embeddings, busca por similaridade em pgvector, montagem de contexto,
  prompt com citação de fontes, guardrails anti-alucinação e o adapter multi-provedor
  de LLM (Claude/OpenAI). Gatilhos: "chunking", "embedding", "similaridade",
  "prompt do chat", "citar fontes", "adapter LLM", "LlmProvider", "alucinação",
  "indexar conteúdo".
---

# RAG Pipeline — chatbot do Stellantis-Dictionary

Fonte da verdade: `docs/02-spec.md` (§3.3, §3.4), `docs/03-pdr.md` (D5, riscos),
`docs/09-...cargos-spec.md` (§5 workflows no RAG), `docs/11-comunidade-qa-spec.md`
(§4 RAG faseado). Meta de desempenho: resposta em ~5s para bases pequenas/médias.

## Regra de ouro: só conteúdo CURADO entra no índice

- Indexar apenas conteúdo aprovado/publicado: `terms`, `workflows` publicados
  (`status='published'`) e respostas de Q&A **aceitas** (`status='resolved'`).
- **Nunca** indexar: propostas `pending`, rascunhos, conteúdo reportado ou
  soft-deleted. Isso é a mitigação central do risco de alucinação (PDR §2).
- Q&A aceito entra como par pergunta+resposta em `document_chunks` com
  `source_type='qa'`, `source_ref=question.id` (SPEC 11 §4 fase B).

## Fluxo (SPEC 02 §3.4)

```
pergunta → embedding da pergunta → busca por similaridade (pgvector) →
seleção/rerank de contexto → montagem do prompt → LLM → resposta + fontes citadas
```

- Histórico da conversa por usuário (`conversations`/`messages`) para continuidade
  e auditoria; `messages.sources_used` guarda as fontes citadas.

## Chunking

- Chunk semântico com **overlap** (ex. janela + sobreposição) para não cortar
  contexto no meio. Termos costumam ser curtos → um verbete pode ser 1 chunk;
  documentos (fase 2) e workflows longos são fragmentados.
- Cada chunk mantém **procedência**: `source_type` (`term`|`workflow`|`document`|
  `qa`) + `source_ref` (id/slug) para poder citar a fonte na resposta.
- Guardar `content` legível junto do `embedding` (o LLM recebe o texto, não o vetor).

## Embeddings

- Gerados pelo **adapter** (mesma família do provedor escolhido). Fixe e documente
  a **dimensão** do vetor — ela define `vector(N)` no schema (coordenar com
  `db-schema`). Trocar de modelo de embedding exige re-indexação.
- Mesma função de embedding para indexar e para a query (consistência da métrica).

## Busca por similaridade

- Similaridade de cosseno em `pgvector` (operador `<=>`), top-K configurável.
- Aplicar **threshold de similaridade**: se nada acima do limiar, tratar como
  "sem contexto suficiente" em vez de forçar resposta.
- Respeitar autorização/soft-delete: não recuperar chunk cuja fonte esteja
  deletada ou fora do escopo do usuário.

## Prompt e citação de fontes (guardrail)

- Instruir o LLM a responder **apenas com base no contexto recuperado** para
  perguntas do dicionário/setor; se o contexto não cobre, **dizer que não sabe**
  (não inventar). Separar claramente system / contexto / pergunta.
- A resposta **sempre cita a(s) fonte(s)** usada(s) (slug/título do termo,
  workflow ou pergunta). Sem fonte recuperada → sem afirmação factual.
- Não vazar segredos/PII no prompt; não incluir dados de outros usuários.

## Adapter de LLM (`LlmProvider`) — desacoplar provedor (PDR D5)

- Interface única `LlmProvider` com métodos de embedding e de chat/completion,
  implementada para Claude e OpenAI. O provedor é escolhido por **env**, não
  hardcoded; trocar provedor não reescreve a aplicação.
- Chaves de API **só via env/secret manager** — nunca no código nem em log.
- Tratar timeout, rate limit (429) e erro do provedor com fallback gracioso ao
  usuário; respeitar a meta de ~5s.

## Faseamento (SPEC 11 §4)

- **Fase 1/MVP**: RAG sobre `terms` cadastrados manualmente.
- **Fase 2**: ingestão de documentos (PDF/DOCX) → chunking → embeddings.
- **Q&A Fase A**: "pergunte à IA primeiro" — rodar a pergunta pelo RAG antes de
  publicar, mostrando resposta + fontes (reduz duplicatas).
- **Q&A Fase B**: respostas aceitas viram fontes recuperáveis (só curado).
- Workflows entram no pipeline como as demais fontes (decisão do RAG Eng.:
  reusar `document_chunks` com `source_type='workflow'`).

## Checklist antes de entregar

- [ ] Só conteúdo curado/publicado/aceito foi indexado; nada pending/deletado.
- [ ] Chunk carrega `source_type`+`source_ref` para citar a fonte.
- [ ] Mesma função/dimensão de embedding na indexação e na query; dimensão
      documentada e alinhada ao `vector(N)` do schema.
- [ ] Threshold de similaridade + comportamento "não sei" quando sem contexto.
- [ ] Prompt restringe ao contexto e força citação de fontes.
- [ ] Provedor via `LlmProvider` + env; nenhuma chave no código/log.
- [ ] Sem PII/segredo no contexto; respeita soft-delete/autorização.
- [ ] Latência dentro da meta; erros do provedor tratados.
- [ ] Revisado por Segurança Lead (dados no prompt) e QA Lead (qualidade/fontes).
