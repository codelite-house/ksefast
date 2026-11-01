FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json ./package.json
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.app.json ./tsconfig.app.json
COPY tsconfig.node.json ./tsconfig.node.json
COPY vite.config.ts ./vite.config.ts
COPY index.html ./index.html
COPY public ./public
COPY src ./src

RUN npm install
RUN npm run build

FROM nginx:1.27-alpine AS runtime
# nginx.conf jest szablonem: entrypoint obrazu podstawia BACKEND_HOST/BACKEND_PORT i zapisuje
# wynik jako /etc/nginx/conf.d/default.conf. Filtr ogranicza envsubst do tych dwóch zmiennych,
# żeby nie ruszać zmiennych nginx ($host, $remote_addr, ...).
ENV BACKEND_HOST=backend \
    BACKEND_PORT=3001 \
    NGINX_ENVSUBST_FILTER=^BACKEND_
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
