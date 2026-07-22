// rag/llm-provider.port — PORT (Portas & Adaptadores, doc 13 §1.1) isolando
// o provedor de LLM. D5 (qual provedor) segue EM ABERTO no PDR `03`; trocar
// de adapter (Claude/OpenAI/stub) não deve tocar `rag.service`.

export interface LlmChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LlmChatResult {
  content: string;
  sourcesUsed: Array<{ type: "term"; slug: string; title: string }>;
}

export interface LlmProvider {
  /** Nome do adapter ativo (para diagnóstico/logs, nunca para decisão de negócio). */
  readonly name: string;
  chat(messages: LlmChatMessage[], context: { termSnippets: Array<{ slug: string; title: string; text: string }> }): Promise<LlmChatResult>;
}
