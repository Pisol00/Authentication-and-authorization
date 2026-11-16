# Development image: dependencies are installed inside the container (Linux binaries),
# source code is bind-mounted by docker-compose for hot reload.
FROM node:24-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# --host: listen on 0.0.0.0 so the browser on the host can reach Vite
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
EXPOSE 5173
