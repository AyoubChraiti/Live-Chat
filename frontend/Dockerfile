# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .
RUN npm run build  # Assumes Vite or similar builds to `dist`

# Serve with a lightweight server
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf  # Custom Nginx config for WebSocket proxy

EXPOSE 8080  # Safe port for non-root users
CMD ["nginx", "-g", "daemon off;"]
