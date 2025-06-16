FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/public/models /usr/share/nginx/html/models
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80