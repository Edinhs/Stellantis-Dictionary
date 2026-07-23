-- 0008 — permite `terms.category` NULL enquanto o verbete for RASCUNHO, e
-- exige categoria canonica para PUBLICAR. Motivacao (CEO 2026-07-23): chegou a
-- 1a leva de conteudo real (sigla + significado em ingles, ~749 siglas). O CEO
-- classifica a categoria e traduz para PT MANUALMENTE depois, editando cada
-- card. Ate la, esses termos entram como `status='draft'` sem categoria.
--
-- PROBLEMA: `terms.category` era NOT NULL + CHECK nas 4 categorias canonicas
-- (0003). Nao ha categoria ainda, e NAO se deve inventar a categoria correta de
-- cada sigla (isso e trabalho editorial do CEO).
--
-- DECISAO DE ENGENHARIA (opcao "a" do pedido, refinada): tornar `category`
-- NULLABLE em vez de (b) adicionar uma 5a categoria "a classificar" ao CHECK.
-- Justificativa:
--   - A taxonomia canonica continua EXATAMENTE {motorizacao, tecnologia,
--     componentes, plataformas} — nao poluimos o vocabulario do produto (as
--     abas de filtro, o indice, o RAG) com uma pseudo-categoria. `NULL` diz a
--     verdade ("ainda nao classificado"), um valor-sentinela mentiria.
--   - A regra de negocio real ("nao se publica sem classificar") passa a ser
--     GARANTIA no banco, nao so na aplicacao: um novo CHECK exige categoria
--     quando `status='published'`. Publicar um card forca a classificacao.
--   - O CHECK de dominio original ja aceita NULL (em SQL, `NULL IN (...)` e
--     UNKNOWN, e um CHECK so reprova em FALSE) — logo remover o NOT NULL basta
--     para permitir rascunho sem categoria, sem afrouxar a validacao dos
--     valores nao-nulos.
-- Mantem a disciplina "mudanca = nova migracao" (db/README.md); 0003 nao e
-- reescrito.

ALTER TABLE terms ALTER COLUMN category DROP NOT NULL;

-- Um verbete PUBLICADO precisa ter categoria canonica; rascunho pode ser NULL.
ALTER TABLE terms
  ADD CONSTRAINT terms_published_requires_category
  CHECK (status <> 'published' OR category IS NOT NULL);
