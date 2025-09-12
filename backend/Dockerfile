# Multi-stage build for efficiency
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY tsconfig.json ./
COPY src ./src
RUN npm run build  # Assumes `tsc` builds to `dist`

FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# SQLite needs no extra deps in alpine
EXPOSE 3000  # Safe port for non-root users

# Run as non-root for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["node", "dist/server.js"]  # Adjust if your entrypoint differs
