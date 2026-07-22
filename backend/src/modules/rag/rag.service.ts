// rag.service — orquestração mínima viável do chat (Etapa 11, escopo
// reduzido documentado). Requer permissão `chat.use`? NÃO existe essa
// permissão no seed atual (seeds/role_permissions.json só cobre
// dictionary/project/component/role.assign) — decisão desta rodada: chat é
// liberado a qualquer usuário AUTENTICADO (sem permissão nomeada extra),
// já que não há RN específica limitando por cargo. Se isso mudar, adicionar
// `chat.use` ao seed + checagem aqui, sem mexer no restante do fluxo.

import type { AuthUser } from "../../core/authz";
import { ValidationError } from "../../core/errors";
import type { RagRepository } from "./rag.repository";
import type { LlmProvider } from "./llm-provider.port";

export interface ChatResponse {
  conversationId: string;
  message: string;
  sourcesUsed: Array<{ type: "term"; slug: string; title: string }>;
}

export interface RagService {
  chat(actor: AuthUser, input: { conversationId?: string; message: string }): Promise<ChatResponse>;
}

export function createRagService(repo: RagRepository, llm: LlmProvider): RagService {
  return {
    async chat(actor, input) {
      if (!input.message || !input.message.trim()) {
        throw new ValidationError("Mensagem vazia");
      }

      const conversation = input.conversationId
        ? { id: input.conversationId }
        : await repo.createConversation(actor.id, input.message.slice(0, 80));

      const termSnippets = await repo.findRelevantTerms(input.message);
      const result = await llm.chat([{ role: "user", content: input.message }], { termSnippets });

      await repo.appendMessage({
        conversationId: conversation.id,
        role: "user",
        content: input.message,
        sourcesUsed: [],
      });
      await repo.appendMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: result.content,
        sourcesUsed: result.sourcesUsed,
      });

      return { conversationId: conversation.id, message: result.content, sourcesUsed: result.sourcesUsed };
    },
  };
}
