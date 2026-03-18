FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json ./package.json
COPY tsconfig.json ./tsconfig.json
COPY src ./src

RUN npm install
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./package.json
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
RUN mkdir -p /app/backend/data

EXPOSE 3001
CMD ["node", "dist/server.js"]
