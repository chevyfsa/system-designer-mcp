FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN bun install --production
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["node", "dist/http-server.js"]
