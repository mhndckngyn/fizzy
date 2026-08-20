FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM deps AS build
COPY prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
RUN bunx prisma generate

FROM oven/bun:1 AS final
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/generated ./generated
COPY package.json bun.lock prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
EXPOSE 4000
ENTRYPOINT ["bun", "run", "src/server.ts"]
