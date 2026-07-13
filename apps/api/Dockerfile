FROM node:20-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm install --workspace=apps/api --workspace=packages/shared --include-workspace-root

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace=packages/shared
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
RUN npm run build --workspace=apps/api

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]
