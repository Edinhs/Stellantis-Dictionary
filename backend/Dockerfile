# PLACEHOLDER — Dockerfile do backend (Node/TS).
# =============================================================================
# Entrega T06 / devops-baseline. Estrutura multi-stage já esboçada para o
# bootstrap real (T07/T08). Enquanto não há `package.json`/`src` reais, o build
# NÃO deve ser executado no CI de merge (o job docker-build é opcional/informativo).
#
# Princípios fixados (não alterar sem revisão do Segurança Lead):
#   - Multi-stage: builda com devDeps, runtime só com dist/ + deps de produção.
#   - Roda como usuário NÃO-root (USER node).
#   - NODE_ENV=production no runtime; `npm ci` (não `npm install`).
#   - Sem segredos em ARG/ENV de build.

# --- Stage 1: build ----------------------------------------------------------
FROM node:20-slim AS build
WORKDIR /app

# Cache de layer: copia manifests primeiro.
COPY package*.json ./
RUN npm ci

# Código-fonte + build TypeScript (gera dist/).
COPY . .
RUN npm run build

# --- Stage 2: runtime --------------------------------------------------------
FROM node:20-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Apenas os artefatos de produção.
COPY --from=build /app/dist ./dist

# Usuário não-root já existe na imagem oficial do Node.
USER node

EXPOSE 3000
CMD ["node", "dist/index.js"]
