// rag/llm-provider.stub — ADAPTER stub usado quando não há
// `LLM_API_KEY` configurada (ou `LLM_PROVIDER=stub`). NÃO é RAG completo:
// documentado como PENDÊNCIA/next-step nesta entrega (Etapa 11). Escopo desta
// rodada: port isolado + guardrail anti-alucinação básico (nunca inventa,
// sempre declara quando não há contexto — RN-22/RN-23, SPEC 02 §3.3/§3.4).
//
// Próximo passo (fora desta rodada): adapter real (Claude/OpenAI conforme
// D5), chunking/embeddings de produção e busca por similaridade em
// `document_chunks` (pgvector) — hoje o `rag.repository` já sabe ler termos
// publicados, mas a geração de embedding e o ranking por similaridade não
// estão implementados; o "contexto" usado aqui é busca textual simples.

import type { LlmChatResult, LlmProvider } from "./llm-provider.port";

export function createEchoLlmProvider(): LlmProvider {
  return {
    name: "stub-echo",
    async chat(messages, context) {
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      const question = lastUser?.content ?? "";

      if (context.termSnippets.length === 0) {
        const result: LlmChatResult = {
          content:
            "Não encontrei um termo cadastrado que responda a isso ainda. " +
            "(Resposta de STUB — nenhum provedor de LLM configurado; ver rag/README.md.)",
          sourcesUsed: [],
        };
        return result;
      }

      const top = context.termSnippets[0];
      const result: LlmChatResult = {
        content:
          `[STUB — sem LLM real configurado] Sobre "${question}": ${top.title} — ${top.text}`.slice(0, 2000),
        sourcesUsed: [{ type: "term", slug: top.slug, title: top.title }],
      };
      return result;
    },
  };
}
