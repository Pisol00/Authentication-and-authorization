# Development image: dependencies are installed inside the container (Linux binaries),
# source code is bind-mounted by docker-compose for hot reload.
FROM node:24-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]
EXPOSE 4000
