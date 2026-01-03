FROM node:20-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY public ./public

RUN npm run build \
  && cp src/data/schema.sql dist/data/schema.sql \
  && npm prune --omit=dev

# Runtime stage: run compiled JavaScript only
FROM node:20-slim AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public

RUN mkdir -p /app/dist/src/data

EXPOSE 3000

CMD ["node", "dist/index.js"]