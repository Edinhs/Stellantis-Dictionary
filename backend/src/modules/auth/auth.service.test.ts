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
});
