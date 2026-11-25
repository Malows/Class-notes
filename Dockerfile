# syntax=docker/dockerfile:1

# --- base: pinned toolchain shared by the stages that need to install packages ---
FROM node:26-alpine AS base
RUN npm install -g pnpm@12.23.0
WORKDIR /app

# --- deps: full dependency tree (dev included) needed to compile the app ---
FROM base AS deps
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# --- build: static app + server bundle + build/migrate.js + build/migrations ---
FROM deps AS build
COPY . .
RUN pnpm build

# --- prod-deps: runtime dependency tree only (better-sqlite3 compiled for this base) ---
FROM base AS prod-deps
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --prod --frozen-lockfile

# --- runtime: no source tree, no build toolchain, non-root ---
FROM node:26-alpine AS runtime
ENV NODE_ENV=production \
    DATABASE_PATH=/app/data/class-notes.db \
    MIGRATIONS_DIR=/app/migrations
WORKDIR /app
# node:26-alpine already ships uid/gid 1000 as `node`; reuse it instead of adding a user.
RUN mkdir -p /app/data && chown -R node:node /app
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/build ./build
COPY --from=build --chown=node:node /app/src/lib/server/database/migrations ./migrations
COPY --chown=node:node package.json docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh
VOLUME ["/app/data"]
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["./docker-entrypoint.sh"]
