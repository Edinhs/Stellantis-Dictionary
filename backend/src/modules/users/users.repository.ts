import type { Db } from "../../core/db";
import type { Role } from "../../core/authz";
import type { UserProfile } from "./users.types";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}

function fromRow(row: UserRow): UserProfile {
  return { id: row.id, name: row.name, email: row.email, role: row.role, active: row.active };
}

export interface UsersRepository {
  findById(id: string): Promise<UserProfile | null>;
  updateRole(id: string, role: Role): Promise<UserProfile>;
}

export function createUsersRepository(db: Db): UsersRepository {
  return {
    async findById(id) {
      const result = await db.query<UserRow>("SELECT id, name, email, role, active FROM users WHERE id = $1", [id]);
      return result.rows[0] ? fromRow(result.rows[0]) : null;
    },
    async updateRole(id, role) {
      const result = await db.query<UserRow>(
        "UPDATE users SET role = $2, updated_at = now() WHERE id = $1 RETURNING id, name, email, role, active",
        [id, role]
      );
      return fromRow(result.rows[0]);
    },
  };
}
