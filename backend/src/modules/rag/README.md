# rag — Chat RAG e adapter de LLM

Embeddings, chunking, busca por similaridade (pgvector), orquestração de prompt com citação de fontes e guardrails anti-alucinação. O provedor de LLM é um ADAPTER atrás do port `LlmProvider`, selecionado por `config` (D5 configurável). Ref.: SPEC `02` §3.3/§3.4.

**Camadas** (ver `docs/13-arquitetura-modular.md` §3.1). Só `index.ts` é
importável por outros módulos (contrato público); `routes`/`service`/`repository`
são internos.

- `rag.routes.ts` — camada ROTA: HTTP, validação de entrada, chama o serviço.
- `rag.service.ts` — camada SERVIÇO: regra de negócio; chama `can()` e o repo.
- `rag.repository.ts` — camada REPOSITÓRIO: acesso a dados (SQL); sem HTTP.
- `index.ts` — registra rotas e exporta o serviço público do módulo.

Esta fase entrega apenas o esqueleto: os arquivos são placeholders, sem lógica
de produção.
