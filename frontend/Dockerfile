# ==============================================================
# MULTI-STAGE DOCKERFILE FOR FRONTEND (VITE + REACT + NGINX)
# ==============================================================

# Stage 1: Build static assets
FROM node:20-alpine AS builder
WORKDIR /app

# Cache package dependencies layer
COPY package.json package-lock.json* ./
RUN npm install

# Build static production bundle
COPY . .
RUN npm run build

# Stage 2: Serve with lightweight, optimized Nginx
FROM nginx:alpine-slim

# Copy custom Nginx configuration with SPA support and API reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production build from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
