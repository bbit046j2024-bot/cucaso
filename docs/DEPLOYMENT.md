# CUCASO Platform Deployment, VPS & Docker Guide

## 1. Prerequisites
- Linux Server (Ubuntu 22.04 LTS or Debian 12 recommended) with minimum 2 vCPU, 4GB RAM.
- Docker Engine & Docker Compose (v2.20+).
- Fully qualified domain name (FQDN): e.g. `cucaso.org` or `portal.cucaso.org`.
- Managed MySQL 8.0+ / TiDB cluster or containerized database.

---

## 2. Docker Deployment Stack

### `Dockerfile` (Multi-Stage Build)
```dockerfile
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

### `docker-compose.yml`
```yaml
version: '3.8'

services:
  app:
    build: .
    restart: always
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    depends_on:
      - db

  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: cucaso
      MYSQL_USER: cucaso_user
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - cucaso_db_data:/var/lib/mysql

volumes:
  cucaso_db_data:
```

---

## 3. Reverse Proxy & TLS (Nginx + Certbot)
```nginx
server {
    listen 80;
    server_name cucaso.org www.cucaso.org;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cucaso.org www.cucaso.org;

    ssl_certificate /etc/letsencrypt/live/cucaso.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cucaso.org/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 4. Zero-Downtime Deployment Command
```bash
git pull origin main
npm ci
npx prisma generate
npx prisma db push
npm run build
pm2 reload cucaso || docker compose up -d --build
```
