import type { Role } from "../../core/authz";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}
