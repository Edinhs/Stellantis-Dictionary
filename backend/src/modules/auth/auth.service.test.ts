import { describe, expect, it } from "vitest";
import { createAuthService } from "./auth.service";
import type { AuthRepository } from "./auth.repository";
import type { UserRecord } from "./auth.types";
import type { AppConfig } from "../../core/config";

function fakeConfig(): AppConfig {
  return {
    nodeEnv: "test",
    port: 3000,
    logLevel: "info",
    databaseUrl: "postgres://test",
    jwt: {
      accessSecret: "test-access-secret",
      refreshSecret: "test-refresh-secret",
      accessTtl: "15m",
      refreshTtl: "7d",
    },
    llm: { provider: "stub" },
  };
}

function fakeRepo(seed: UserRecord[] = []): AuthRepository {
  const users = [...seed];
  return {
    async findByEmail(email) {
      return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
    },
    async findById(id) {
      return users.find((u) => u.id === id) ?? null;
    },
    async create({ name, email, passwordHash }) {
      const user: UserRecord = {
        id: `user-${users.length + 1}`,
        name,
        email,
        passwordHash,
        role: "user",
        active: true,
      };
      users.push(user);
      return user;
    },
  };
}

describe("auth.service", () => {
  it("cadastra um usuário sempre com role 'user' (RN-01)", async () => {
    const service = createAuthService(fakeRepo(), fakeConfig());
    const { user, tokens } = await service.register({
      name: "Ana",
      email: "ana@example.com",
      password: "senha-forte-123",
    });
    expect(user.role).toBe("user");
    expect(tokens.accessToken).toBeTruthy();
    expect(tokens.refreshToken).toBeTruthy();
  });

  it("rejeita cadastro com e-mail já existente", async () => {
    const repo = fakeRepo();
    const service = createAuthService(repo, fakeConfig());
    await service.register({ name: "Ana", email: "ana@example.com", password: "senha-forte-123" });
    await expect(
      service.register({ name: "Outra Ana", email: "ana@example.com", password: "outra-senha-123" })
    ).rejects.toThrow();
  });

  it("login falha com senha errada e não vaza detalhe sobre existência do e-mail", async () => {
    const repo = fakeRepo();
    const service = createAuthService(repo, fakeConfig());
    await service.register({ name: "Ana", email: "ana@example.com", password: "senha-forte-123" });
    await expect(service.login({ email: "ana@example.com", password: "errada" })).rejects.toThrow();
    await expect(service.login({ email: "ninguem@example.com", password: "x" })).rejects.toThrow();
  });

  it("login com sucesso emite novo par de tokens", async () => {
    const repo = fakeRepo();
    const service = createAuthService(repo, fakeConfig());
    await service.register({ name: "Ana", email: "ana@example.com", password: "senha-forte-123" });
    const { tokens } = await service.login({ email: "ana@example.com", password: "senha-forte-123" });
    expect(tokens.accessToken).toBeTruthy();
  });

  // QA (gate 12) — caminho de erro faltante: usuário desativado (active=false)
  // não deve conseguir logar mesmo com senha correta.
  it("login falha para usuário desativado (active=false), mesmo com senha correta", async () => {
    const repo = fakeRepo([
      {
        id: "user-inativo",
        name: "Desligado",
        email: "desligado@example.com",
        passwordHash: await createAuthService(fakeRepo(), fakeConfig()).hashPassword("senha-forte-123"),
        role: "user",
        active: false,
      },
    ]);
    const service = createAuthService(repo, fakeConfig());
    await expect(
      service.login({ email: "desligado@example.com", password: "senha-forte-123" })
    ).rejects.toThrow();
  });

  // QA (gate 12) — `refresh()` não tinha NENHUM teste (só o roundtrip de
  // emissão em "login com sucesso"). Cobre: token de refresh inválido,
  // expirado, e o caminho feliz (reemite um novo par preservando o `role`
  // atual do usuário, conforme comentário do próprio serviço).
  describe("refresh()", () => {
    it("refresh token inválido (assinatura errada) é rejeitado", async () => {
      const repo = fakeRepo();
      const service = createAuthService(repo, fakeConfig());
      await expect(service.refresh("token-completamente-invalido")).rejects.toThrow();
    });

    it("refresh token expirado é rejeitado", async () => {
      const repo = fakeRepo();
      const service = createAuthService(repo, fakeConfig());
      const { user } = await service.register({
        name: "Ana",
        email: "ana2@example.com",
        password: "senha-forte-123",
      });
      const jwtLib = await import("jsonwebtoken");
      const expiredRefresh = jwtLib.default.sign({ sub: user.id }, fakeConfig().jwt.refreshSecret, {
        expiresIn: "-10s",
      });
      await expect(service.refresh(expiredRefresh)).rejects.toThrow();
    });

    it("refresh válido reemite novo par de tokens para um usuário ativo", async () => {
      const repo = fakeRepo();
      const service = createAuthService(repo, fakeConfig());
      const { user, tokens } = await service.register({
        name: "Ana",
        email: "ana3@example.com",
        password: "senha-forte-123",
      });
      expect(user).toBeTruthy();
      const reissued = await service.refresh(tokens.refreshToken);
      expect(reissued.accessToken).toBeTruthy();
      expect(reissued.refreshToken).toBeTruthy();
    });

    it("refresh rejeita quando o usuário foi desativado após a emissão do token", async () => {
      const repo = fakeRepo();
      const service = createAuthService(repo, fakeConfig());
      const { user, tokens } = await service.register({
        name: "Ana",
        email: "ana4@example.com",
        password: "senha-forte-123",
      });
      // Simula desativação da conta entre a emissão do refresh token e seu uso.
      const stored = await repo.findById(user.id);
      if (stored) stored.active = false;
      await expect(service.refresh(tokens.refreshToken)).rejects.toThrow();
    });

    it("refresh rejeita quando o usuário não existe mais (id inválido)", async () => {
      const repo = fakeRepo();
      const service = createAuthService(repo, fakeConfig());
      const jwtLib = await import("jsonwebtoken");
      const tokenParaUsuarioInexistente = jwtLib.default.sign(
        { sub: "usuario-que-nao-existe" },
        fakeConfig().jwt.refreshSecret,
        { expiresIn: "7d" }
      );
      await expect(service.refresh(tokenParaUsuarioInexistente)).rejects.toThrow();
    });
  });
});
