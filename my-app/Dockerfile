# ─── Frontend Dockerfile (multi-stage) ────────────────────────────────
# Stage 1: Install and build
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# NEXT_PUBLIC_API_URL is baked in at build time.
# Pass it as a build arg: --build-arg NEXT_PUBLIC_API_URL=https://your-api.railway.app
ARG NEXT_PUBLIC_API_URL=http://localhost:9000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ─────────────────────────────────────────────────────────────────────
# Stage 2: Production runner (only the Next.js standalone output)
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only what Next.js needs to run
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
