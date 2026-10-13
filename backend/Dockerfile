FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace manifests
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY dashboard/package.json ./dashboard/
COPY extension/package.json ./extension/

# Install dependencies
RUN npm ci

# Copy backend source code
COPY backend ./backend

# Build backend
WORKDIR /app/backend
RUN npm run build

# Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/src/db/schema.sql ./backend/dist/db/schema.sql

EXPOSE 3001

CMD ["node", "backend/dist/index.js"]
