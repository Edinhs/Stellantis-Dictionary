// auth.service — camada SERVIÇO: regra de negócio. Cadastro/login/refresh,
// hash de senha, emissão de JWT (access + refresh). Ref.: SPEC 02 §3.1, skill
// backend-api, RF-062 (doc 21).
//
// Decisão de hashing: `bcryptjs` (implementação pura em JS, sem binding
// nativo) em vez de `argon2`/`bcrypt` nativos, para não depender de
// toolchain de compilação C++ no ambiente de build/CI desta rodada. É uma
// biblioteca compatível com o algoritmo bcrypt (cost factor configurável),
// aceitável para o MVP; revisitar para `argon2` nativo quando o pipeline de
// build/Docker do backend estiver validado (fica registrado como próximo
// passo — não bloqueia esta entrega).

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { AppConfig } from "../../core/config";
import { ConflictError, UnauthorizedError } from "../../core/errors";
import type { AuthRepository } from "./auth.repository";
import { toPublicUser, type PublicUser, type UserRecord } from "./auth.types";
import type { LoginInput, RegisterInput } from "./auth.schema";

const BCRYPT_COST = 12;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthService {
  register(input: RegisterInput): Promise<{ user: PublicUser; tokens: TokenPair }>;
  login(input: LoginInput): Promise<{ user: PublicUser; tokens: TokenPair }>;
  refresh(refreshToken: string): Promise<TokenPair>;
  hashPassword(plain: string): Promise<string>;
}

interface RefreshPayload {
  sub: string;
}

export function createAuthService(repo: AuthRepository, config: AppConfig): AuthService {
  function issueTokens(user: UserRecord): TokenPair {
    // `expiresIn` do jsonwebtoken tipa como `StringValue` (formato "15m"/"7d")
    // em vez de `string` genérico; nossa config vem de env (string simples),
    // então o cast é seguro aqui (validado pelo formato documentado em
    // .env.example) sem afrouxar a tipagem do resto do módulo.
    const accessToken = jwt.sign({ sub: user.id, role: user.role }, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessTtl,
    } as jwt.SignOptions);
    const refreshToken = jwt.sign({ sub: user.id }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshTtl,
    } as jwt.SignOptions);
    return { accessToken, refreshToken };
  }

  return {
    async hashPassword(plain) {
      return bcrypt.hash(plain, BCRYPT_COST);
    },

    async register(input) {
      const existing = await repo.findByEmail(input.email);
      if (existing) {
        throw new ConflictError("E-mail já cadastrado");
      }
      const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
      // role='user' sempre (RN-01) — imposto no repositório, não aqui, para
      // não haver caminho onde o service "esqueça" e aceite role do client.
      const user = await repo.create({ name: input.name, email: input.email, passwordHash });
      return { user: toPublicUser(user), tokens: issueTokens(user) };
    },

    async login(input) {
      const user = await repo.findByEmail(input.email);
      if (!user || !user.active) {
        throw new UnauthorizedError("E-mail ou senha inválidos");
      }
      const ok = await bcrypt.compare(input.password, user.passwordHash);
      if (!ok) {
        throw new UnauthorizedError("E-mail ou senha inválidos");
      }
      return { user: toPublicUser(user), tokens: issueTokens(user) };
    },

    async refresh(refreshToken) {
      let payload: RefreshPayload;
      try {
        payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as RefreshPayload;
      } catch {
        throw new UnauthorizedError("Refresh token inválido ou expirado");
      }
      // Busca o usuário de novo para pegar o `role` atual (evita token com
      // cargo desatualizado após uma promoção/rebaixamento).
      const user = await repo.findById(payload.sub);
      if (!user || !user.active) {
        throw new UnauthorizedError("Usuário inválido");
      }
      return issueTokens(user);
    },
  };
}
