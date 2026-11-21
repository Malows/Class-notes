FROM node:22-alpine AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
# $env/static/private se resuelve en build time: la app necesita DATABASE_NAME aquí.
ENV DATABASE_NAME=/app/data/class-notes.db
# El módulo de BD abre el archivo al importarse, así que el directorio debe existir ya.
RUN mkdir -p /app/data
RUN pnpm build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
# Las migraciones son .sql y Vite no las incluye en /build; el runtime las lee desde ahí.
COPY --from=builder /app/src/lib/server/database/migrations ./build/server/chunks/migrations
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
VOLUME /app/data
ENV DATABASE_NAME=/app/data/class-notes.db
EXPOSE 3000
CMD ["node", "build/index.js"]
