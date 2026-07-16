# ─── Backend Dockerfile ───────────────────────────────────────────────
# Node 20 slim — keeps the image small
FROM node:20-slim

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the source
COPY . .

EXPOSE 9000

CMD ["npm", "start"]
