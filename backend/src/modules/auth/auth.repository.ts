// auth.repository — camada REPOSITÓRIO: SQL puro, sem HTTP (doc 13 §3.1).

import type { Db } from "../../core/db";
import type { UserRecord } from "./auth.types";

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRecord["role"];
  active: boolean;
}

function fromRow(row: UserRow): UserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    active: row.active,
  };
}

export interface AuthRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  create(input: { name: string; email: string; passwordHash: string }): Promise<UserRecord>;
}

export function createAuthRepository(db: Db): AuthRepository {
  return {
    async findByEmail(email) {
      const result = await db.query<UserRow>(
        "SELECT id, name, email, password_hash, role, active FROM users WHERE lower(email) = lower($1)",
        [email]
      );
      return result.rows[0] ? fromRow(result.rows[0]) : null;
    },
    async findById(id) {
      const result = await db.query<UserRow>(
        "SELECT id, name, email, password_hash, role, active FROM users WHERE id = $1",
        [id]
      );
      return result.rows[0] ? fromRow(result.rows[0]) : null;
    },
    async create({ name, email, passwordHash }) {
      // role SEMPRE 'user' no cadastro (RN-01); o client nunca escolhe cargo.
      const result = await db.query<UserRow>(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'user')
         RETURNING id, name, email, password_hash, role, active`,
        [name, email, passwordHash]
      );
      return fromRow(result.rows[0]);
    },
  };
}
