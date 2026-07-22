# rag — Chat RAG e adapter de LLM

Embeddings, chunking, busca por similaridade (pgvector), orquestração de prompt com citação de fontes e guardrails anti-alucinação. O provedor de LLM é um ADAPTER atrás do port `LlmProvider`, selecionado por `config` (D5 configurável). Ref.: SPEC `02` §3.3/§3.4.

**Camadas** (ver `docs/13-arquitetura-modular.md` §3.1). Só `index.ts` é
importável por outros módulos (contrato público); `routes`/`service`/`repository`
são internos.

- `rag.routes.ts` — camada ROTA: HTTP, validação de entrada, chama o serviço.
- `rag.service.ts` — camada SERVIÇO: regra de negócio; chama `can()` e o repo.
- `rag.repository.ts` — camada REPOSITÓRIO: acesso a dados (SQL); sem HTTP.
- `index.ts` — registra rotas e exporta o serviço público do módulo.

## Status na Etapa 11 (Desenvolvimento) — MVP reduzido, documentado

Implementado nesta rodada: port `LlmProvider` isolado (`llm-provider.port.ts`)
+ adapter stub `EchoLlmProvider` (`llm-provider.stub.ts`, usado sempre que
`LLM_API_KEY` não está configurada/`D5` segue em aberto) e um endpoint de
chat funcional (`POST /api/chat`) que busca termos publicados por texto
simples e devolve uma resposta "eco" citando a fonte — nunca inventa; sem
contexto, declara que não sabe (RN-22/RN-23).

**Deliberadamente FORA desta rodada** (próximo passo, não bloqueia a
entrega): geração real de embeddings, chunking de documentos, busca por
similaridade vetorial em `document_chunks` (pgvector) e adapter real de LLM
(Claude/OpenAI — depende de `D5`). O `rag-engineer` assume isso quando `D5`
for decidido; a troca de adapter não deve tocar `rag.service` (port
`LlmProvider`).
