# Stage 1: build the React client
FROM node:20-alpine AS client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: run the Express server, which also serves the built client
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./server/
RUN npm install --omit=dev --prefix server
COPY server/ ./server/
COPY --from=client /app/client/dist ./client/dist
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "server/src/index.js"]
