import { defineConfig } from "vitest/config";

// Testes de unidade do autor (Etapa 11 — DoD do doc 14 §2). Sem banco real:
// os testes usam repositórios em memória (fakes) injetados nos serviços, para
// não depender de Postgres nesta rodada (integração real fica com o QA Lead
// na Etapa 12, contra Postgres+pgvector de verdade, como já foi feito na
// Etapa 9).
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    reporters: "default",
  },
});
