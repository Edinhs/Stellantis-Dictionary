# data — Dados REAIS de carga operacional (não são seeds de exemplo)

Esta pasta guarda **conteúdo real do dicionário** enviado pelo CEO, como insumo
de carga operacional auditada. **Não confundir** com `../seeds/*.json`, que são
dados **fictícios/genéricos** de dev/teste (ver `seeds/README.md`, regra S9).

## `siglas-lista-geral-2.json`

Primeira leva de conteúdo real (CEO, 2026-07-23): **sigla + significado em
inglês**, extraída de `Lista_Geral_de_Siglas_2.xlsx` (sheet `Plan1`).

- `term` = sigla limpa.
- `definition` = significado em **inglês** (PROVISÓRIO — o CEO traduz para PT
  depois, editando cada card).
- `category` = `null` (**a classificar** manualmente pelo CEO — não inventamos a
  categoria de nenhuma sigla).
- `status` = `draft` (verbete incompleto, não publicado).
- `metadata` marca as pendências:
  `{ pending_translation, pending_category, lang_definition: "en",
     source_batch: "siglas-lista-geral-2", has_multiple_meanings, source_meanings[] }`.

### Como o artefato é gerado (limpeza determinística)

```
python3 scripts/build-siglas-dataset.py <caminho-do-xlsx>
```

Regras (aplicadas por `scripts/build-siglas-dataset.py`):

- Normaliza espaços e non-breaking spaces (`\xa0`); faz trim; pula o cabeçalho.
- **Descarta linhas-lixo**: sigla sem nenhum caractere alfanumérico (ex.: `[`,
  que era uma nota RACI) ou significado vazio (ex.: `NLC`).
- **Deduplica** por sigla (chave **normalizada**, case-insensitive): mantém
  **uma** entrada e **acumula** os significados distintos em
  `metadata.source_meanings` (ordem de aparição). A chave de dedup colapsa
  espaços ao redor de `&` para unir grafias equivalentes da mesma sigla (ex.:
  `DVP & R` e `DVP&R` viram um único verbete); o `term` exibido preserva a grafia
  da **primeira aparição**. A `definition` primária é o primeiro significado;
  `has_multiple_meanings` sinaliza quando há mais de um (o CEO escolhe/mescla ao
  editar).
- `slug` determinístico e único (kebab, sem acento); colisões recebem sufixo
  `-2`, `-3`... na ordem de aparição.

Resultado da 1ª leva: **749 linhas → 682 siglas únicas importadas, 2 descartadas**
(`[`, `NLC`), 65 linhas duplicadas mescladas (52 siglas com múltiplos
significados acumulados).

### Como importar para o banco (idempotente, fora de produção)

```
cd backend
NODE_ENV=development npm run import:siglas        # carga real
NODE_ENV=development npm run import:siglas -- --dry # só relata
```

- O loader `backend/src/scripts/import-siglas.ts` é **deny-by-default** (guard
  D6, `seeds/README.md`): só roda quando `NODE_ENV ∈ {development, test}`. Em
  qualquer outro ambiente (`production`, `staging`, `NODE_ENV` ausente ou com
  typo) **aborta com exit 1**, a menos que haja opt-in explícito e consciente —
  `npm run import:siglas -- --confirm` ou `ALLOW_REAL_IMPORT=1`. O `config`
  também faz *fail-fast* se `NODE_ENV` tiver um valor desconhecido (não degrada
  silenciosamente para `development`).
- É **idempotente**: `ON CONFLICT (slug) DO NOTHING`. Rodar de novo nunca
  sobrescreve o que já existe — **nunca apaga a tradução/categoria que o CEO já
  preencheu** editando os cards. Só insere slugs ausentes.
- Registra uma entrada-resumo em `audit_log` (`action='dictionary.import'`).
- Depende da migração `db/migrations/0008-terms-category-nullable-draft.sql`
  (permite `category` NULL em rascunho; publicar exige categoria).

## Trabalho manual do CEO depois da carga

Para cada verbete (editando o card): traduzir `definition` para PT, definir a
`category` canônica, revisar sinônimos/`source_meanings` e **publicar**
(`status='published'`, o que passa a exigir categoria).
