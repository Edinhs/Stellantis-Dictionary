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
- Papéis: `admin` (gerencia dicionário e usuários) e `user` (consulta e usa o chat).
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

### 3.5 Auditoria e Segurança (transversal)
- Logs de acesso e de uso do chat (sem armazenar segredos em texto livre).
- Rate limiting nas rotas de auth e chat.
- Sanitização de entradas (prevenção de SQL Injection, XSS).
- Variáveis sensíveis (API keys de LLM, segredos JWT) via variáveis de ambiente/
  secret manager — nunca hardcoded ou commitadas.
- Criptografia em trânsito (HTTPS/TLS) obrigatória; em repouso, avaliar
  criptografia de colunas sensíveis no Postgres.

## 4. Modelo de dados (rascunho)

- `users (id, name, email, password_hash, role, created_at)`
- `terms (id, term, definition, category, synonyms[], source_type, source_ref, created_by, updated_at)`
- `documents (id, filename, uploaded_by, status, created_at)`
- `document_chunks (id, document_id, content, embedding vector, created_at)`
- `conversations (id, user_id, created_at)`
- `messages (id, conversation_id, role, content, sources_used, created_at)`

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
