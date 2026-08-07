FROM node:20-alpine AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ENV VITE_API_BASE_URL=http://localhost:8007/ \
    VITE_RUNTIME_API_BASE_URL=http://localhost:8006/server/ \
    VITE_AGENT_API_BASE_URL=http://localhost:8007/api/v1/sapper/sapperchain/api/

RUN pnpm build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY env.sh /docker-entrypoint.d/40-sapper-env.sh
COPY --from=build /app/dist /usr/share/nginx/html

RUN chmod +x /docker-entrypoint.d/40-sapper-env.sh

EXPOSE 80
