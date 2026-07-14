# SPEC — Especificação Técnica

Status: **rascunho para validação** (nenhuma decisão aqui é final até aprovação).

## 1. Arquitetura geral

```
┌─────────────┐     HTTPS      ┌──────────────────┐     ┌──────────────────┐
│  Frontend   │ ─────────────▶ │  Backend API     │────▶│ Postgres + pgvector│
│ (SPA HTML)  │ ◀───────────── │ (REST/JSON)      │     │ (usuários, termos, │
└─────────────┘                │  Auth, RBAC,     │     │  embeddings, chats)│
                                │  RAG orchestrator│     └──────────────────┘
                                └────────┬─────────┘
                                         │
                                         ▼
                                ┌──────────────────┐
                                │  LLM Provider     │
                                │ (Claude ou OpenAI,│
                                │  via adapter)     │
                                └──────────────────┘
```

## 2. Stack recomendada (a confirmar com o usuário)

| Camada | Escolha recomendada | Justificativa |
|---|---|---|
| Frontend | HTML/CSS/JS (ou React se preferir escalar) servido via SPA | Requisito original: "página HTML"; simples de rodar em qualquer máquina via navegador |
| 3D | `three.js` ou `<model-viewer>` + modelo `.glb` (compressão Draco) | Explorador 3D do cockpit na página principal, com hotspots ligados ao dicionário |
| Backend | Node.js + TypeScript (Fastify/Express) | Tipagem forte, mesma linguagem do frontend, boas libs de segurança (helmet, rate-limit) |
| Banco de dados | PostgreSQL + extensão `pgvector` | Um único banco para dados relacionais (usuários, termos) e vetores (embeddings) — evita depender de serviço externo de vetores, mais fácil de auditar/isolar dados confidenciais |
| Autenticação | JWT (access + refresh token) com hash de senha via `argon2`/`bcrypt`, MFA opcional na fase 2 | Padrão robusto e amplamente auditado |
| Autorização | RBAC simples (papéis: `admin`, `usuário`) | Atende ao requisito multiusuário sem complexidade excessiva no MVP |
| LLM | Camada de adapter (`LlmProvider` interface) suportando Claude e OpenAI | Decisão de provedor pode mudar sem reescrever a aplicação |
| Hospedagem | A definir — recomenda-se ambiente interno/privado (VPC ou servidor on-prem) dado o caráter confidencial dos dados | Ver seção "Segurança" |

> Pergunta em aberto: hospedar em nuvem privada da empresa, VPS próprio, ou
> rodar localmente em cada máquina (ex.: Docker Compose local)? Isso muda a
> estratégia de deployment no PDR.

## 3. Módulos funcionais

### 3.1 Autenticação & Usuários
- Cadastro (nome, e-mail corporativo, senha).
- Login com JWT; refresh token em cookie `httpOnly`, `secure`, `sameSite=strict`.
- **Cargos (comunitário)**: `user` (Usuário comum — **default no cadastro**),
  `coordinator` (Coordenador) e `admin` (Administrador). Só `coordinator`/`admin`
  atribuem cargos a outros usuários. Autorização por **permissões nomeadas**
  resolvidas por cargo — ver SPEC `09-plataforma-comunitaria-cargos-spec.md`.
- Recuperação de senha (fase 2, requer serviço de e-mail).

### 3.2 Dicionário (CRUD)
- Entidade `Term`: sigla/termo, definição, categoria (ex.: processo, sistema,
  cargo), sinônimos, fonte (manual ou documento), autor, data de atualização.
- Busca textual simples (fallback quando o chat não é necessário).
- Painel do `admin` para aprovar/editar termos sugeridos por usuários (fase 2).

### 3.3 Ingestão de documentos (fase 2)
- Upload de PDF/DOCX/planilha.
- Pipeline: extração de texto → chunking → geração de embeddings → armazenamento
  em `pgvector` vinculado ao documento de origem.

### 3.4 Chatbot RAG
- Fluxo: pergunta do usuário → embedding da pergunta → busca por similaridade no
  `pgvector` (termos + chunks de documentos) → montagem de contexto → prompt para
  o LLM → resposta citando a(s) fonte(s) usada(s).
- Histórico de conversa por usuário (para continuidade e para auditoria).
- Guardrails: o chatbot deve responder apenas com base no contexto recuperado
  quando a pergunta for sobre o dicionário/setor, evitando alucinação sobre temas
  fora do escopo.

### 3.5 Explorador 3D do Cockpit
Componente da página principal que renderiza um modelo 3D do veículo/cockpit e o
conecta ao dicionário.

- **Renderização**: modelo 3D no formato `glTF`/`.glb` renderizado no navegador.
  Recomendação: `three.js` (controle total sobre hotspots e câmera) ou, para um MVP
  mais rápido, o web component `<model-viewer>` (rotação e "hotspots" prontos).
- **Interação**:
  - Rotacionar o modelo com o mouse (orbit controls); zoom e pan opcionais.
  - **Hotspots** = pontos/áreas âncoradas em partes do modelo (HUD, cluster,
    central display, comandos do volante, alto-falantes/microfones, etc.).
  - Hover/clique no hotspot → tooltip/painel lateral com o **nome** da peça e uma
    **prévia curta** (as primeiras linhas do verbete).
  - Clique no termo dentro da prévia → navega para a rota do dicionário do termo
    correspondente (ex.: `/dicionario/{slug}`), abrindo a explicação completa.
- **Fonte da verdade**: cada hotspot referencia um `term` do dicionário por `slug`.
  Assim o conteúdo mostrado no 3D nunca duplica texto — sempre vem do dicionário,
  mantendo uma única fonte de verdade e reaproveitando o mesmo RAG.
- **Configuração de hotspots**: posições (coordenadas no modelo) + `term_slug`
  ficam em uma tabela/JSON versionado, editável pelo `admin` (fase posterior);
  no MVP pode ser um JSON estático de sementes.
- **Desempenho/segurança**: o `.glb` é um asset estático servido pelo frontend;
  nenhum dado confidencial embarcado no modelo. Otimizar o tamanho do modelo
  (compressão Draco) para carregamento rápido. Sem execução de código externo.
- **Acessibilidade/fallback**: se o dispositivo não suportar WebGL, exibir uma
  imagem estática com áreas clicáveis (image-map) apontando para os mesmos termos.

### 3.6 Auditoria e Segurança (transversal)
- Logs de acesso e de uso do chat (sem armazenar segredos em texto livre).
- Rate limiting nas rotas de auth e chat.
- Sanitização de entradas (prevenção de SQL Injection, XSS).
- Variáveis sensíveis (API keys de LLM, segredos JWT) via variáveis de ambiente/
  secret manager — nunca hardcoded ou commitadas.
- Criptografia em trânsito (HTTPS/TLS) obrigatória; em repouso, avaliar
  criptografia de colunas sensíveis no Postgres.

## 4. Modelo de dados (rascunho)

- `users (id, name, email, password_hash, role, created_at)`
  — `role` enum: `user` (default) | `coordinator` | `admin`.
- `terms (id, term, definition, category, synonyms[], source_type, source_ref, created_by, updated_at)`
- `documents (id, filename, uploaded_by, status, created_at)`
- `document_chunks (id, document_id, content, embedding vector, created_at)`
- `conversations (id, user_id, created_at)`
- `messages (id, conversation_id, role, content, sources_used, created_at)`
- `cockpit_hotspots (id, model_id, label, term_slug, position_x, position_y, position_z, created_at)`
  — pontos clicáveis do modelo 3D; `term_slug` liga ao verbete em `terms`.
- (Opcional) `terms.slug` — identificador amigável para URL do verbete, usado tanto
  pelo dicionário quanto pelos hotspots do Explorador 3D.

### Extensões comunitárias (ver SPECs `08` e `09`)
- **Diretório** (`08`): `sectors`, `people`, `sector_owners`, `component_specialists`.
- **Cargos/permissões** (`09`): `role_permissions (role, permission)`.
- **Fluxo de trabalho** (`09`): `workflows (id, slug, title, description, category, steps, related_terms[], status, created_by, metadata, ...)`.
- **Contribuição/histórico** (`09`): `contributions`, `content_revisions` (rollback), `audit_log` (append-only).
- Toda tabela nova inclui `metadata jsonb` + timestamps (regra de extensibilidade).

## 5. Requisitos não funcionais
- **Segurança**: prioridade máxima (ambiente empresarial). Seguir OWASP ASVS
  nível básico/intermediário no mínimo.
- **Desempenho**: resposta do chat em até ~5s para bases pequenas/médias.
- **Portabilidade**: rodar via Docker Compose para facilitar uso em diferentes
  máquinas/setores.
- **Observabilidade**: logs estruturados; health-check endpoint.

## 6. Fora de escopo (v1)
- SSO corporativo (Azure AD/SAML) — considerar na visão futura.
- App mobile nativo.
- Multi-idioma (assume-se português como idioma único no MVP).
- **Modelagem 3D autoral de um veículo Stellantis real**: no MVP usa-se um modelo
  genérico/placeholder de carro ou cockpit (licença livre) apenas para validar a
  interação de hotspots. Obter/produzir um modelo oficial e de alta fidelidade fica
  para fase posterior e depende de disponibilização do asset. A imagem de referência
  ("Cockpit Introduction") guia quais peças destacar, não é o modelo em si.
