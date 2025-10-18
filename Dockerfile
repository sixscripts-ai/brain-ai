# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 80

# Set environment to production
ENV NODE_ENV=production
ENV PORT=80

# Start the application
CMD ["npm", "start"]
