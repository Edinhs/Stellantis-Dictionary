# seeds — Dados de sementes versionados

Dados de carga inicial, versionados e auditáveis. Espelham as tabelas.

- `role_permissions.json` — matriz de permissões por cargo (SPEC `09` §6.1);
  editável sem migração.
- `diretorio.json` — setores/pessoas/responsáveis/especialistas (SPEC `08` §3);
  `term_slug` validado contra `terms.slug` na carga.
- `cockpit_hotspots.json` — hotspots do modelo 3D → `term_slug` (SPEC `02` §3.5).

Sem dados pessoais reais até a estratégia de hospedagem/segurança estar definida
(SPEC `08` §6).
