FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json ./package.json
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.app.json ./tsconfig.app.json
COPY tsconfig.node.json ./tsconfig.node.json
COPY vite.config.ts ./vite.config.ts
COPY index.html ./index.html
COPY src ./src
COPY vendor/ksef-pdf-generator/src ./vendor/ksef-pdf-generator/src
COPY vendor/ksef-pdf-generator/assets ./vendor/ksef-pdf-generator/assets
COPY vendor/ksef-pdf-generator/index.d.ts ./vendor/ksef-pdf-generator/index.d.ts

RUN npm install
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
