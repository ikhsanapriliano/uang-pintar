# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --force --ignore-scripts

ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

COPY . .

RUN npx prisma generate

ENV HUSKY=0
ENV NODE_ENV=production

RUN npm run build

RUN npm prune --production --force

# Production stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]