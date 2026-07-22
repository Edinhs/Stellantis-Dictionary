// core/logging — logger estruturado (JSON, um evento por linha), com
// request_id de correlação. NUNCA loga segredos/senhas/tokens (SPEC 02 §3.6,
// doc 13 §6.2). Distinto de `core/audit` (negócio/compliance, no banco).

type Level = "debug" | "info" | "warn" | "error";

const REDACT_KEYS = new Set([
  "password",
  "password_hash",
  "token",
  "accessToken",
  "refreshToken",
  "jwt",
  "secret",
  "authorization",
]);

function redact(obj: unknown): unknown {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(redact);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = REDACT_KEYS.has(k) ? "[REDACTED]" : redact(v);
  }
  return out;
}

function log(level: Level, message: string, meta: Record<string, unknown> = {}) {
  const line = {
    level,
    message,
    ts: new Date().toISOString(),
    ...(redact(meta) as Record<string, unknown>),
  };
  const out = level === "error" ? console.error : console.log;
  out(JSON.stringify(line));
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => log("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => log("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log("error", msg, meta),
};
