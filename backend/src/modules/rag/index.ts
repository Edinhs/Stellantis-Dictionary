import type { Db } from "../../core/db";
import type { AppConfig } from "../../core/config";
import { createRagRepository } from "./rag.repository";
import { createRagService, type RagService } from "./rag.service";
import { ragRoutes } from "./rag.routes";
import { createEchoLlmProvider } from "./llm-provider.stub";
import type { LlmProvider } from "./llm-provider.port";

export interface RagModule {
  service: RagService;
  router: ReturnType<typeof ragRoutes>;
}

function selectLlmProvider(config: AppConfig): LlmProvider {
  // D5 (provedor de LLM) em aberto no PDR `03`: sem `LLM_API_KEY` real
  // configurada, cai no adapter stub (eco + guardrail anti-alucinação). Um
  // adapter Claude/OpenAI real entra aqui quando D5 for decidido, sem tocar
  // rag.service (port `LlmProvider`, doc 13 §7 regra 4).
  if (!config.llm.apiKey || config.llm.apiKey === "__CHANGE_ME__") {
    return createEchoLlmProvider();
  }
  // TODO (próximo passo, fora do escopo desta rodada): adapter real por
  // config.llm.provider ('claude' | 'openai'). Por ora, mesmo com chave
  // presente, ainda usamos o stub — implementar o adapter real é trabalho
  // maior de rag-engineer (chunking, embeddings, guardrails de prompt).
  return createEchoLlmProvider();
}

export function createRagModule(db: Db, config: AppConfig): RagModule {
  const repository = createRagRepository(db);
  const llm = selectLlmProvider(config);
  const service = createRagService(repository, llm);
  const router = ragRoutes(service);
  return { service, router };
}

export type { RagService } from "./rag.service";
export type { LlmProvider, LlmChatMessage, LlmChatResult } from "./llm-provider.port";
