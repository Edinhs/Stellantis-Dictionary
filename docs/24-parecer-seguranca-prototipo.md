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
  no README original): **BLOQUEADO** até tratar os achados CRÍTICO e ALTO.
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
2. **Decisão do CEO pendente sobre o doc `22` §9.4.** A recomendação de **não usar
   pessoas reais** até a migração segura (doc `22` §9.4 e pergunta em aberto §2 lá)
   segue **em aberto**. Enquanto não decidida, o risco 2.1(1) permanece ativo e
   bloqueia publicação.

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
| R1 | Anonimizar o organograma: substituir os ~205 nomes reais por **seed fictício** | CRÍTICO | Doc Lead / Eng | **Sim** |
| R2 | Obter **decisão do CEO** sobre dados reais vs. fictícios (doc `22` §9.4) | CRÍTICO | Agente Geral → CEO | **Sim** |
| R3 | Se houver publicação externa, **limpar o histórico git** (dados já commitados) | ALTO | DevOps | **Sim** (só se publicar) |
| R4 | Substituir domínios internos por **placeholders** (`exemplo.interno`) | ALTO | Doc Lead / Eng | **Sim** |
| R5 | **Generalizar** códigos de projeto e fornecedores Tier-1 nos mocks | ALTO | Eng | **Sim** |
| R6 | Criar `assets/CREDITS.md` com proveniência/licença de logos e imagens | MÉDIO | Doc Lead | Não |
| R7 | Requisitos de segurança na migração: **escape de saída + CSP + sanitização** | MÉDIO | Frontend / Eng | Não |
| R8 | Validação de MIME/tamanho de upload **no backend** | BAIXO | Backend | Não |
| R9 | Manter XP/gamificação **desacoplado de `role`**; acesso só por `can()` | BAIXO | Backend | Não |
| R10 | Fixar versão de CDNs + **SRI** (ou servir localmente) | INFORMATIVO | Frontend / DevOps | Não |

> R1–R5 são **pré-condições de publicação externa**. R6–R10 podem ser tratadas na
> migração para o produto, mas devem entrar no backlog (`04-tasks.md`).

---

## 4. Perguntas em aberto

1. **Dados reais vs. fictícios** — o CEO usará **pessoas reais** ou substituirá por
   *seed* fictício no organograma/especialistas? Recomendação de Segurança:
   **fictício** até a migração segura (doc `22` §9.4). *— decisão do CEO em aberto.*
2. **Haverá publicação externa** do protótipo (GitHub Pages/link público)? Se sim,
   R1–R5 e a limpeza de histórico (R3) tornam-se obrigatórias antes. *— ainda em
   aberto.*
3. **Nível WCAG-alvo** do produto (A / AA / AAA) — herdado da pergunta em aberto do
   doc `22` (RNF-014, §198). Impacta requisitos de acessibilidade da migração. *—
   ainda em aberto.*
