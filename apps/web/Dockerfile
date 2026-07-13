FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm install --workspace=apps/web --workspace=packages/shared --include-workspace-root

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/web

FROM nginx:alpine AS runtime
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
