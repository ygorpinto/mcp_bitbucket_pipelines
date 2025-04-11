# Use Node.js LTS version
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Set environment variables
ENV NODE_ENV=production

# Remover a exposição da porta, já que o MCP usa stdin/stdout
# EXPOSE 3444

# Comando para iniciar o servidor MCP
CMD ["node", "dist/index.js"] 