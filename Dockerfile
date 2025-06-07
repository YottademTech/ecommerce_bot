# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# If using TypeScript, install ts-node and build dependencies
RUN npm install -g ts-node typescript

# Expose the port (if your bot uses a webhook or HTTP server)
EXPOSE 6194

# Set environment variables (optional, can be set in Coolify UI)
# ENV NODE_ENV=production
# REDIS_URL will be set at runtime by Coolify

# Start the bot using ts-node
CMD ["npx", "ts-node", "src/index.ts"] 