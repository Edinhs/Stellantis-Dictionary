// core/authz/permissions — vocabulário de permissões nomeadas, padrão
// `<area>.<acao>` (SPEC 09 §3, doc 25 §5). Espelha 1:1 o dado semente em
// `seeds/role_permissions.json` (fonte da verdade validada por Segurança na
// Etapa 9) — este arquivo só declara o TIPO; a matriz cargo→permissão em si
// é dado, não código (doc 13 §3.2).

export type Permission =
  | "dictionary.propose"
  | "dictionary.edit"
  | "dictionary.approve"
  | "dictionary.delete"
  | "dictionary.delete.hard"
  | "project.propose"
  | "project.edit"
  | "project.approve"
  | "project.delete"
  | "project.delete.hard"
  | "component.propose"
  | "component.edit"
  | "component.approve"
  | "component.delete"
  | "component.delete.hard"
  | "role.assign";

export const ALL_PERMISSIONS: readonly Permission[] = [
  "dictionary.propose",
  "dictionary.edit",
  "dictionary.approve",
  "dictionary.delete",
  "dictionary.delete.hard",
  "project.propose",
  "project.edit",
  "project.approve",
  "project.delete",
  "project.delete.hard",
  "component.propose",
  "component.edit",
  "component.approve",
  "component.delete",
  "component.delete.hard",
  "role.assign",
];

/** target_type (polimórfico, RN-21) -> prefixo de área de permissão. */
export const TARGET_TYPE_TO_AREA = {
  term: "dictionary",
  project: "project",
  component: "component",
} as const;
