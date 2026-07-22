# seeds — Dados de sementes versionados

Dados de carga inicial, versionados e auditáveis. Espelham as tabelas.

- `role_permissions.json` — matriz de permissões por cargo (SPEC `09` §6.1/§3;
  doc `25` §5); editável sem migração.
- `terms.json` — dicionário núcleo (SPEC `02` §3.2/§4); categorias na taxonomia
  canônica (`motorizacao`/`tecnologia`/`componentes`/`plataformas`, doc `21`
  RF-002/RF-006). Conteúdo genérico/fictício.
- `cockpit_hotspots.json` — hotspots do Explorador 3D → `term_slug`
  (SPEC `02` §3.5); `term_slug` validado contra `terms.slug` na carga.
- `component_categories.json` / `suppliers.json` / `components.json` —
  Componentes de Infotainment (RF-042, Etapa 9 / doc `25` §3.1).
  `category_slug`/`supplier_slug`/`term_slug` resolvidos/validados contra as
  tabelas correspondentes na carga.
- `projects.json` — Projetos veiculares (RF-043, Etapa 9 / doc `25` §3.1).

- `diretorio.json` — placeholder (setores/pessoas/responsáveis/especialistas,
  SPEC `08` §3). **Fora do MVP (D20, PDR `03`)**: organograma/especialistas
  (dados de pessoas) não entram nesta etapa — S6 (minimização/LGPD, doc `24`/
  `25` §8). Não popular até a Etapa correspondente ser reaberta.

## Regra de segurança dos seeds (S9)

Nenhum dado sensível real em seed versionado/publicável: **códigos de
projeto**, **nomes de fornecedores Tier-1** e **domínios/hosts internos** são
sempre **fictícios/genéricos** nesta pasta (doc `24`/`25` §8, S9). Dados reais
entram por carga operacional fora do controle de versão, nunca como seed.

Sem dados pessoais reais até a estratégia de hospedagem/segurança estar
definida (SPEC `08` §6) — e, para organograma/especialistas, até o MVP incluir
esse módulo (fora de escopo em D20).
