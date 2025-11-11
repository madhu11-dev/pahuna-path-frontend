# Use Node.js for development
FROM node:18-alpine

WORKDIR /app

# Copy only package files first
COPY package*.json ./
RUN npm install

# Copy everything else
COPY . .

# Expose React’s default port
EXPOSE 3000

# Start React in development mode
CMD ["npm", "start"]
