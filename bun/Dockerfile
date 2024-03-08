# syntax=docker/dockerfile:1

FROM --platform=linux/amd64 oven/bun:1.0.30 as builder

ENV NODE_ENV=production

WORKDIR /app
COPY bun/package.json bun/bun.lockb ./
RUN bun install

COPY node/src ./src

ENTRYPOINT  [ "bun", "src/index.ts" ]

# FIXME make it work with build file
# RUN bun run build
# RUN chmod +x main

# FROM --platform=linux/amd64 oven/bun:1.0.30 as runner

# WORKDIR /app
# COPY --from=builder /app/main ./

#USER bun
#ENTRYPOINT [ "./main" ]