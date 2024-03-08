# syntax=docker/dockerfile:1

FROM --platform=linux/amd64 oven/bun:alpine as builder

ENV NODE_ENV=production

WORKDIR /app
COPY bun/package.json bun/bun.lockb ./
RUN bun install

COPY node/src ./src

# ENTRYPOINT  [ "bun", "--smol", "src/index.ts" ]

RUN bun build ./src/index.ts --target bun --outfile=index.js --minify
ENTRYPOINT [ "bun", "--smol", "run", "index.js" ]

# FIXME make it work with build file
# RUN bun run build
# RUN chmod +x main

# FROM --platform=linux/amd64 oven/bun:1.0.30 as runner

# WORKDIR /app
# COPY --from=builder /app/main ./

#USER bun
#ENTRYPOINT [ "./main" ]