# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY ../../package.json ../../pnpm-workspace.yaml ../../turbo.json ./
COPY ../../pnpm-lock.yaml* ./
COPY ../../tsconfig.base.json ./
COPY ../../packages ./packages
COPY . .
RUN corepack enable pnpm && pnpm install --frozen-lockfile
RUN pnpm --filter @rt/web build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/apps/web/.next ./.next
COPY --from=deps /app/apps/web/node_modules ./node_modules
COPY --from=deps /app/apps/web/package.json ./package.json
COPY --from=deps /app/apps/web/public ./public
EXPOSE 3000
CMD ["pnpm", "start"]
