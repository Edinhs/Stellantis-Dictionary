// core/config — leitura tipada de variáveis de ambiente (Twelve-Factor III).
// Fail-fast: falha no boot se faltar env obrigatória. Nenhum segredo tem
// default aqui — só placeholders documentados vivem em `.env.example` (raiz).
// Ref.: docs/13-arquitetura-modular.md §4.1, skill backend-api.

import "dotenv/config";

export interface AppConfig {
  nodeEnv: "development" | "test" | "production";
  port: number;
  logLevel: string;
  databaseUrl: string;
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessTtl: string;
    refreshTtl: string;
  };
  llm: {
    provider: string;
    apiKey?: string;
    model?: string;
    apiBaseUrl?: string;
  };
}

function required(name: string): string {
  const v = process.env[name];
  if (!v || v === "__CHANGE_ME__") {
    // Em NODE_ENV=test, permitimos um valor de teste determinístico para não
    // exigir .env local rodando `npm test` (ainda assim, nunca hardcoded em
    // produção: fora de "test" isto lança e derruba o boot).
    if (process.env.NODE_ENV === "test") {
      return `test-${name.toLowerCase()}`;
    }
    throw new Error(
      `Variável de ambiente obrigatória ausente/placeholder: ${name}. ` +
        "Configure em .env (nunca commitar segredo real; ver .env.example)."
    );
  }
  return v;
}

let cached: AppConfig | undefined;

export function loadConfig(): AppConfig {
  if (cached) return cached;
  cached = {
    nodeEnv: (process.env.NODE_ENV as AppConfig["nodeEnv"]) || "development",
    port: Number(process.env.APP_PORT || 3000),
    logLevel: process.env.LOG_LEVEL || "info",
    databaseUrl: required("DATABASE_URL"),
    jwt: {
      accessSecret: required("JWT_SECRET"),
      refreshSecret: required("JWT_REFRESH_SECRET"),
      accessTtl: process.env.JWT_ACCESS_TTL || "15m",
      refreshTtl: process.env.JWT_REFRESH_TTL || "7d",
    },
    llm: {
      provider: process.env.LLM_PROVIDER || "stub",
      apiKey: process.env.LLM_API_KEY,
      model: process.env.LLM_MODEL,
      apiBaseUrl: process.env.LLM_API_BASE_URL,
    },
  };
  return cached;
}

// Só para testes: permite resetar o cache entre suites.
export function __resetConfigForTests(): void {
  cached = undefined;
}
