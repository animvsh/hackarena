# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port 8080
EXPOSE 8080

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]



