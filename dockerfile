# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --frozen-lockfile

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Run the application
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install only production dependencies
COPY package*.json ./
RUN npm install --frozen-lockfile --production

# Copy built files from the builder stage
COPY --from=builder /app/dist ./dist

# Copy tsconfig.json for migration generation
COPY tsconfig.json ./

# Copy any other necessary files (e.g., public assets)
# COPY --from=builder /app/public ./public

# Specify the port number the container should expose
EXPOSE 3000

# Define environment variables (if any defaults are needed)
# ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/main.js"]
