# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder
WORKDIR /app
COPY ../../package.json ../../pnpm-workspace.yaml ../../turbo.json ./
COPY ../../pnpm-lock.yaml* ./
COPY ../../tsconfig.base.json ./
COPY ../../packages ./packages
COPY . .
RUN corepack enable pnpm && pnpm install --frozen-lockfile
RUN pnpm --filter @rt/api build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./package.json
CMD ["node", "dist/main.js"]
