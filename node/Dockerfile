# syntax=docker/dockerfile:1

FROM node:21.7-alpine3.19 as builder

RUN npm install -g pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY src ./src
RUN pnpm build

FROM node:21.7-alpine3.19 as runner

ENV NODE_ENV=production

WORKDIR /app
COPY --from=builder /app/build/handler.js /app/build/handler.js.map ./

CMD ["node", "handler.js"]
