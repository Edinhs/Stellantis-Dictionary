# 33 — Runbook: Provisionar o Supabase (plano Free) e aplicar as migrações

> Status: **runbook operacional para o CEO executar manualmente**.
> Última atualização: 2026-07-24.
> Autoria: DevOps Lead (`devops-lead`), dono de hospedagem/deploy (`D6`).
> Insumos: migrações reais `db/migrations/0000`–`0008`, `db/README.md`,
> `docker/docker-compose.yml`, `.env.example`, PDR `03-pdr.md` (`D6` resolvida:
> Cloudflare + Supabase), roteiro `31-roteiro-publicacao-dados-reais.md`.
> **Repositório é PÚBLICO.** Nenhum segredo (senha do banco, connection string,
> `service_role` key, `GEMINI_API_KEY`) entra no repo, em commit ou em chat.

---

## 0. Fatos verificados no repositório (leia antes de executar)

Antes de escrever qualquer passo, o DevOps Lead leu as migrações reais. Dois pontos
decisivos:

### 0.1 As extensões (pgvector etc.) são criadas PELAS MIGRAÇÕES

A migração **`0001-extensions.sql`** executa:

```sql
CREATE EXTENSION IF NOT EXISTS vector;    -- pgvector (busca por similaridade / RAG)
CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- gen_random_uuid() — default de PK de TODAS as tabelas
CREATE EXTENSION IF NOT EXISTS pg_trgm;   -- gin_trgm_ops — busca textual aproximada do dicionário
```

Ou seja: **você NÃO precisa habilitar o pgvector manualmente no painel antes de
rodar as migrações** — a migração `0001` habilita as três extensões, e é a
PRIMEIRA a rodar (logo, `gen_random_uuid()`, `vector(1536)` e `gin_trgm_ops`
usados nas migrações seguintes já existem quando forem referenciados). No
Supabase Free, `vector`, `pgcrypto` e `pg_trgm` estão disponíveis e o
`CREATE EXTENSION` funciona no SQL Editor.

> Fallback (só se `0001` falhar por permissão, o que não é esperado no Free):
> Dashboard → **Database → Extensions**, procure `vector`, `pgcrypto`, `pg_trgm`
> e ative cada uma; depois rode `0001` de novo (é idempotente, `IF NOT EXISTS`).

### 0.2 Como o projeto aplica migrações (método REAL)

**Não existe ferramenta de migração** (nada de node-pg-migrate/knex/prisma) e
**não existe `npm run migrate`**. A convenção do repo (`db/README.md`) é:

- Arquivos `db/migrations/NNNN-descricao.sql`, **numeração sequencial de 4
  dígitos, imutáveis** depois de aplicados (mudança = migração nova).
- São **SQL puro aplicado em ordem**, de `0000` até `0008`.
- O `docker compose` local **não** aplica as migrações automaticamente — só roda
  `docker/postgres/01-init-pgvector.sql` (que cria apenas `vector`) na criação do
  volume. A aplicação das migrações é uma ação **manual e explícita**.

Portanto, no Supabase, aplicar as migrações = **rodar o conteúdo dos 9 arquivos,
em ordem** (via SQL Editor ou via `psql`). Ver §3.

### 0.3 Ordem e conteúdo das migrações

| # | Arquivo | O que faz |
|---|---------|-----------|
| 0000 | `0000-init.sql` | Placeholder/esqueleto. Sem schema (só comentários). Rodar assim mesmo, é inócuo. |
| 0001 | `0001-extensions.sql` | **`CREATE EXTENSION` `vector`, `pgcrypto`, `pg_trgm`.** Pré-requisito de tudo. |
| 0002 | `0002-users-roles.sql` | Tabelas `users`, `role_permissions` (auth/RBAC). |
| 0003 | `0003-dictionary-terms.sql` | `terms` (núcleo do dicionário) + `cockpit_hotspots` (3D). Usa `gin_trgm_ops`. |
| 0004 | `0004-rag-embeddings-chat.sql` | `conversations`, `messages`, `document_chunks` (`vector(1536)` + índice HNSW). |
| 0005 | `0005-contributions-history-audit.sql` | `contributions`, `content_revisions`, `audit_log`. |
| 0006 | `0006-components.sql` | `component_categories`, `suppliers`, `components`. |
| 0007 | `0007-projects.sql` | `projects` (projetos veiculares). |
| 0008 | `0008-terms-category-nullable-draft.sql` | `ALTER TABLE terms`: `category` NULLABLE p/ rascunho + CHECK exigindo categoria ao publicar. |

**A ordem importa** (há dependências: `0003` referencia `users` de `0002`;
`0004` referencia `users`; `0006` referencia `terms`/`users`; `0008` altera
`terms` de `0003`). **Rode sempre 0000 → 0008. Se qualquer arquivo der erro,
PARE — não pule para o próximo.**

---

## 1. Criar conta e projeto no Supabase (plano Free)

1. Acesse **https://supabase.com** → **Start your project** / **Sign in**
   (pode entrar com GitHub).
2. No dashboard: **New project**.
3. Preencha:
   - **Organization**: crie/escolha uma (a Free tier permite 1 organização com
     até 2 projetos ativos).
   - **Name**: `stellantis-dictionary` (ou o que preferir).
   - **Database Password**: clique em **Generate a password** OU digite uma
     senha forte (>= 20 caracteres, aleatória).
     **GUARDE em um gerenciador de senhas (1Password/Bitwarden/Keychain).**
     **NÃO cole essa senha no chat nem em nenhum arquivo do repositório.**
     Se perder, dá para redefinir depois em *Settings → Database → Reset
     database password*.
   - **Region**: selecione **South America (São Paulo) — `sa-east-1`**
     (menor latência para o Brasil e alinhado a LGPD — dados no país).
   - **Plan**: **Free**.
4. Clique **Create new project** e aguarde ~2 min até o banco subir.

---

## 2. Extensões

**Não é preciso fazer nada aqui** — a migração `0001` (passo 3) cria `vector`,
`pgcrypto` e `pg_trgm`. Só use o fallback de §0.1 se `0001` acusar erro de
permissão.

---

## 3. Aplicar as migrações `0000` → `0008` (na ordem)

Escolha **UMA** das duas opções. A **Opção A (SQL Editor)** é a mais à prova de
erro e não exige instalar nada.

### Opção A — SQL Editor do Supabase (recomendada)

1. Dashboard → menu lateral **SQL Editor** → **New query**.
2. Para **cada** arquivo, na ordem `0000, 0001, 0002, 0003, 0004, 0005, 0006,
   0007, 0008`:
   a. Abra o arquivo no GitHub (branch `claude/ai-agent-tool-planning-xi33sh`),
      pasta `db/migrations/`, e **copie todo o conteúdo**.
   b. Cole no SQL Editor.
   c. Clique **Run** (ou `Ctrl/Cmd + Enter`).
   d. Confirme que deu **Success**. Se aparecer **erro**, **PARE**: não rode o
      próximo. Copie a mensagem de erro (sem colar segredos) e me repasse para
      diagnóstico.
   e. Limpe o editor e repita com o próximo arquivo.
3. Ao terminar `0008`, siga para o passo 5 (validação).

> Dica: cada arquivo é pequeno (o maior tem ~70 linhas). Rode um de cada vez —
> não junte todos numa query só, para saber exatamente onde parar se algo falhar.

### Opção B — `psql` + connection string (para quem tem psql instalado)

O projeto conecta por `DATABASE_URL` (Postgres puro, driver `pg`). Aplicar as
migrações é rodar cada `.sql` em ordem contra a connection string do Supabase.

1. Instale o cliente `psql` (Postgres client) se ainda não tiver.
2. Pegue a **connection string** no painel (§4.4). Use a do **Session pooler**
   (Supavisor, porta `5432`) — ela tem IPv4 e serve bem para rodar migrações.
3. Exporte a connection string numa variável de ambiente do SEU terminal (NÃO
   digite a senha inline no comando, e NÃO cole no chat):

   ```bash
   read -rs DATABASE_URL   # cole a connection string; ela não fica no histórico
   export DATABASE_URL
   ```

4. A partir da raiz do repositório clonado, rode os arquivos **em ordem**,
   parando no primeiro erro (`ON_ERROR_STOP=1` aborta se qualquer statement
   falhar):

   ```bash
   for f in db/migrations/0000-*.sql \
            db/migrations/0001-*.sql \
            db/migrations/0002-*.sql \
            db/migrations/0003-*.sql \
            db/migrations/0004-*.sql \
            db/migrations/0005-*.sql \
            db/migrations/0006-*.sql \
            db/migrations/0007-*.sql \
            db/migrations/0008-*.sql; do
     echo ">> aplicando $f"
     psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f" || { echo "ERRO em $f — PAREI"; break; }
   done
   ```

   (Se preferir um por vez: `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/0001-extensions.sql`, e assim por diante, na ordem.)

> Observação: estes comandos `psql`/`for` são padrão de shell — **não** há um
> script de migração no repo que os embrulhe. Use exatamente o que está acima.

---

## 4. Onde pegar os valores de conexão (e o que é segredo)

No painel do projeto, **Settings** (engrenagem):

| Valor | Onde | É segredo? | Como me repassar |
|-------|------|-----------|------------------|
| **Project ref** (ex.: `abcdefgh...`) | Settings → General → *Reference ID* | **Não** | Pode me dizer no chat. |
| **Região** (`sa-east-1`) | você escolheu no passo 1 | **Não** | Pode me dizer no chat. |
| **Project URL** (`https://<ref>.supabase.co`) | Settings → API → *Project URL* | Não (derivado do ref) | Pode me dizer no chat. |
| **anon / public key** | Settings → API → *Project API keys* | **Sim, tratar como segredo** (é pública no front, mas não colar em chat/repo) | Secret manager da Cloudflare. |
| **service_role key** | Settings → API → *Project API keys* | **SIM — segredo crítico** (bypassa RLS) | **Somente** secret manager da Cloudflare. Nunca chat/repo. |
| **Connection string** (Session/Transaction pooler) | Settings → Database → *Connection string* | **SIM — contém a senha do banco** | Secret manager da Cloudflare. |
| **Senha do banco** | você definiu no passo 1 | **SIM — segredo** | Gerenciador de senhas; nunca chat/repo. |

**Regra de repasse (repo é público):**
- **Pode dizer no chat, sem risco:** o **Project ref**, o **Project URL** e a
  **região**. Não são segredo.
- **NUNCA no chat nem no repo:** senha do banco, connection string, `anon` key,
  `service_role` key, `GEMINI_API_KEY`. Esses vão **direto para o secret manager
  da Cloudflare** (Workers/Pages → *Settings → Variables and Secrets → Encrypted*)
  quando chegarmos na etapa de deploy do backend. Até lá, guarde no gerenciador
  de senhas.

> Sobre pooler: o app (driver `pg`) usará a connection string do pooler do
> Supabase. Para o backend em execução persistente, o **Session pooler** (porta
> `5432`) atende; se formos para runtime serverless/edge, avaliamos o
> **Transaction pooler** (porta `6543`). Essa escolha final é de engenharia — por
> ora, o importante é você guardar as strings do painel com segurança.

---

## 5. Validar que deu certo

No **SQL Editor**, rode as três queries de verificação:

1. **Extensões instaladas** (tem que aparecer `vector`, `pgcrypto`, `pg_trgm`):

   ```sql
   select extname from pg_extension order by extname;
   ```

2. **Tabelas criadas** (esperado: `audit_log`, `cockpit_hotspots`,
   `component_categories`, `components`, `content_revisions`, `contributions`,
   `conversations`, `document_chunks`, `messages`, `projects`,
   `role_permissions`, `suppliers`, `terms`, `users`):

   ```sql
   select tablename from pg_tables where schemaname = 'public' order by tablename;
   ```

3. **Banco nasce vazio** (as migrações só criam schema, não inserem dados —
   `db/README.md`). Deve retornar `0`:

   ```sql
   select count(*) from terms;
   ```

Se as três baterem (extensões presentes, 14 tabelas em `public`, `terms` com 0
linhas), o Supabase está provisionado e pronto para receber a configuração de
conexão do backend. Me avise (com o **Project ref** e a **região**, que não são
segredo) e seguimos para conectar o backend/Cloudflare.

---

## 6. Checklist rápido

- [ ] Projeto criado no Supabase, plano **Free**, região **São Paulo `sa-east-1`**.
- [ ] Senha do banco guardada no gerenciador de senhas (não no chat/repo).
- [ ] Migrações `0000` → `0008` aplicadas **na ordem**, sem erro.
- [ ] Validação §5 OK (extensões + 14 tabelas + `terms` = 0).
- [ ] Segredos (senha/keys/connection string) fora do chat e do repo.
- [ ] Me repassou apenas **Project ref** + **região** no chat.
