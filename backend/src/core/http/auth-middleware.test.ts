// QA (gate 12) — cobertura HTTP do middleware `authenticate`/`authenticateOptional`
// que faltava: caminho feliz (token válido), token ausente, token inválido
// (assinatura errada) e token EXPIRADO (nenhum dos três estava exercitado em
// nenhum teste existente — só o roundtrip de emissão em auth.service.test.ts).
// Ref.: doc 21 (RF login/sessão), doc 28 RN-02 (autorização só por permissão,
// mas a AUTENTICAÇÃO — pré-requisito — também precisa ser verificada).

import { describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { authenticate, authenticateOptional } from "./auth-middleware";
import type { AppConfig } from "../config";

function fakeConfig(): AppConfig {
  return {
    nodeEnv: "test",
    port: 3000,
    logLevel: "info",
    databaseUrl: "postgres://test",
    jwt: {
      accessSecret: "access-secret",
      refreshSecret: "refresh-secret",
      accessTtl: "15m",
      refreshTtl: "7d",
    },
    llm: { provider: "stub" },
  };
}

function fakeReq(headers: Record<string, string> = {}): Request {
  return { headers } as unknown as Request;
}

function runMiddleware(mw: (req: Request, res: Response, next: (err?: unknown) => void) => void, req: Request) {
  const next = vi.fn();
  mw(req, {} as Response, next);
  return next;
}

describe("core/http/auth-middleware — authenticate()", () => {
  const config = fakeConfig();

  it("token válido: popula req.user com id/role e chama next() sem erro", () => {
    const token = jwt.sign({ sub: "user-1", role: "coordinator" }, config.jwt.accessSecret, { expiresIn: "15m" });
    const req = fakeReq({ authorization: `Bearer ${token}` });
    const next = runMiddleware(authenticate(config), req);
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual({ id: "user-1", role: "coordinator" });
  });

  it("sem header Authorization: next(UnauthorizedError), req.user não é populado", () => {
    const req = fakeReq({});
    const next = runMiddleware(authenticate(config), req);
    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(Error);
    expect((err as { status?: number }).status).toBe(401);
    expect(req.user).toBeUndefined();
  });

  it("header sem prefixo 'Bearer ': next(UnauthorizedError)", () => {
    const req = fakeReq({ authorization: "token-sem-bearer" });
    const next = runMiddleware(authenticate(config), req);
    const err = next.mock.calls[0][0];
    expect((err as { status?: number }).status).toBe(401);
  });

  it("token com assinatura inválida (secret errado): next(UnauthorizedError)", () => {
    const token = jwt.sign({ sub: "user-1", role: "user" }, "outro-secret-qualquer", { expiresIn: "15m" });
    const req = fakeReq({ authorization: `Bearer ${token}` });
    const next = runMiddleware(authenticate(config), req);
    const err = next.mock.calls[0][0];
    expect((err as { status?: number }).status).toBe(401);
    expect(req.user).toBeUndefined();
  });

  it("token EXPIRADO: next(UnauthorizedError) — não autentica com token vencido", () => {
    const token = jwt.sign({ sub: "user-1", role: "admin" }, config.jwt.accessSecret, { expiresIn: "-10s" });
    const req = fakeReq({ authorization: `Bearer ${token}` });
    const next = runMiddleware(authenticate(config), req);
    const err = next.mock.calls[0][0];
    expect((err as { status?: number }).status).toBe(401);
    expect(req.user).toBeUndefined();
  });
});

describe("core/http/auth-middleware — authenticateOptional()", () => {
  const config = fakeConfig();

  it("sem token: segue anônimo, sem erro e sem req.user", () => {
    const req = fakeReq({});
    const next = runMiddleware(authenticateOptional(config), req);
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toBeUndefined();
  });

  it("token inválido/expirado em rota opcional: ignora e segue anônimo (não propaga erro)", () => {
    const expired = jwt.sign({ sub: "user-1", role: "user" }, config.jwt.accessSecret, { expiresIn: "-1s" });
    const req = fakeReq({ authorization: `Bearer ${expired}` });
    const next = runMiddleware(authenticateOptional(config), req);
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toBeUndefined();
  });

  it("token válido em rota opcional: popula req.user normalmente", () => {
    const token = jwt.sign({ sub: "user-9", role: "user" }, config.jwt.accessSecret, { expiresIn: "15m" });
    const req = fakeReq({ authorization: `Bearer ${token}` });
    const next = runMiddleware(authenticateOptional(config), req);
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual({ id: "user-9", role: "user" });
  });
});
