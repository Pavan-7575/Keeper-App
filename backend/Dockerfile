FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package manifest files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy backend source files
COPY . .

# Expose backend port
EXPOSE 5000

# Set default environment variables
ENV PORT=5000
ENV NODE_ENV=production

# Command to start backend server
CMD ["npm", "start"]
