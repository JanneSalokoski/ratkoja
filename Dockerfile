FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN chmod -R o+r /app/dist

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx.conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
