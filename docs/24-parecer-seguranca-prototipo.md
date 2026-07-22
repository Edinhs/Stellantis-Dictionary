# 24 — Parecer de Segurança do Protótipo (LGPD / OWASP)

Status: **rascunho**.
> Última atualização: 2026-07-17.
> Autoria: Segurança Lead.
> Deriva do parecer de segurança sobre o protótipo em `prototypes/portal-spa/` e
> dos documentos `20-prototipo-referencia.md`, `21-requisitos-funcionais.md` e
> `22-requisitos-nao-funcionais.md`. Rastreabilidade adicional: SPEC
> `09-plataforma-comunitaria-cargos-spec.md` (RBAC/`can()`), doc
> `13-arquitetura-modular.md` (arquitetura-alvo).

> **Nota de manuseio:** este documento **não reproduz dados pessoais reais** — o
> próprio objetivo é reduzir a exposição de PII. Pessoas são referidas por
> **categoria e contagem**; hosts internos por **categoria**, sem nomes próprios
> nem hostnames específicos.

---

## 1. Veredito

- **Versionar o protótipo em repositório interno**: **aceitável, com ressalvas**
  (ver achados críticos/altos e a tabela de recomendações da §3).
- **Publicar o protótipo externamente** (ex.: GitHub Pages, link público sugerido
  no README original): ~~BLOQUEADO até tratar os achados CRÍTICO e ALTO~~ —
  **DESBLOQUEADO (CEO, 2026-07-19):** o achado CRÍTICO 2.1(1)/R1/R2 dependia da
  natureza dos dados do organograma; o CEO confirmou que **são fictícios**, o que
  remove a base do bloqueio (não há PII real a expor). O protótipo já foi publicado
  via GitHub Pages. R4/R5 (domínios/códigos/fornecedores genéricos) foram
  **implementados em 2026-07-22** (pedido do CEO de remover dados de teste/fake
  do site antes da carga de dados reais) — ver §3. R3 (histórico git) segue
  aberto: os valores reais anteriores permanecem em commits antigos; reescrita
  de histórico é destrutiva e depende de decisão explícita do CEO/DevOps.
- **Migração para o produto real**: depende da implementação de **autenticação,
  RBAC e moderação** — respectivamente RF-062, RF-063 e RF-064 (doc `21`). Sem
  esses controles, os fluxos de cocriação não podem ir a um ambiente multiusuário.

---

## 2. Achados por severidade

### 2.1 CRÍTICO

1. **Dados pessoais reais já versionados no organograma.** O *seed* do organograma
   (`stellantis_hierarchy`, ver doc `20` §4) embute **~205 nomes reais** com cargo
   e hierarquia, além de **marcações de vínculo** (ex.: terceirizado/estagiário).
   Sob a **LGPD**, não há base legal identificada para esse tratamento e há
   violação do princípio da **minimização** — dados pessoais sensíveis ao contexto
   trabalhista foram incorporados a um artefato de demonstração sem necessidade.
2. ~~Decisão do CEO pendente sobre dados reais vs. fictícios.~~ **RESOLVIDA
   (CEO, 2026-07-19):** o CEO confirmou que os dados do organograma/especialistas
   no protótipo **são fictícios** ("ainda não possui dados reais, portanto não tem
   o que expor"). **B2 fechado.** O risco 2.1(1) deixa de ser um bloqueio de fato —
   permanece como **diretriz de projeto**: ao popular o `directory` real (Etapa 9),
   manter dados fictícios/anonimizados até uma migração segura com base legal e
   RBAC (S6, doc `25` §8), e revalidar antes de qualquer publicação externa ou
   ingestão de dados reais no futuro.

### 2.2 ALTO

1. **Domínios e topologia interna versionados.** Mocks referenciam **domínios
   internos `*.stellantis.com`**, incluindo ao menos um **subdomínio que revela a
   planta/localidade**. Isso habilita **reconhecimento (recon)** de infraestrutura
   por terceiros caso publicado.
2. **Segredo de negócio exposto.** Constam **códigos internos de projeto veicular**
   e a associação a **fornecedores Tier-1** (componentes de infotainment). A
   combinação é informação concorrencialmente sensível e não deve sair do perímetro
   interno.

### 2.3 MÉDIO

1. **Proveniência/licença não documentada** dos **logos das 14 marcas** e das
   imagens/avatares (doc `20` §7). Falta um registro de origem e direitos de uso →
   criar `prototypes/portal-spa/assets/CREDITS.md`.
2. **`innerHTML` com dados de `localStorage`.** As grades são montadas por
   *template string* + `innerHTML` (doc `20` §2) com conteúdo cocriado. Hoje é
   apenas **self-XSS** (o dado é do próprio navegador), mas na migração com
   cocriação + backend vira **XSS armazenado real**. Exigir, no produto: **escape
   de saída**, **CSP** e **sanitização** de entrada/renderização.

### 2.4 BAIXO

1. **Upload de avatar sem validação de MIME/tipo.** Aceitável no protótipo local;
   na migração, **validar tipo/tamanho no backend** e rejeitar conteúdo executável.
2. **Ausência de autenticação/RBAC** — esperado nesta fase (RF-062/RF-063
   [FUTURO]). Ressalva de projeto: **XP/gamificação NÃO pode virar papel de
   permissão**; manter a progressão separada de `role`, conforme SPEC `09`
   (permissões resolvidas por `can()`, não por nível de gamificação).

### 2.5 INFORMATIVO

- **Sem segredos hardcoded** no código do protótipo (bom). Manter essa disciplina
  na migração (segredos via variáveis de ambiente/secret manager — DevOps).
- **CDNs sem SRI.** Lucide, three.js r128, OrbitControls e GLTFLoader entram por
  CDN sem `integrity` (doc `20` §2). No produto: **fixar versão + atributo
  `integrity` (SRI)** e, de preferência, servir localmente.

---

## 3. Recomendações priorizadas

| # | Ação | Severidade | Dono | Bloqueia publicação? |
|---|---|---|---|---|
| R1 | ~~Anonimizar o organograma~~ — **CEO confirmou (2026-07-19) que os ~205 nomes já são fictícios/demonstração.** Manter fictício ao popular a Etapa 9. | ~~CRÍTICO~~ RESOLVIDO | Doc Lead / Eng | Não (já atendido) |
| R2 | ~~Obter decisão do CEO sobre dados reais vs. fictícios~~ — **RESOLVIDA:** fictícios. | ~~CRÍTICO~~ RESOLVIDO | Agente Geral → CEO | Não (já atendido) |
| R3 | Se houver publicação externa, **limpar o histórico git** (dados já commitados) | ALTO | DevOps | **Sim** (só se publicar) — **AINDA ABERTO**: o conteúdo real (fornecedores/domínios/códigos) permanece em commits antigos até uma reescrita de histórico ser decidida com o CEO/DevOps. |
| R4 | ~~Substituir domínios internos por placeholders~~ — **RESOLVIDO (2026-07-22):** todos os hosts `*.stellantis.com` em `prototypes/portal-spa/app.js`/`index.html` (incl. e-mails de especialistas fictícios) trocados por `*.exemplo.interno`, a pedido do CEO (limpeza de dados de teste/fake antes do deploy real). | ~~ALTO~~ RESOLVIDO | Eng Lead | Não (já atendido) |
| R5 | ~~Generalizar códigos de projeto e fornecedores Tier-1 nos mocks~~ — **RESOLVIDO (2026-07-22):** fornecedores reais (Aptiv/Bosch/Magneti Marelli/Harman Kardon/Continental/ZF/Valeo/Forvia) substituídos por 8 fornecedores fictícios (`alfa`/`beta`/`gama`/`delta`/`epsilon`/`zeta`/`eta`/`theta`, rótulo "(fictício)"), sem alegação de parceria real com a Stellantis; códigos internos de projeto `J3U`/`T90`/`J4U` trocados por `DEMO1`/`DEMO2`/`DEMO3`. | ~~ALTO~~ RESOLVIDO | Eng Lead | Não (já atendido) |
| R6 | Criar `assets/CREDITS.md` com proveniência/licença de logos e imagens | MÉDIO | Doc Lead | Não |
| R7 | Requisitos de segurança na migração: **escape de saída + CSP + sanitização** | MÉDIO | Frontend / Eng | Não |
| R8 | Validação de MIME/tamanho de upload **no backend** | BAIXO | Backend | Não |
| R9 | Manter XP/gamificação **desacoplado de `role`**; acesso só por `can()` | BAIXO | Backend | Não |
| R10 | Fixar versão de CDNs + **SRI** (ou servir localmente) | INFORMATIVO | Frontend / DevOps | Não |

> R1–R5 são **pré-condições de publicação externa**. R6–R10 podem ser tratadas na
> migração para o produto, mas devem entrar no backlog (`04-tasks.md`).

---

## 4. Perguntas em aberto

1. ~~Dados reais vs. fictícios~~ — **RESOLVIDA (CEO, 2026-07-19): fictícios.**
   Diretriz mantida: seguir fictício/anonimizado até uma migração segura com base
   legal e RBAC.
2. ~~Haverá publicação externa do protótipo?~~ — **RESOLVIDA: sim**, o protótipo já
   está publicado via GitHub Pages (repositório público `Edinhs/Stellantis-Dictionary`,
   `https://edinhs.github.io/Stellantis-Dictionary/`), autorizado pelo CEO com base
   na confirmação do item 1 (dados fictícios). R4/R5 (domínios internos/códigos de
   projeto) e R3 (histórico git) permanecem como itens de atenção — dados de
   demonstração, sem PII real, mas ainda com nomes de domínio e códigos de projeto
   que podem exigir generalização; não bloqueiam por não haver PII, porém seguem
   como melhoria recomendada (doc `27` A-itens).
3. **Nível WCAG-alvo** do produto (A / AA / AAA) — herdado da pergunta em aberto do
   doc `22` (RNF-014, §198). Impacta requisitos de acessibilidade da migração. *—
   ainda em aberto.*
